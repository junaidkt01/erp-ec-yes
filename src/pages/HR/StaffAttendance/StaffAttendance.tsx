// src/pages/HR/StaffAttendance/StaffAttendance.tsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { InputField } from "../../../components/InputFields/InputFields";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import AttendanceButton, { type StatusType } from "../../../components/AttendanceButton/AttendanceButton";
import { useFetchAllRoles } from "../../../hooks/useRoles";
import { useFetchAllStaff } from "../../../hooks/useStaff";
import {
  useAddStaffAttendance,
  useFetchStaffAttendance,
  type CreateStaffAttendanceItem,
} from "../../../hooks/useStaffAttendance";
import { BASE_URL } from "../../../api/endpoints";
import { CheckCheck, RotateCcw } from "lucide-react";
import "./StaffAttendance.scss";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const COLUMNS: Column[] = [
  { key: "staff_code", title: "Staff ID" },
  { key: "photo", title: "Image" },
  { key: "name", title: "Staff Name" },
  { key: "role", title: "Role" },
];

const ITEMS_PER_PAGE = 10;

const getInitialFilter = () => ({
  role_id: "" as string | number,
  attendance_date: new Date(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatDate = (dateInput: Date | string | undefined): string => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const StaffAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [tableSearch, setTableSearch] = useState("");

  // Filter state
  const [filterData, setFilterData] = useState(getInitialFilter);
  const [filteredData, setFilteredData] = useState(getInitialFilter);
  const [hasSearched, setHasSearched] = useState(false);

  // Per-row attendance & note states
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string | number, StatusType>>({});
  const [notes, setNotes] = useState<Record<string | number, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string | number, boolean>>({});

  // Remote data: Roles
  const { data: roles = [] } = useFetchAllRoles();

  const roleOptions = useMemo(() => {
    return [
      { label: "All Roles", value: "" },
      ...roles.map((r: any) => ({
        label: r.display_name || r.name,
        value: r.id,
      })),
    ];
  }, [roles]);

  // Remote data: All Staff (filtered by role if selected)
  const { data: staffData, isLoading: isStaffLoading } = useFetchAllStaff(
    1,
    hasSearched
      ? {
          role_id: filteredData.role_id ? Number(filteredData.role_id) : undefined,
        }
      : undefined
  );

  // Remote data: Existing Staff Attendance records for the selected date
  const {
    data: attendanceRecords = [],
    isFetching: isAttendanceFetching,
    refetch,
  } = useFetchStaffAttendance(
    {
      attendance_date: filteredData.attendance_date,
      role_id: filteredData.role_id || undefined,
    },
    { enabled: hasSearched }
  );

  const { mutate: addStaffAttendance, isPending: isSubmitting } = useAddStaffAttendance();

  // Combine Staff list with existing attendance records for the chosen date
  const combinedStaffRows = useMemo(() => {
    if (!hasSearched) return [];

    const rawStaffList: any[] = Array.isArray(staffData)
      ? staffData
      : Array.isArray(staffData?.data)
      ? staffData.data
      : [];

    const attendanceMap = new Map<number, any>();
    attendanceRecords.forEach((att) => {
      if (att.staff_id) {
        attendanceMap.set(Number(att.staff_id), att);
      }
    });

    return rawStaffList.map((st: any) => {
      const existing = attendanceMap.get(Number(st.id));
      const backendStatus = (existing?.status?.toLowerCase() || "") as StatusType | "";
      const backendNote = existing?.note || "";

      const roleObj = roles.find((r: any) => r.id === st.role_id);
      const roleName = st.role || roleObj?.display_name || roleObj?.name || "-";

      let photoUrl = "/teacher.png";
      if (st.photo) {
        photoUrl = st.photo.startsWith("http")
          ? st.photo
          : `${BASE_URL}/public/${st.photo}`;
      } else if (existing?.photo) {
        photoUrl = existing.photo.startsWith("http")
          ? existing.photo
          : `${BASE_URL}/public/${existing.photo}`;
      }

      return {
        id: st.id,
        staff_id: st.id,
        staff_code: st.staff_code || st.staff_no || `Staff #${st.id}`,
        name: st.full_name || st.name || "-",
        role: roleName,
        photo: photoUrl,
        status: backendStatus,
        note: backendNote,
        attendance_id: existing?.id,
        raw: st,
      };
    });
  }, [hasSearched, staffData, attendanceRecords, roles]);

  // Client-side search within table
  const filteredTableRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return combinedStaffRows;
    return combinedStaffRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.staff_code.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
    );
  }, [combinedStaffRows, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredTableRows.length / ITEMS_PER_PAGE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredTableRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTableRows, page]);

  // Attendance Statistics
  const stats = useMemo(() => {
    if (!combinedStaffRows || combinedStaffRows.length === 0) {
      return { total: 0, present: 0, late: 0, absent: 0, halfDay: 0, leave: 0, unmarked: 0 };
    }
    let present = 0;
    let late = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;
    let unmarked = 0;

    combinedStaffRows.forEach((row) => {
      const rowKey = row.staff_id;
      const backendStatus = (row.status?.toLowerCase() || "") as StatusType | "";
      const status = selectedStatuses[rowKey] ?? (backendStatus || undefined);

      if (status === "present") present++;
      else if (status === "late") late++;
      else if (status === "absent") absent++;
      else if (status === "half-day") halfDay++;
      else if (status === "leave") leave++;
      else unmarked++;
    });

    return {
      total: combinedStaffRows.length,
      present,
      late,
      absent,
      halfDay,
      leave,
      unmarked,
    };
  }, [combinedStaffRows, selectedStatuses]);

  // Bulk Actions
  const handleMarkAllStatus = (status: StatusType) => {
    if (!combinedStaffRows || combinedStaffRows.length === 0) return;
    const newStatuses: Record<string | number, StatusType> = {};
    combinedStaffRows.forEach((row) => {
      newStatuses[row.staff_id] = status;
    });
    setSelectedStatuses((prev) => ({ ...prev, ...newStatuses }));
    toast.info(`Marked all staff as ${status.charAt(0).toUpperCase() + status.slice(1)}`);
  };

  const handleResetAllStatuses = () => {
    setSelectedStatuses({});
    setNotes({});
    toast.info("Reset all staff attendance markings");
  };

  const handleStatusClick = (rowKey: string | number, status: StatusType) => () => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [rowKey]: status,
    }));
  };

  // Filter handlers
  const handleSearch = () => {
    setSelectedStatuses({});
    setNotes({});
    setExpandedNotes({});
    setPage(1);

    const isSame =
      hasSearched &&
      String(filterData.role_id) === String(filteredData.role_id) &&
      formatDate(filterData.attendance_date) === formatDate(filteredData.attendance_date);

    if (isSame) {
      refetch();
    } else {
      setFilteredData({ ...filterData });
      setHasSearched(true);
    }
  };

  const handleResetFilterData = () => {
    const initial = getInitialFilter();
    setFilterData(initial);
    setFilteredData(initial);
    setSelectedStatuses({});
    setNotes({});
    setExpandedNotes({});
    setHasSearched(false);
    setPage(1);
    setTableSearch("");
  };

  // Submit attendance handler
  const handleSubmitAttendance = () => {
    if (!combinedStaffRows || combinedStaffRows.length === 0) {
      toast.warning("No staff attendance data to submit. Please search first.");
      return;
    }

    const formattedDate = formatDate(filteredData.attendance_date);

    const payload: CreateStaffAttendanceItem[] = combinedStaffRows.map((row) => {
      const rowKey = row.staff_id;
      const backendStatus = (row.status?.toLowerCase() || "") as StatusType | "";
      const status = selectedStatuses[rowKey] ?? (backendStatus || "present");
      const note = notes[rowKey] ?? row.note ?? "";

      return {
        staff_id: Number(row.staff_id),
        date: formattedDate,
        status,
        note,
      };
    });

    addStaffAttendance(payload, {
      onSuccess: () => {
        toast.success("Staff attendance submitted successfully");
        navigate(-1);
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to submit staff attendance. Please try again."
        );
      },
    });
  };

  const isFetching = isStaffLoading || isAttendanceFetching;

  return (
    <div className="page_wrapper">
      <div className="staff_attendance">
        {/* Filter Panel */}
        <TableWrapper title="Staff Attendance">
          <div className="search_screen">
            <p className="search_screen_title">Select Criteria</p>
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    value={filterData.role_id}
                    label="Role"
                    placeholder="Select role"
                    options={roleOptions}
                    onChange={(value) =>
                      setFilterData((prev) => ({
                        ...prev,
                        role_id: value,
                      }))
                    }
                  />
                  <InputField
                  readOnly
                    name="attendance_date"
                    type="date"
                    label="Attendance Date"
                    value={filterData.attendance_date}
                    placeHolder="Select date"
                    onChange={(value) =>
                      setFilterData((prev) => ({
                        ...prev,
                        attendance_date: value as any,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Reset" onClick={handleResetFilterData} />
                <PrimaryButton
                  title="Search"
                  isLoading={isFetching}
                  onClick={handleSearch}
                />
              </div>
            </div>
          </div>
        </TableWrapper>

        {/* Attendance Content */}
        <TableWrapper
          isSearchBar
          title="Staff Attendance List"
          searchValue={tableSearch}
          searchOnchange={(val) => {
            setTableSearch(val);
            setPage(1);
          }}
        >
          {/* Attendance Stats & Bulk Actions Toolbar */}
          {hasSearched && combinedStaffRows.length > 0 && (
            <div className="attendance_toolbar">
              <div className="stats_chips">
                <span className="stat_chip total">
                  Total: <strong>{stats.total}</strong>
                </span>
                <span className="stat_chip present">
                  <span className="dot" /> Present: <strong>{stats.present}</strong>
                </span>
                <span className="stat_chip absent">
                  <span className="dot" /> Absent: <strong>{stats.absent}</strong>
                </span>
                <span className="stat_chip late">
                  <span className="dot" /> Late: <strong>{stats.late}</strong>
                </span>
                <span className="stat_chip leave">
                  <span className="dot" /> Leave: <strong>{stats.leave}</strong>
                </span>
                {stats.unmarked > 0 && (
                  <span className="stat_chip unmarked">
                    Unmarked: <strong>{stats.unmarked}</strong>
                  </span>
                )}
              </div>

              <div className="bulk_actions">
                <button
                  type="button"
                  className="bulk_btn mark_present_btn"
                  onClick={() => handleMarkAllStatus("present")}
                  title="Mark all as present"
                >
                  <CheckCheck size={16} />
                  <span>Mark All Present</span>
                </button>
                <button
                  type="button"
                  className="bulk_btn reset_btn"
                  onClick={handleResetAllStatuses}
                  title="Reset marked statuses"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── DESKTOP VIEW: Traditional DataTable ─── */}
          <div className="attendance_desktop_view">
            <DataTable
              columns={COLUMNS}
              data={paginatedRows}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              emptyMessage={
                !hasSearched
                  ? "Select criteria and click Search to view staff."
                  : "No staff found for the selected criteria."
              }
              attendance={(row) => {
                const rowKey = row.staff_id;
                const backendStatus = (row.status?.toLowerCase() || "") as
                  | StatusType
                  | "";
                const activeStatus: StatusType | undefined =
                  selectedStatuses[rowKey] ?? (backendStatus || undefined);

                return (
                  <div className="attendance_buttons">
                    <AttendanceButton
                      status="present"
                      title="Present"
                      active={activeStatus === "present"}
                      onClick={handleStatusClick(rowKey, "present")}
                    />
                    <AttendanceButton
                      status="late"
                      title="Late"
                      active={activeStatus === "late"}
                      onClick={handleStatusClick(rowKey, "late")}
                    />
                    <AttendanceButton
                      status="absent"
                      title="Absent"
                      active={activeStatus === "absent"}
                      onClick={handleStatusClick(rowKey, "absent")}
                    />
                    <AttendanceButton
                      status="half-day"
                      title="Half Day"
                      active={activeStatus === "half-day"}
                      onClick={handleStatusClick(rowKey, "half-day")}
                    />
                    <AttendanceButton
                      status="leave"
                      title="Leave"
                      shortTitle="Le"
                      active={activeStatus === "leave"}
                      onClick={handleStatusClick(rowKey, "leave")}
                    />
                  </div>
                );
              }}
              note={(row) => {
                const rowKey = row.staff_id;
                return (
                  <div style={{ width: "350px" }}>
                    <InputField
                      value={notes[rowKey] ?? row.note ?? ""}
                      type="text"
                      placeHolder="Enter note"
                      onChange={(val) => {
                        const text =
                          typeof val === "object" && val?.target
                            ? val.target.value
                            : val;
                        setNotes((prev) => ({
                          ...prev,
                          [rowKey]: text as string,
                        }));
                      }}
                    />
                  </div>
                );
              }}
            />
          </div>

          {/* ─── MOBILE VIEW: Touch-Friendly Card List ─── */}
          <div className="attendance_mobile_view">
            {!hasSearched ? (
              <div className="mobile_empty_state">
                Select criteria and click Search to mark attendance.
              </div>
            ) : filteredTableRows.length === 0 ? (
              <div className="mobile_empty_state">
                No staff found matching your criteria.
              </div>
            ) : (
              <>
                {paginatedRows.map((row) => {
                  const rowKey = row.staff_id;
                  const backendStatus = (row.status?.toLowerCase() || "") as
                    | StatusType
                    | "";
                  const activeStatus: StatusType | undefined =
                    selectedStatuses[rowKey] ?? (backendStatus || undefined);
                  const isNoteOpen = expandedNotes[rowKey] || Boolean(notes[rowKey] || row.note);

                  return (
                    <div
                      key={rowKey}
                      className={`mobile_student_card ${activeStatus ? `status_${activeStatus.replace("-", "_")}` : ""}`}
                    >
                      {/* Card Top: Avatar, Name, Staff Code, Role & Current Status */}
                      <div className="card_header">
                        <img
                          className="student_avatar"
                          src={row.photo || "/teacher.png"}
                          alt={row.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/teacher.png";
                          }}
                        />
                        <div className="student_meta">
                          <div className="name_row">
                            <span className="student_name" title={row.name}>
                              {row.name}
                            </span>
                            {activeStatus ? (
                              <span className={`status_chip status_${activeStatus.replace("-", "_")}`}>
                                {activeStatus === "half-day" ? "Half Day" : activeStatus}
                              </span>
                            ) : (
                              <span className="status_chip status_unmarked">Unmarked</span>
                            )}
                          </div>
                          <div className="details_row">
                            <span className="roll_pill">
                              ID: <strong>{row.staff_code}</strong>
                            </span>
                            <span className="id_pill">
                              Role: <strong>{row.role}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Attendance 5-Button Grid */}
                      <div className="attendance_grid">
                        <AttendanceButton
                          status="present"
                          title="Present"
                          shortTitle="Present"
                          active={activeStatus === "present"}
                          onClick={handleStatusClick(rowKey, "present")}
                        />
                        <AttendanceButton
                          status="late"
                          title="Late"
                          shortTitle="Late"
                          active={activeStatus === "late"}
                          onClick={handleStatusClick(rowKey, "late")}
                        />
                        <AttendanceButton
                          status="absent"
                          title="Absent"
                          shortTitle="Absent"
                          active={activeStatus === "absent"}
                          onClick={handleStatusClick(rowKey, "absent")}
                        />
                        <AttendanceButton
                          status="half-day"
                          title="Half Day"
                          shortTitle="Half"
                          active={activeStatus === "half-day"}
                          onClick={handleStatusClick(rowKey, "half-day")}
                        />
                        <AttendanceButton
                          status="leave"
                          title="Leave"
                          shortTitle="Leave"
                          active={activeStatus === "leave"}
                          onClick={handleStatusClick(rowKey, "leave")}
                        />
                      </div>

                      {/* Note Section */}
                      <div className="note_section">
                        {isNoteOpen ? (
                          <div className="note_input_box">
                            <InputField
                              value={notes[rowKey] ?? row.note ?? ""}
                              type="text"
                              placeHolder="Add note for this staff..."
                              onChange={(val) => {
                                const text =
                                  typeof val === "object" && val?.target
                                    ? val.target.value
                                    : val;
                                setNotes((prev) => ({ ...prev, [rowKey]: text as string }));
                              }}
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="add_note_btn"
                            onClick={() => setExpandedNotes((prev) => ({ ...prev, [rowKey]: true }))}
                          >
                            + Add Note
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mobile_pagination">
                    <button
                      type="button"
                      className="page_nav_btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <span className="page_indicator">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="page_nav_btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submit Attendance Button */}
          {hasSearched && combinedStaffRows.length > 0 && (
            <div className="submit_attendance_button">
              <PrimaryButton
                onClick={handleSubmitAttendance}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                title={isSubmitting ? "Submitting..." : `Submit Attendance (${combinedStaffRows.length} Staff)`}
              />
            </div>
          )}
        </TableWrapper>
      </div>
    </div>
  );
};

export default StaffAttendance;
