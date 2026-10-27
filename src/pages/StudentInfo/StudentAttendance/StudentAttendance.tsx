import { useMemo, useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import { InputField } from "../../../components/InputFields/InputFields"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import AttendanceButton, { type StatusType } from "../../../components/AttendanceButton/AttendanceButton"
import { useAddStudentAttendance, useFetchStudentAttendance, type CreateStudentAttendance } from "../../../hooks/useStudentAttendance"
import { useFetchAllStudentClasses, type ClassItem } from "../../../hooks/useStudentClass"
import { useFetchAllSections, type SectionItem } from "../../../hooks/useSections"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear"
import { toast } from "sonner"
import "./StudentAttendance.scss"

// ---------------------------------------------------------------------------
// Constants -- defined outside component to avoid re-creation on every render
// ---------------------------------------------------------------------------
const COLUMNS: Column[] = [
    { key: "sl", title: "SL" },
    { key: "roll_no", title: "Roll No" },
    { key: "photo", title: "Image" },
    { key: "student_name", title: "Student Name" },
    { key: "student_code", title: "Student ID" },
];

const getInitialFilter = () => ({
    class_id: "" as string | number,
    section_id: "" as string | number,
    attendance_date: new Date(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatDate = (dateInput: Date | string | undefined): string => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    // Use UTC values to avoid timezone-shift bugs
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const toNum = (val: unknown): number | undefined => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const StudentAttendance = () => {
    const [page, setPage] = useState(1);

    // -- Filter UI state (what the user is currently editing) ---------------
    const [filterData, setFilterData] = useState(getInitialFilter);

    // -- Committed filter (applied only when Search is clicked) -------------
    const [filteredData, setFilteredData] = useState(getInitialFilter);

    // -- Per-row attendance state --------------------------------------------
    const [selectedStatuses, setSelectedStatuses] = useState<Record<string | number, StatusType>>({});
    const [notes, setNotes] = useState<Record<string | number, string>>({});

    // -- Remote data ---------------------------------------------------------
    const { data: studentClasses } = useFetchAllStudentClasses();
    const { data: sections } = useFetchAllSections();
    const { data: academicYears } = useFetchAllAcademicYears();

    const { data: studentAttendance, isFetching, refetch } =
        useFetchStudentAttendance(filteredData);

    const { mutate: addStudentAttendance, isPending } = useAddStudentAttendance();

    // -- Derived options -----------------------------------------------------
    const classOptions = useMemo(
        () =>
            studentClasses?.map((cls: ClassItem) => ({
                label: cls.name,
                value: cls.id,
            })) ?? [],
        [studentClasses]
    );

    // Sections fetched from their own endpoint, then filtered client-side
    // by the currently selected class so only relevant sections appear.
    const sectionOptions = useMemo(() => {
        if (!sections) return [];
        const filtered = filterData.class_id
            ? sections.filter(
                  (sec: SectionItem) =>
                      String(sec.class_id) === String(filterData.class_id)
              )
            : sections;
        return filtered.map((sec: SectionItem) => ({
            label: sec.name,
            value: sec.id,
        }));
    }, [sections, filterData.class_id]);

    // Current academic year id (optional -- API field is optional too)
    const currentAcademicYearId = useMemo(
        () => academicYears?.find((y) => y.is_current === 1)?.id,
        [academicYears]
    );

    // -- Filter handlers -----------------------------------------------------
    const handleSearch = () => {
        setFilteredData({ ...filterData });
        // Reset per-row state whenever a new search is performed
        setSelectedStatuses({});
        setNotes({});
        refetch();
    };

    const handleResetFilterData = () => {
        const initial = getInitialFilter();
        setFilterData(initial);
        setFilteredData(initial);
        setSelectedStatuses({});
        setNotes({});
        refetch();
    };

    // -- Submit handler ------------------------------------------------------
    const handleSubmitAttendance = () => {
        if (
            !studentAttendance ||
            !Array.isArray(studentAttendance) ||
            studentAttendance.length === 0
        ) {
            toast.warning("No attendance data to submit. Please search first.");
            return;
        }

        const formattedDate = formatDate(filteredData.attendance_date);

        const payload: CreateStudentAttendance[] = studentAttendance.map((row: any, index: number) => {
            const rowKey =
                row.id ??
                row.student_id ??
                row.student?.id ??
                row.student_code ??
                row.student?.student_code ??
                row.admission_no ??
                index;

            const backendStatus = row.status?.toLowerCase() as StatusType;
            const status = selectedStatuses[rowKey] ?? backendStatus ?? "present";
            const note = notes[rowKey] ?? row.note ?? "";

            // Resolve class_id -- prefer the committed filter value
            const class_id =
                toNum(filteredData.class_id) ??
                toNum(row.class_id) ??
                toNum(row.student?.class_id) ??
                toNum(row.class?.id);

            // Resolve section_id -- prefer the committed filter value
            const section_id =
                toNum(filteredData.section_id) ??
                toNum(row.section_id) ??
                toNum(row.student?.section_id) ??
                toNum(row.section?.id);

            // Resolve student_code -- never fall back to a generic row id
            const student_code =
                row.student_code ||
                row.student?.student_code ||
                row.admission_no ||
                row.student?.admission_no;

            return {
                student_code: student_code ?? "",
                class_id: class_id ?? "",
                section_id: section_id ?? "",
                date: formattedDate,
                status,
                note,
                ...(currentAcademicYearId !== undefined && {
                    academic_year_id: currentAcademicYearId,
                }),
            };
        });

        // Toast fires only after a successful API response
        addStudentAttendance(payload, {
            onSuccess: () => {
                toast.success("Attendance submitted successfully");
            },
            onError: () => {
                toast.error("Failed to submit attendance. Please try again.");
            },
        });
    };

    // -- Render --------------------------------------------------------------
    return (
        <div className="page_wrapper">
            <div className="student_attendance">

                {/* Filter Panel */}
                <TableWrapper title="Student Attendance">
                    <div className="search_screen">
                        <p className="search_screen_title">Select Criteria</p>
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        value={filterData.class_id}
                                        label="Class"
                                        placeholder="Select class"
                                        options={classOptions}
                                        onChange={(value) =>
                                            setFilterData((prev) => ({
                                                ...prev,
                                                class_id: value,
                                                section_id: "",
                                            }))
                                        }
                                    />
                                    <CustomSelect
                                        value={filterData.section_id}
                                        name="section_id"
                                        label="Section"
                                        placeholder={
                                            filterData.class_id
                                                ? "Select section"
                                                : "Select a class first"
                                        }
                                        options={sectionOptions}
                                        onChange={(value) =>
                                            setFilterData((prev) => ({
                                                ...prev,
                                                section_id: value,
                                            }))
                                        }
                                    />
                                    <InputField
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

                {/* Attendance Table */}
                <TableWrapper isSearchBar title="Student Attendance">
                    <DataTable
                        columns={COLUMNS}
                        data={studentAttendance}
                        currentPage={page}
                        totalPages={studentAttendance?.length ? Math.ceil(studentAttendance.length / 10) : 1}
                        onPageChange={(p) => setPage(p)}
                        attendance={(row, index) => {
                            // Build a guaranteed-unique key per student row.
                            // row.id may be undefined if the API response shape
                            // doesn't match the interface, causing key collisions
                            // where all students share the same selectedStatuses entry.
                            const rowKey =
                                row.id ??
                                row.student_id ??
                                row.student?.id ??
                                row.student_code ??
                                row.student?.student_code ??
                                row.admission_no ??
                                index;

                            const backendStatus = row.status?.toLowerCase() as StatusType | undefined;
                            // Only show a button as active if the user has explicitly clicked it
                            // OR if the backend already recorded a status.
                            // Do NOT default to "present" here — that caused every student
                            // to appear selected before the user touched anything.
                            const activeStatus: StatusType | undefined =
                                selectedStatuses[rowKey] ?? backendStatus;

                            const handleStatusClick =
                                (status: StatusType) => () =>
                                    setSelectedStatuses((prev) => ({
                                        ...prev,
                                        [rowKey]: status,
                                    }));

                            return (
                                <div className="attendance_buttons">
                                    <AttendanceButton
                                        status="present"
                                        title="Present"
                                        active={activeStatus === "present"}
                                        onClick={handleStatusClick("present")}
                                    />
                                    <AttendanceButton
                                        status="late"
                                        title="Late"
                                        active={activeStatus === "late"}
                                        onClick={handleStatusClick("late")}
                                    />
                                    <AttendanceButton
                                        status="absent"
                                        title="Absent"
                                        active={activeStatus === "absent"}
                                        onClick={handleStatusClick("absent")}
                                    />
                                    <AttendanceButton
                                        status="half-day"
                                        title="Half Day"
                                        active={activeStatus === "half-day"}
                                        onClick={handleStatusClick("half-day")}
                                    />
                                    <AttendanceButton
                                        status="leave"
                                        title="Leave"
                                        active={activeStatus === "leave"}
                                        onClick={handleStatusClick("leave")}
                                    />
                                </div>
                            );
                        }}
                        note={(row, index) => {
                            const rowKey =
                                row.id ??
                                row.student_id ??
                                row.student?.id ??
                                row.student_code ??
                                row.student?.student_code ??
                                row.admission_no ??
                                index;
                            return (
                                <InputField
                                    value={notes[rowKey] ?? row.note ?? ""}
                                    type="text"
                                    placeHolder="Enter note"
                                    onChange={(val) => {
                                        const text =
                                            typeof val === "object" && val?.target
                                                ? val.target.value
                                                : val;
                                        setNotes((prev) => ({ ...prev, [rowKey]: text as string }));
                                    }}
                                />
                            );
                        }}
                    />
                    <div className="submit_attendance_button">
                        <PrimaryButton
                            onClick={handleSubmitAttendance}
                            disabled={isPending}
                            title={isPending ? "Submitting..." : "Submit Attendance"}
                        />
                    </div>
                </TableWrapper>

            </div>
        </div>
    );
};

export default StudentAttendance;