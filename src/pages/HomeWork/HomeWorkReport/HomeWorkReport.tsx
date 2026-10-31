import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { InputField } from "../../../components/InputFields/InputFields";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import {
    useFetchHomeworkReport,
    useEvaluateHomework,
    type HomeworkReportItem,
} from "../../../hooks/useHomework";
import EvaluationSummaryModal from "./EvaluationSummaryModal";
import {
    formatDate,
    getBadgeClass,
    getClassSection,
    getSubjectName,
    toDate,
    toDateString,
} from "../homeworkUtils";
import "./HomeWorkReport.scss";

interface ReportFilters {
    class_id: string;
    section_id: string;
    subject_id: string;
    homework_date: string;
}

const EVALUATION_STATUSES = ["completed", "evaluated"];

const HomeWorkReport: React.FC = () => {
    const location = useLocation();
    const navState = (location.state as any) || {};

    const initialFilters: ReportFilters = {
        class_id: navState.class_id ? String(navState.class_id) : "",
        section_id: navState.section_id ? String(navState.section_id) : "",
        subject_id: navState.subject_id ? String(navState.subject_id) : "",
        homework_date: navState.homework_date || "",
    };

    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState<string>(navState.search || "");
    const debouncedSearch = useDebounce(searchTerm, 400);

    const [filterData, setFilterData] = useState<ReportFilters>(initialFilters);
    const [appliedFilter, setAppliedFilter] = useState<ReportFilters>(initialFilters);

    // Evaluate Modal (Grade submission)
    const [evaluateTarget, setEvaluateTarget] = useState<{
        homeworkId: number | string;
        studentId: number | string;
        studentName?: string;
        admissionNo?: string;
        maxMarks?: number | string;
        existingMarks?: number | string;
        existingDescription?: string;
        status?: string;
    } | null>(null);
    const [evaluateMarks, setEvaluateMarks] = useState<string>("");
    const [evaluateDescription, setEvaluateDescription] = useState<string>("");
    const [evaluateStatus, setEvaluateStatus] = useState<string>("completed");

    // Evaluation Summary Modal
    const [selectedReportItem, setSelectedReportItem] = useState<HomeworkReportItem | null>(null);

    // Master Dropdown Queries
    const { data: studentClasses } = useFetchAllStudentClasses();
    const classOptions = useMemo(() => {
        const raw = Array.isArray(studentClasses?.data) ? studentClasses.data : Array.isArray(studentClasses) ? studentClasses : [];
        return raw.map((cls: any) => ({
            label: cls.name || cls.class_name,
            value: cls.id,
        }));
    }, [studentClasses]);

    const { data: sectionsData } = useFetchAllSections();
    const allSections = useMemo(() => {
        return Array.isArray(sectionsData?.data) ? sectionsData.data : Array.isArray(sectionsData) ? sectionsData : [];
    }, [sectionsData]);

    const filterSectionOptions = useMemo(() => {
        if (!filterData?.class_id) return [];
        return allSections
            .filter((sec: any) => String(sec.class_id) === String(filterData.class_id))
            .map((sec: any) => ({
                label: sec.name || sec.section_name,
                value: sec.id,
            }));
    }, [allSections, filterData?.class_id]);

    const { data: subjectsData } = useFetchAllSubjects();
    const subjectOptions = useMemo(() => {
        const raw = Array.isArray(subjectsData?.data) ? subjectsData.data : Array.isArray(subjectsData) ? subjectsData : [];
        return raw.map((sub: any) => ({
            label: sub.name || sub.subject_name,
            value: sub.id,
        }));
    }, [subjectsData]);

    // Homework Report Query
    const { data: reportApiResponse, isLoading: isReportLoading, isFetching: isReportFetching, isError: isReportError } = useFetchHomeworkReport({
        page,
        class_id: appliedFilter.class_id,
        section_id: appliedFilter.section_id,
        subject_id: appliedFilter.subject_id,
        homework_date: appliedFilter.homework_date,
        search: debouncedSearch,
    });

    const evaluateMutation = useEvaluateHomework();

    const reportList: HomeworkReportItem[] = useMemo(() => {
        const resp = reportApiResponse?.data;
        if (Array.isArray(resp)) return resp;
        if (Array.isArray(resp?.data)) return resp.data;
        if (Array.isArray(reportApiResponse)) return reportApiResponse;
        return [];
    }, [reportApiResponse]);

    const totalReportPages = useMemo(() => {
        return (
            reportApiResponse?.data?.last_page ||
            reportApiResponse?.meta?.last_page ||
            reportApiResponse?.last_page ||
            (reportList.length > 0 ? Math.ceil(reportList.length / (reportApiResponse?.data?.per_page || 15)) : 1)
        );
    }, [reportApiResponse, reportList]);

    // Handlers
    const handleSearchClick = () => {
        setAppliedFilter({ ...filterData });
        setPage(1);
    };

    const handleResetFilter = () => {
        const resetObj: ReportFilters = {
            class_id: "",
            section_id: "",
            subject_id: "",
            homework_date: "",
        };
        setFilterData(resetObj);
        setAppliedFilter(resetObj);
        setSearchTerm("");
        setPage(1);
    };

    const handleTableSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleOpenEvaluateModal = (target: {
        homeworkId: number | string;
        studentId: number | string;
        studentName?: string;
        admissionNo?: string;
        maxMarks?: number | string;
        existingMarks?: number | string;
        existingDescription?: string;
        status?: string;
    }) => {
        setEvaluateTarget(target);
        setEvaluateMarks(target.existingMarks !== undefined && target.existingMarks !== null ? String(target.existingMarks) : "");
        setEvaluateDescription(target.existingDescription || "");
        // A submission's current status (e.g. "pending") is not a valid evaluation outcome.
        const currentStatus = (target.status || "").toLowerCase();
        setEvaluateStatus(EVALUATION_STATUSES.includes(currentStatus) ? currentStatus : "completed");
    };

    const handleSaveEvaluation = async () => {
        if (!evaluateTarget) return;
        if (!evaluateMarks.trim()) {
            toast.error("Please enter marks");
            return;
        }

        try {
            await evaluateMutation.mutateAsync({
                id: evaluateTarget.homeworkId,
                student_id: evaluateTarget.studentId,
                marks: evaluateMarks,
                description: evaluateDescription,
                status: evaluateStatus,
            });
            toast.success("Evaluation saved successfully");
            setEvaluateTarget(null);
        } catch (err: any) {
            console.error("Evaluate error:", err);
            toast.error(err?.response?.data?.message || "Failed to submit evaluation");
        }
    };

    // Columns
    const reportColumns: Column[] = [
        { key: "student_name", title: "Student Name" },
        { key: "class_and_section", title: "Class & Section" },
        { key: "subject", title: "Subject" },
        { key: "marks", title: "Marks" },
        { key: "submission_date", title: "Submission Date" },
        { key: "evaluation_date", title: "Evaluation Date" },
        { key: "status", title: "Status" },
    ];

    const reportTableData = useMemo(() => {
        return reportList.map((item) => ({
            student_name: item.student?.full_name || item.student?.name || item.student_name || "N/A",
            class_and_section: getClassSection(item),
            subject: getSubjectName(item),
            marks: item.marks !== null && item.marks !== undefined ? `${item.marks} / ${item.homework?.marks ?? "-"}` : "-",
            submission_date: formatDate(item.submission_date),
            evaluation_date: formatDate(item.evaluation_date),
            status: (
                <span className={`homework_status_badge ${getBadgeClass(item.status)}`}>
                    {item.status || "-"}
                </span>
            ),
            raw: item,
        }));
    }, [reportList]);

    return (
        <div className="page_wrapper">
            <div className="home_work_report">
                {isReportLoading && <LoadingOverlay isLoading={true} />}

                {/* Filter Criteria Section */}
                <TableWrapper
                    title="Select Criteria"
                    isAddButton={false}
                >
                    <div className="search_screen">
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        value={filterData.class_id}
                                        label="Class"
                                        placeholder="Select class"
                                        options={classOptions}
                                        onChange={(val) => setFilterData((prev) => ({ ...prev, class_id: String(val), section_id: "" }))}
                                    />
                                    <CustomSelect
                                        value={filterData.section_id}
                                        label="Section"
                                        placeholder={filterData.class_id ? "Select section" : "Select class first"}
                                        options={filterSectionOptions}
                                        onChange={(val) => setFilterData((prev) => ({ ...prev, section_id: String(val) }))}
                                    />
                                </div>
                                <div className="body_section">
                                    <CustomSelect
                                        value={filterData.subject_id}
                                        label="Subject"
                                        placeholder="Select subject"
                                        options={subjectOptions}
                                        onChange={(val) => setFilterData((prev) => ({ ...prev, subject_id: String(val) }))}
                                    />
                                    <InputField
                                        type="date"
                                        label="Homework Date"
                                        placeHolder="Select date"
                                        value={toDate(filterData.homework_date)}
                                        onChange={(date: Date | null) => setFilterData((prev) => ({ ...prev, homework_date: toDateString(date) }))}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleResetFilter} />
                                <PrimaryButton
                                    title="Search"
                                    isLoading={isReportFetching}
                                    onClick={handleSearchClick}
                                />
                            </div>
                        </div>
                    </div>
                </TableWrapper>

                {/* Homework Report Table */}
                <TableWrapper
                    title="Homework Report List"
                    isAddButton={false}
                    isSearchBar={true}
                    searchValue={searchTerm}
                    searchOnchange={handleTableSearch}
                >
                    <DataTable
                        columns={reportColumns}
                        data={reportTableData}
                        currentPage={page}
                        totalPages={totalReportPages}
                        onPageChange={(p) => setPage(p)}
                        actionsTitle="Action"
                        emptyMessage={
                            isReportLoading
                                ? undefined
                                : isReportError
                                    ? "Failed to load the homework report. Please try again."
                                    : "No homework report records found."
                        }
                        actions={(row: any) => {
                            const reportItem: HomeworkReportItem = row.raw;
                            const studentId = reportItem.student_id || reportItem.student?.id;
                            const homeworkId = reportItem.homework_id || reportItem.homework?.id;

                            return (
                                <div className="actions">
                                    {/* View Evaluation Summary Modal */}
                                    <button
                                        type="button"
                                        title="View Evaluation Summary"
                                        onClick={() => setSelectedReportItem(reportItem)}
                                    >
                                        <img src="/svgs/eye_open.svg" alt="Summary" />
                                    </button>

                                    {/* Evaluate / Grade Modal */}
                                    {homeworkId && studentId && (
                                        <button
                                            type="button"
                                            className="eval_btn"
                                            title="Evaluate Student"
                                            onClick={() =>
                                                handleOpenEvaluateModal({
                                                    homeworkId,
                                                    studentId,
                                                    studentName: reportItem.student?.full_name || reportItem.student?.name || reportItem.student_name,
                                                    admissionNo: reportItem.student?.admission_no || reportItem.admission_no,
                                                    maxMarks: reportItem.homework?.marks,
                                                    existingMarks: reportItem.marks !== null ? reportItem.marks : undefined,
                                                    existingDescription: reportItem.description || undefined,
                                                    status: reportItem.status,
                                                })
                                            }
                                        >
                                            <CheckCircle size={14} />
                                            <span>Grade</span>
                                        </button>
                                    )}
                                </div>
                            );
                        }}
                    />
                </TableWrapper>

                {/* ─── MODAL 1: Evaluate Student Homework ─── */}
                {evaluateTarget && (
                    <PopupScreen
                        title="Evaluate Student Homework"
                        onClick={() => setEvaluateTarget(null)}
                    >
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="details_grid" style={{ marginBottom: 12 }}>
                                    <div className="detail_item">
                                        <span className="label">Student</span>
                                        <span className="value">{evaluateTarget.studentName || "Student"}</span>
                                    </div>
                                    <div className="detail_item">
                                        <span className="label">Admission No</span>
                                        <span className="value">{evaluateTarget.admissionNo || "-"}</span>
                                    </div>
                                    <div className="detail_item">
                                        <span className="label">Max Marks</span>
                                        <span className="value">{evaluateTarget.maxMarks || "N/A"}</span>
                                    </div>
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="number"
                                        label={`Marks Obtained (Max: ${evaluateTarget.maxMarks || ""}) *`}
                                        placeHolder="Enter marks"
                                        value={evaluateMarks}
                                        onChange={(e) => setEvaluateMarks(e.target.value)}
                                    />
                                    <CustomSelect
                                        value={evaluateStatus}
                                        label="Status *"
                                        placeholder="Select status"
                                        options={[
                                            { label: "Completed", value: "completed" },
                                            { label: "Evaluated", value: "evaluated" },
                                        ]}
                                        onChange={(val) => setEvaluateStatus(String(val))}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Teacher's Feedback / Remarks"
                                        placeHolder="Enter feedback or evaluation comments"
                                        value={evaluateDescription}
                                        onChange={(e) => setEvaluateDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Cancel" onClick={() => setEvaluateTarget(null)} />
                                <PrimaryButton
                                    title="Save Evaluation"
                                    isLoading={evaluateMutation.isPending}
                                    onClick={handleSaveEvaluation}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* ─── MODAL 2: Evaluation Summary Modal ─── */}
                {selectedReportItem && (
                    <EvaluationSummaryModal
                        key={String(selectedReportItem.submission_id ?? selectedReportItem.id ?? selectedReportItem.student_id)}
                        item={selectedReportItem}
                        onClose={() => setSelectedReportItem(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default HomeWorkReport;
