import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, Copy, Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import {
  useFetchAllExamSchedules,
  useAddExamSchedule,
  useDeleteExamSchedule,
} from "../../../hooks/useExamination";

interface ScheduleRow {
  id: number | string;
  date: string;
  day: string;
  subject: string;
  class_section: string;
  teacher: string;
  time: string;
  duration: string;
  room: string;
  full_data?: any;
}

interface CreateScheduleRow {
  id: number | string;
  subject: string;
  subject_id?: number | string;
  class: string;
  class_id?: number | string;
  section: string;
  section_id?: number | string;
  teacher: string;
  teacher_id?: number | string;
  date: string;
  start_time: string;
  end_time: string;
  room?: string;
  duration?: string;
}

const defaultSchedules: ScheduleRow[] = [
  { id: 1, date: "2026-11-20", day: "Friday", subject: "Physics", class_section: "5 B", teacher: "Jhon Martin", time: "09:00 AM to 09:45 AM", duration: "45 Minutes", room: "235432" },
  { id: 2, date: "2026-11-21", day: "Saturday", subject: "Chemistry", class_section: "5 B", teacher: "Robert Smith", time: "09:00 AM to 09:45 AM", duration: "45 Minutes", room: "235432" },
];

const ITEMS_PER_PAGE = 10;

const ExamSchedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [filterExam, setFilterExam] = useState("1");
  const [filterClass, setFilterClass] = useState("5");
  const [filterSection, setFilterSection] = useState("2");

  const [committedExam, setCommittedExam] = useState("1");
  const [committedClass, setCommittedClass] = useState("5");
  const [committedSection, setCommittedSection] = useState("2");

  const { data: apiData } = useFetchAllExamSchedules({
    exam_id: committedExam,
    class_id: committedClass,
    section_id: committedSection,
  });
  const addScheduleMutation = useAddExamSchedule();
  const deleteScheduleMutation = useDeleteExamSchedule();

  const { data: studentClasses } = useFetchAllStudentClasses();
  const { data: sectionsData } = useFetchAllSections();

  const classOptions = useMemo(() => {
    const raw = Array.isArray(studentClasses?.data) ? studentClasses.data : Array.isArray(studentClasses) ? studentClasses : [];
    if (raw.length === 0) return [{ label: "Class 5", value: "5" }, { label: "Class 6", value: "6" }];
    return raw.map((c: any) => ({ label: c.name || `Class ${c.id}`, value: String(c.id) }));
  }, [studentClasses]);

  const sectionOptions = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data) ? sectionsData.data : Array.isArray(sectionsData) ? sectionsData : [];
    if (raw.length === 0) return [{ label: "Section A", value: "1" }, { label: "Section B", value: "2" }];
    return raw.map((s: any) => ({ label: s.name || `Section ${s.id}`, value: String(s.id) }));
  }, [sectionsData]);

  // Inline create table rows
  const [createRows, setCreateRows] = useState<CreateScheduleRow[]>([
    { id: 1, subject: "Physics", subject_id: 3, class: "5", class_id: 5, section: "B", section_id: 2, teacher: "Jhon Martin", teacher_id: 10, date: "2026-11-20", start_time: "09:00:00", end_time: "09:45:00", duration: "45 Minutes", room: "235432" },
    { id: 2, subject: "Chemistry", subject_id: 4, class: "5", class_id: 5, section: "B", section_id: 2, teacher: "Robert Smith", teacher_id: 11, date: "2026-11-21", start_time: "09:00:00", end_time: "09:45:00", duration: "45 Minutes", room: "235432" },
  ]);

  const handleDuplicateRow = (row: CreateScheduleRow) => {
    setCreateRows((prev) => [...prev, { ...row, id: Date.now() }]);
  };

  const handleRemoveRow = (id: number | string) => {
    setCreateRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddRow = () => {
    setCreateRows((prev) => [
      ...prev,
      { id: Date.now(), subject: "", subject_id: 3, class: filterClass, class_id: filterClass, section: filterSection, section_id: filterSection, teacher: "", teacher_id: 10, date: "", start_time: "09:00:00", end_time: "09:45:00", duration: "45 Minutes", room: "101" },
    ]);
  };

  const handleSearch = () => {
    setCommittedExam(filterExam);
    setCommittedClass(filterClass);
    setCommittedSection(filterSection);
    setPage(1);
    toast.success("Schedule criteria applied");
  };

  const handleReset = () => {
    setFilterExam("1");
    setFilterClass("5");
    setFilterSection("2");
    toast.info("Criteria reset");
  };

  const handleSaveAllSchedules = async () => {
    try {
      for (const row of createRows) {
        await addScheduleMutation.mutateAsync({
          exam_id: Number(committedExam) || 1,
          class_id: Number(row.class_id || committedClass) || 5,
          section_id: Number(row.section_id || committedSection) || 2,
          subject_id: Number(row.subject_id) || 3,
          teacher_id: Number(row.teacher_id) || 10,
          exam_date: row.date || "2026-11-20",
          start_time: row.start_time.length === 5 ? `${row.start_time}:00` : row.start_time || "09:00:00",
          end_time: row.end_time.length === 5 ? `${row.end_time}:00` : row.end_time || "09:45:00",
          duration: row.duration || "45 Minutes",
          room: row.room || "235432",
        });
      }
      toast.success("Exam schedules created successfully");
      setViewMode("list");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save exam schedules");
    }
  };

  // Schedule list columns
  const columns: Column[] = [
    { key: "date_day", title: "Date & Day" },
    { key: "subject", title: "Subject" },
    { key: "class_section", title: "Class & Section" },
    { key: "teacher", title: "Teacher" },
    { key: "time", title: "Time" },
    { key: "duration", title: "Duration" },
    { key: "room", title: "Room" },
  ];

  const rawList: ScheduleRow[] = useMemo(() => {
    if (apiData?.data && Array.isArray(apiData.data)) {
      return apiData.data.map((item: any) => ({
        id: item.id,
        date: item.exam_date || item.date || "-",
        day: item.day || "Day",
        subject: item.subject?.name || item.subject_id || "-",
        class_section: `${item.class?.name || item.class_id || ""} ${item.section?.name || item.section_id || ""}`,
        teacher: item.teacher?.name || item.teacher_name || "Teacher",
        time: `${item.start_time || ""} - ${item.end_time || ""}`,
        duration: item.duration || "45 Minutes",
        room: item.room || "-",
        full_data: item,
      }));
    }
    return defaultSchedules;
  }, [apiData]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter(
      (s) =>
        s.subject.toLowerCase().includes(q) ||
        s.teacher.toLowerCase().includes(q) ||
        s.date.toLowerCase().includes(q) ||
        s.day.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q)
    );
  }, [rawList, searchTerm]);

  const tableData = useMemo(() => {
    const paginated = filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return paginated.map((item) => ({
      id: item.id,
      date_day: (
        <div>
          <div style={{ fontWeight: 500, color: "#1e293b" }}>{item.date}</div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>{item.day}</div>
        </div>
      ),
      subject: item.subject,
      class_section: item.class_section,
      teacher: item.teacher,
      time: item.time,
      duration: item.duration,
      room: item.room,
      full_data: item,
    }));
  }, [filteredList, page]);

  return (
    <div className="page_wrapper">
      <div className="exam_schedule_page">
        {/* 1. Criteria Filter Section */}
        <TableWrapper
          title="Select Criteria"
          isAddButton={viewMode === "list"}
          addButtonTitle="Add Exam Schedule"
          onClick={() => setViewMode(viewMode === "list" ? "create" : "list")}
        >
          <div className="search_screen">
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    label="Exam"
                    options={[
                      { label: "First Term", value: "1" },
                      { label: "Second Term", value: "2" },
                      { label: "Third Term", value: "3" },
                    ]}
                    value={filterExam}
                    onChange={(v: any) => setFilterExam(v)}
                  />
                  <CustomSelect
                    label="Class"
                    options={classOptions}
                    value={filterClass}
                    onChange={(v: any) => setFilterClass(v)}
                  />
                  <CustomSelect
                    label="Section"
                    options={sectionOptions}
                    value={filterSection}
                    onChange={(v: any) => setFilterSection(v)}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Reset" onClick={handleReset} />
                <PrimaryButton title="Search" onClick={handleSearch} />
              </div>
            </div>
          </div>
        </TableWrapper>

        {/* 2. Schedule View / Creation Section */}
        {viewMode === "list" ? (
          <TableWrapper
            title={`Exam Schedule | Exam ${committedExam} (Class ${committedClass})`}
            isSearchBar
            searchValue={searchTerm}
            searchOnchange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          >
            <DataTable
              columns={columns}
              data={tableData}
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE))}
              onPageChange={(p) => setPage(p)}
              actions={(row) => (
                <div className="actions">
                  <button
                    type="button"
                    className="delete_btn hvr_zm_out"
                    title="Delete"
                    onClick={async () => {
                      try {
                        await deleteScheduleMutation.mutateAsync(row.full_data?.id || row.id);
                        toast.success("Schedule deleted");
                      } catch {
                        toast.error("Failed to delete schedule");
                      }
                    }}
                  >
                    <img src="/svgs/delete.svg" alt="Delete" />
                  </button>
                </div>
              )}
            />
          </TableWrapper>
        ) : (
          <TableWrapper
            title={`Exam Schedule Create | Exam ${committedExam} (Class ${committedClass})`}
            isAddButton
            addButtonTitle="Add Row"
            onClick={handleAddRow}
          >
            <div style={{ overflowX: "auto", marginBottom: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", textAlign: "left", fontSize: "13px" }}>
                    <th style={{ padding: "12px" }}>Subject</th>
                    <th style={{ padding: "12px" }}>Class</th>
                    <th style={{ padding: "12px" }}>Section</th>
                    <th style={{ padding: "12px" }}>Teacher</th>
                    <th style={{ padding: "12px" }}>Date</th>
                    <th style={{ padding: "12px" }}>Start Time</th>
                    <th style={{ padding: "12px" }}>End Time</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {createRows.map((row) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px" }}>
                        <InputField
                          type="text"
                          placeHolder="Subject"
                          value={row.subject}
                          onChange={(e: any) => {
                            const v = e?.target ? e.target.value : e;
                            setCreateRows((prev) => prev.map((r) => r.id === row.id ? { ...r, subject: v } : r));
                          }}
                        />
                      </td>
                      <td style={{ padding: "8px", width: "90px" }}>
                        <InputField
                          type="text"
                          placeHolder="Class"
                          value={row.class}
                          onChange={(e: any) => {
                            const v = e?.target ? e.target.value : e;
                            setCreateRows((prev) => prev.map((r) => r.id === row.id ? { ...r, class: v } : r));
                          }}
                        />
                      </td>
                      <td style={{ padding: "8px", width: "90px" }}>
                        <InputField
                          type="text"
                          placeHolder="Section"
                          value={row.section}
                          onChange={(e: any) => {
                            const v = e?.target ? e.target.value : e;
                            setCreateRows((prev) => prev.map((r) => r.id === row.id ? { ...r, section: v } : r));
                          }}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <InputField
                          type="text"
                          placeHolder="Teacher"
                          value={row.teacher}
                          onChange={(e: any) => {
                            const v = e?.target ? e.target.value : e;
                            setCreateRows((prev) => prev.map((r) => r.id === row.id ? { ...r, teacher: v } : r));
                          }}
                        />
                      </td>
                      <td style={{ padding: "8px", width: "150px" }}>
                        <InputField
                          type="date"
                          placeHolder="Date"
                          value={row.date}
                          onChange={(e: any) => {
                            const v = e?.target ? e.target.value : e;
                            setCreateRows((prev) => prev.map((r) => r.id === row.id ? { ...r, date: v } : r));
                          }}
                        />
                      </td>
                      <td style={{ padding: "8px", width: "120px" }}>
                        <InputField
                          type="time"
                          placeHolder="Start Time"
                          value={row.start_time}
                          onChange={(e: any) => {
                            const v = e?.target ? e.target.value : e;
                            setCreateRows((prev) => prev.map((r) => r.id === row.id ? { ...r, start_time: v } : r));
                          }}
                        />
                      </td>
                      <td style={{ padding: "8px", width: "120px" }}>
                        <InputField
                          type="time"
                          placeHolder="End Time"
                          value={row.end_time}
                          onChange={(e: any) => {
                            const v = e?.target ? e.target.value : e;
                            setCreateRows((prev) => prev.map((r) => r.id === row.id ? { ...r, end_time: v } : r));
                          }}
                        />
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleDuplicateRow(row)}
                            title="Duplicate"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            title="Delete"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "12px" }}>
              <SecondaryButton title="Print" onClick={() => window.print()} />
              <PrimaryButton
                title={addScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
                icon={<Save size={16} />}
                onClick={handleSaveAllSchedules}
                disabled={addScheduleMutation.isPending}
              />
            </div>
          </TableWrapper>
        )}
      </div>
    </div>
  );
};

export default ExamSchedule;
