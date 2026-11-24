// src/pages/StaffReport/StaffAttendanceReport/StaffAttendanceReport.tsx

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import TableWrapper from "../../../components/TableWrapper";
import { useFetchAllRoles } from "../../../hooks/useRoles";
import { useFetchGeneralSettings } from "../../../hooks/useGeneralSettings";
import { useFetchMonthlyStaffAttendanceReport } from "../../../hooks/useStaffAttendance";
import StaffAttendanceReportTable, {
  MONTH_NAMES,
} from "./StaffAttendanceReportTable";
import { printMonthlyStaffAttendanceReport } from "./StaffAttendancePrint";

interface StaffReportFilter {
  role_id: string | number;
}

const EMPTY_FILTER: StaffReportFilter = {
  role_id: "",
};

const MONTH_OPTIONS = MONTH_NAMES.map((m, idx) => ({
  label: m,
  value: idx + 1,
}));

const StaffAttendanceReport: React.FC = () => {
  const today = new Date();

  // Filter state
  const [filterData, setFilterData] = useState<StaffReportFilter>(EMPTY_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<StaffReportFilter | null>(null);

  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [search, setSearch] = useState("");

  const { data: roles = [] } = useFetchAllRoles();
  const { data: generalSettings } = useFetchGeneralSettings();

  // Monthly report query
  const {
    data: monthlyReport,
    isFetching,
    isError,
    refetch,
  } = useFetchMonthlyStaffAttendanceReport(
    {
      year,
      month,
      role_id: appliedFilter?.role_id ? appliedFilter.role_id : undefined,
    },
    { enabled: appliedFilter !== null }
  );

  const roleOptions = useMemo(() => {
    return [
      { label: "All Roles", value: "" },
      ...roles.map((r: any) => ({
        label: r.display_name || r.name,
        value: r.id,
      })),
    ];
  }, [roles]);

  const yearOptions = useMemo(() => {
    const currentY = new Date().getFullYear();
    const years = new Set([
      currentY - 2,
      currentY - 1,
      currentY,
      currentY + 1,
      year,
    ]);
    return [...years].sort((a, b) => a - b);
  }, [year]);

  const handleSearch = () => {
    const isSame =
      appliedFilter !== null &&
      String(appliedFilter.role_id) === String(filterData.role_id);

    if (isSame) {
      refetch();
    } else {
      setAppliedFilter({ ...filterData });
    }
  };

  const handleReset = () => {
    setFilterData(EMPTY_FILTER);
    setAppliedFilter(null);
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
    setSearch("");
  };

  const handleMonthYearChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
  };

  const records = useMemo(() => {
    return monthlyReport?.data ?? [];
  }, [monthlyReport]);

  const handlePrint = () => {
    if (!appliedFilter || !records || records.length === 0) {
      toast.warning("Please search for attendance records before printing.");
      return;
    }

    const selectedRole = appliedFilter.role_id
      ? roleOptions.find((r) => String(r.value) === String(appliedFilter.role_id))
          ?.label || "All"
      : "All";
    const monthName = MONTH_NAMES[month - 1] || "";

    printMonthlyStaffAttendanceReport({
      schoolName:
        generalSettings?.data?.school_name ||
        "RAZA UL ULOOM ISLAMIA HIGHER SECONDARY SCHOOL POONCH",
      schoolAddress: generalSettings?.data?.address || "",
      logoUrl: generalSettings?.data?.logo || "",
      roleName: selectedRole,
      monthName,
      month,
      year,
      records,
    });
  };

  return (
    <div className="page_wrapper">
      <div className="students-attendance-report staff-attendance-report">
        {/* Filter Panel */}
        <TableWrapper title="Staff Attendance Report">
          <div className="search_screen">
            <p className="search_screen_title">Select Criteria</p>
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    value={filterData.role_id}
                    name="role_id"
                    label="Role"
                    placeholder="Select role"
                    options={roleOptions}
                    onChange={(value) =>
                      setFilterData((prev) => ({ ...prev, role_id: value }))
                    }
                  />
                  <CustomSelect
                    value={month}
                    name="month"
                    label="Month"
                    placeholder="Select month"
                    options={MONTH_OPTIONS}
                    onChange={(value) => setMonth(Number(value))}
                  />
                  <CustomSelect
                    value={year}
                    name="year"
                    label="Year"
                    placeholder="Select year"
                    options={yearOptions.map((y) => ({
                      label: String(y),
                      value: y,
                    }))}
                    onChange={(value) => setYear(Number(value))}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Reset" onClick={handleReset} />
                <PrimaryButton
                  title="Search"
                  isLoading={isFetching}
                  onClick={handleSearch}
                />
              </div>
            </div>
          </div>
        </TableWrapper>

        {/* Report Table */}
        <TableWrapper
          onClick={handlePrint}
          isAddButton
          addButtonTitle="Print"
          isSearchBar
          title="Staff Attendance List"
          searchValue={search}
          searchOnchange={setSearch}
        >
          <StaffAttendanceReportTable
            records={records}
            month={month}
            year={year}
            yearOptions={yearOptions}
            onMonthYearChange={handleMonthYearChange}
            search={search}
            isLoading={isFetching}
            isError={isError}
            hasSearched={appliedFilter !== null}
          />
        </TableWrapper>
      </div>
    </div>
  );
};

export default StaffAttendanceReport;
