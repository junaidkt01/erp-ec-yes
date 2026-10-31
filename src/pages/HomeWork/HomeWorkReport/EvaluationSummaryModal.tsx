import React from "react";
import {
    Award,
    CalendarDays,
    Download,
    GraduationCap,
    Paperclip,
    UserCheck,
} from "lucide-react";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { useFetchEvaluationSummary, type HomeworkReportItem } from "../../../hooks/useHomework";
import {
    formatDate,
    getBadgeClass,
    getClassSection,
    getFileName,
    getFileUrl,
    getPerformanceLabel,
    getPersonName,
    getSubjectName,
} from "../homeworkUtils";

const withoutEmptyValues = (source: Record<string, any> = {}) =>
    Object.fromEntries(Object.entries(source).filter(([, value]) => value !== null && value !== undefined && value !== ""));

const InfoSection = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <section className="eval_section">
        <div className="eval_section_header">
            {icon}
            <h4>{title}</h4>
        </div>
        {children}
    </section>
);

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="eval_row">
        <span className="eval_label">{label}</span>
        <span className="eval_value">{children}</span>
    </div>
);

interface EvaluationSummaryModalProps {
    item: HomeworkReportItem;
    onClose: () => void;
}

const EvaluationSummaryModal: React.FC<EvaluationSummaryModalProps> = ({ item, onClose }) => {
    const submissionId = item.submission_id || item.id;
    const { data: summary, isLoading, isError } = useFetchEvaluationSummary(submissionId, Boolean(submissionId));

    // Students without a submission have no summary to fetch, so the report row fills any gaps.
    const homework: Record<string, any> = {
        ...withoutEmptyValues(item.homework),
        ...withoutEmptyValues(summary?.homework),
    };
    const record: Record<string, any> = { ...withoutEmptyValues(item), ...withoutEmptyValues(summary), homework };

    const obtainedMarks = record.marks ?? null;
    const maxMarks = homework.marks ?? null;
    const calculatedPercentage = obtainedMarks !== null && Number(maxMarks) > 0
        ? (Number(obtainedMarks) / Number(maxMarks)) * 100
        : null;
    const percentage = record.percentage !== undefined ? Number(record.percentage) : calculatedPercentage;
    const hasPercentage = percentage !== null && Number.isFinite(percentage);
    const performance = record.performance || (hasPercentage ? getPerformanceLabel(percentage) : "");

    const performanceBadge = performance ? (
        <span className={`homework_status_badge ${getBadgeClass(performance)}`}>{performance}</span>
    ) : "-";

    const marksText = obtainedMarks !== null ? `${obtainedMarks} / ${maxMarks ?? "-"}` : "-";
    const studentName = getPersonName(record.student) || record.student_name || "Student";
    const admissionNo = record.student?.admission_no || record.admission_no || record.roll_no;
    const createdBy = getPersonName(record.evaluated_by) || getPersonName(homework.created_by) || "-";
    const attachment = record.document || record.file_url || record.file || homework.file_url || homework.file;

    return (
        <PopupScreen title="Evaluation Summary" onClick={onClose} className="evaluation_summary_popup">
            <div className="evaluation_summary">
                {isLoading ? (
                    <p className="eval_state">Loading evaluation details...</p>
                ) : (
                    <>
                        {isError && (
                            <p className="eval_state error">
                                Could not load the full evaluation. Showing the details from the report.
                            </p>
                        )}

                        <div className="eval_student">
                            <span>
                                <strong>{studentName}</strong>
                                {admissionNo ? ` · ${admissionNo}` : ""}
                            </span>
                            {record.status && (
                                <span className={`homework_status_badge ${getBadgeClass(record.status)}`}>
                                    {record.status}
                                </span>
                            )}
                        </div>

                        <div className="eval_summary_strip">
                            <div>
                                <span className="eval_label">Subject</span>
                                <span className="eval_value">{getSubjectName(record)}</span>
                            </div>
                            <div>
                                <span className="eval_label">Date</span>
                                <span className="eval_value">{formatDate(record.evaluation_date)}</span>
                            </div>
                            <div>
                                <span className="eval_label">Marks</span>
                                <span className="eval_value">{marksText}</span>
                            </div>
                            <div>
                                <span className="eval_label">Performance</span>
                                <span className="eval_value">{performanceBadge}</span>
                            </div>
                        </div>

                        <InfoSection icon={<CalendarDays size={16} />} title="Homework Info">
                            <InfoRow label="Homework Date">{formatDate(homework.homework_date ?? record.homework_date)}</InfoRow>
                            <InfoRow label="Submission Date">{formatDate(record.submission_date)}</InfoRow>
                            <InfoRow label="Evaluation Date">{formatDate(record.evaluation_date)}</InfoRow>
                        </InfoSection>

                        <InfoSection icon={<UserCheck size={16} />} title="Evaluator Info">
                            <InfoRow label="Created By">{createdBy}</InfoRow>
                            <InfoRow label="Evaluation Date">{formatDate(record.evaluation_date)}</InfoRow>
                        </InfoSection>

                        <InfoSection icon={<GraduationCap size={16} />} title="Class Info">
                            <InfoRow label="Class & Section">{getClassSection(record)}</InfoRow>
                            <InfoRow label="Subject">{getSubjectName(record)}</InfoRow>
                        </InfoSection>

                        <InfoSection icon={<Award size={16} />} title="Marks">
                            <InfoRow label="Mark">{maxMarks ?? "-"}</InfoRow>
                            <InfoRow label="Obtained Marks">{obtainedMarks ?? "-"}</InfoRow>
                            <InfoRow label="Percentage">
                                {hasPercentage ? (
                                    <span className="eval_percentage">
                                        {Number(percentage.toFixed(1))}%
                                        {performanceBadge}
                                    </span>
                                ) : "-"}
                            </InfoRow>
                            <InfoRow label="File">
                                {attachment ? (
                                    <span className="eval_file">
                                        <span className="eval_file_name" title={getFileName(attachment)}>
                                            <Paperclip size={14} />
                                            <span>{getFileName(attachment)}</span>
                                        </span>
                                        <a
                                            href={getFileUrl(attachment)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="eval_download"
                                        >
                                            <Download size={14} />
                                            <span>Download</span>
                                        </a>
                                    </span>
                                ) : "No attachment"}
                            </InfoRow>
                            <div className="eval_row eval_description">
                                <span className="eval_label">Description</span>
                                <p>{record.description || "No description provided."}</p>
                            </div>
                        </InfoSection>
                    </>
                )}
            </div>
        </PopupScreen>
    );
};

export default EvaluationSummaryModal;
