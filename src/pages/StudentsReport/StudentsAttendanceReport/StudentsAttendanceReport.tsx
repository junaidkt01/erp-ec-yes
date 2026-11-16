import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import TableWrapper from "../../../components/TableWrapper"
import { useFetchStudentAttendanceList } from "../../../hooks/useStudentAttendance"
import { useFetchAllStudentClasses, type ClassItem } from "../../../hooks/useStudentClass"
import { useFetchAllSections, type SectionItem } from "../../../hooks/useSections"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear"
import { useFetchGeneralSettings } from "../../../hooks/useGeneralSettings"
import StudentsAttendanceReportTable, { MONTH_NAMES } from "./StudentsAttendanceReportTable"
import { printMonthlyAttendanceReport } from "./StudentsAttendancePrint"

interface ReportFilter {
    academic_year_id: string | number;
    class_id: string | number;
    section_id: string | number;
}

const EMPTY_FILTER: ReportFilter = {
    academic_year_id: "",
    class_id: "",
    section_id: "",
};

const MONTH_OPTIONS = MONTH_NAMES.map((m, idx) => ({ label: m, value: idx + 1 }));

const StudentsAttendanceReport = () => {
    const today = new Date();

    // Draft filter (being edited) vs committed filter (sent to the API on Search)
    const [filterData, setFilterData] = useState<ReportFilter>(EMPTY_FILTER);
    const [appliedFilter, setAppliedFilter] = useState<ReportFilter | null>(null);

    // Month/year are applied client-side (the API has no month range filter),
    // so they take effect immediately without a refetch.
    const [month, setMonth] = useState<number>(today.getMonth() + 1);
    const [year, setYear] = useState<number>(today.getFullYear());

    const [search, setSearch] = useState("");

    const { data: studentClasses } = useFetchAllStudentClasses();
    const { data: sections } = useFetchAllSections();
    const { data: academicYears } = useFetchAllAcademicYears();
    const { data: generalSettings } = useFetchGeneralSettings();

    const { data: records, isFetching, isError, refetch } = useFetchStudentAttendanceList(
        appliedFilter ?? undefined,
        { enabled: appliedFilter !== null }
    );

    const currentAcademicYearId = useMemo(
        () => academicYears?.find((y) => y.is_current === 1)?.id,
        [academicYears]
    );

    // Pre-select the current academic year once it loads
    useEffect(() => {
        if (currentAcademicYearId && !filterData.academic_year_id) {
            setFilterData((prev) => ({ ...prev, academic_year_id: currentAcademicYearId }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAcademicYearId]);

    const academicYearOptions = useMemo(
        () => academicYears?.map((y) => ({ label: y.name, value: y.id })) ?? [],
        [academicYears]
    );

    const classOptions = useMemo(
        () => studentClasses?.map((cls: ClassItem) => ({ label: cls.name, value: cls.id })) ?? [],
        [studentClasses]
    );

    const sectionOptions = useMemo(() => {
        if (!sections) return [];
        const filtered = filterData.class_id
            ? sections.filter((sec: SectionItem) => String(sec.class_id) === String(filterData.class_id))
            : sections;
        return filtered.map((sec: SectionItem) => ({ label: sec.name, value: sec.id }));
    }, [sections, filterData.class_id]);

    const yearOptions = useMemo(() => {
        const currentY = new Date().getFullYear();
        const years = new Set([currentY - 2, currentY - 1, currentY, currentY + 1, year]);
        return [...years].sort((a, b) => a - b);
    }, [year]);

    const handleSearch = () => {
        if (!filterData.class_id) {
            toast.warning("Please select a class");
            return;
        }

        const isSame =
            appliedFilter !== null &&
            String(appliedFilter.academic_year_id) === String(filterData.academic_year_id) &&
            String(appliedFilter.class_id) === String(filterData.class_id) &&
            String(appliedFilter.section_id) === String(filterData.section_id);

        if (isSame) {
            refetch();
        } else {
            setAppliedFilter({ ...filterData });
        }
    };

    const handleReset = () => {
        setFilterData({ ...EMPTY_FILTER, academic_year_id: currentAcademicYearId ?? "" });
        setAppliedFilter(null);
        setMonth(today.getMonth() + 1);
        setYear(today.getFullYear());
        setSearch("");
    };

    const handleMonthYearChange = (m: number, y: number) => {
        setMonth(m);
        setYear(y);
    };

    const handlePrint = () => {
        if (!appliedFilter || !records || records.length === 0) {
            toast.warning("Please search for attendance records before printing.");
            return;
        }

        const selectedClass = classOptions.find((c: any) => String(c.value) === String(appliedFilter.class_id))?.label || "";
        const selectedSection = appliedFilter.section_id
            ? (sectionOptions.find((s: any) => String(s.value) === String(appliedFilter.section_id))?.label || "All")
            : "All";
        const monthName = MONTH_NAMES[month - 1] || "";

        printMonthlyAttendanceReport({
            schoolName: generalSettings?.data?.school_name || "RAZA UL ULOOM ISLAMIA HIGHER SECONDARY SCHOOL POONCH",
            schoolAddress: generalSettings?.data?.address || "",
            logoUrl: generalSettings?.data?.logo || "",
            className: selectedClass,
            sectionName: selectedSection,
            monthName,
            month,
            year,
            records,
        });
    };

    return (
        <div className="page_wrapper">
            <div className="students-attendance-report">
                <TableWrapper title="Students Attendance Report">
                    <div className="search_screen">
                        <p className="search_screen_title">Select Criteria</p>
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        value={filterData.academic_year_id}
                                        name="academic_year_id"
                                        label="Academic Year"
                                        placeholder="Select academic year"
                                        options={academicYearOptions}
                                        onChange={(value) => setFilterData((prev) => ({ ...prev, academic_year_id: value }))}
                                    />
                                    <CustomSelect
                                        value={filterData.class_id}
                                        name="class_id"
                                        label="Class"
                                        placeholder="Select class"
                                        options={classOptions}
                                        onChange={(value) => setFilterData((prev) => ({ ...prev, class_id: value, section_id: "" }))}
                                    />
                                    <CustomSelect
                                        value={filterData.section_id}
                                        name="section_id"
                                        label="Section"
                                        placeholder={filterData.class_id ? "Select section" : "Select a class first"}
                                        options={sectionOptions}
                                        onChange={(value) => setFilterData((prev) => ({ ...prev, section_id: value }))}
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
                                        options={yearOptions.map((y) => ({ label: String(y), value: y }))}
                                        onChange={(value) => setYear(Number(value))}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleReset} />
                                <PrimaryButton title="Search" isLoading={isFetching} onClick={handleSearch} />
                            </div>
                        </div>
                    </div>
                </TableWrapper>

                <TableWrapper onClick={handlePrint} isAddButton addButtonTitle="Print" isSearchBar title="Student Attendance List" searchValue={search} searchOnchange={setSearch}>
                    <StudentsAttendanceReportTable
                        records={records ?? []}
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
    )
}

export default StudentsAttendanceReport;
