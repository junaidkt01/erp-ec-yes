import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
    useFetchAllLessonPlans,
    useReviewLessonPlan,
    type LessonPlanItem,
} from "../../../hooks/useLessonPlan";
import { toast } from "sonner";
import "./LessonPlanApprovals.scss";

const LessonPlanApprovals = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [reviewTarget, setReviewTarget] = useState<LessonPlanItem | null>(null);
    const [remarks, setRemarks] = useState("");

    const { data: plansData, isLoading } = useFetchAllLessonPlans({
        page,
        per_page: 8,
    });

    const reviewMutation = useReviewLessonPlan();

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "teacher_name", title: "Teacher" },
        { key: "lesson_title", title: "Title of Lesson" },
        { key: "subject", title: "Subject" },
        { key: "class_section", title: "Class & Section" },
        { key: "periods", title: "Periods" },
        { key: "status", title: "Status" },
    ];

    const rawList: LessonPlanItem[] = plansData?.data || [];
    const totalPages: number = plansData?.meta?.last_page || 1;

    const getStatusBadge = (status: LessonPlanItem["status"]) => {
        switch (status) {
            case "Approved":
                return <span className="status_badge approved">Approved</span>;
            case "Submitted":
                return <span className="status_badge submitted">Under Review</span>;
            case "Revision_Requested":
                return <span className="status_badge revision">Revision Needed</span>;
            case "Draft":
            default:
                return <span className="status_badge draft">Draft</span>;
        }
    };

    const tableData = rawList.map((item, index) => ({
        sl: (page - 1) * 8 + index + 1,
        teacher_name: item.teacher_name || "Teacher",
        lesson_title: item.lesson_title,
        subject: item.subject,
        class_section: `${item.class_name} - ${item.section_name}`,
        periods: `${item.no_of_periods} Periods`,
        status: getStatusBadge(item.status),
        raw: item,
    }));

    const handleOpenReview = (plan: LessonPlanItem) => {
        setReviewTarget(plan);
        setRemarks(plan.reviewer_remarks || "");
    };

    const handleExecuteReview = async (decision: "Approved" | "Revision_Requested") => {
        if (!reviewTarget) return;

        try {
            await reviewMutation.mutateAsync({
                id: reviewTarget.id,
                status: decision,
                reviewer_remarks: remarks.trim(),
                reviewed_by: "ACO / Principal",
            });
            toast.success(
                decision === "Approved"
                    ? "Lesson plan successfully approved!"
                    : "Revision request sent to the teacher."
            );
            setReviewTarget(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to submit review");
        }
    };

    return (
        <div className="page_wrapper">
            <div className="lesson_plan_approvals_page">
                {/* Review Modal */}
                {reviewTarget && (
                    <PopupScreen
                        title={`Review Lesson Plan: ${reviewTarget.lesson_title}`}
                        onClick={() => setReviewTarget(null)}
                    >
                        <div className="popup_body review_popup_body">
                            <div className="plan_quick_summary">
                                <div className="summary_item">
                                    <span className="lbl">Teacher:</span>
                                    <span className="val">{reviewTarget.teacher_name || "Teacher"}</span>
                                </div>
                                <div className="summary_item">
                                    <span className="lbl">Subject:</span>
                                    <span className="val">{reviewTarget.subject}</span>
                                </div>
                                <div className="summary_item">
                                    <span className="lbl">Class & Section:</span>
                                    <span className="val">
                                        {reviewTarget.class_name} - {reviewTarget.section_name}
                                    </span>
                                </div>
                                <div className="summary_item">
                                    <span className="lbl">Chapter / Pages:</span>
                                    <span className="val">
                                        {reviewTarget.chapter_number} ({reviewTarget.page_numbers})
                                    </span>
                                </div>
                            </div>

                            <div className="pedagogy_preview_block">
                                <h4>Objectives:</h4>
                                <p>{reviewTarget.objectives || "None"}</p>
                            </div>

                            <div className="pedagogy_preview_block">
                                <h4>Teaching Aids & Activities:</h4>
                                <p>{reviewTarget.teaching_aids || "None"}</p>
                            </div>

                            <div className="remarks_input_group">
                                <label className="input_label">
                                    ACO / Principal Feedback & Remarks:
                                </label>
                                <textarea
                                    rows={3}
                                    className="custom_textarea"
                                    placeholder="Add feedback, corrections, or approval notes for the teacher..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>

                            <div className="buttons review_action_buttons">
                                <SecondaryButton
                                    title="Cancel"
                                    onClick={() => setReviewTarget(null)}
                                />
                                <button
                                    type="button"
                                    className="button revision_btn"
                                    onClick={() => handleExecuteReview("Revision_Requested")}
                                    disabled={reviewMutation.isPending}
                                >
                                    Request Revision
                                </button>
                                <PrimaryButton
                                    title={reviewMutation.isPending ? "Approving..." : "Approve Plan"}
                                    disabled={reviewMutation.isPending}
                                    isLoading={reviewMutation.isPending}
                                    onClick={() => handleExecuteReview("Approved")}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    title="Lesson Plan Approvals (ACO / Principal)"
                    isSearchBar
                >
                    <div className="approvals_top_bar">
                        <button
                            type="button"
                            className="button secondary_button"
                            onClick={() => navigate("/lesson-plan/lesson-plan-list")}
                        >
                            &larr; Back to Lesson Plans
                        </button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                        emptyMessage={isLoading ? "Loading plans..." : "No lesson plans found."}
                        actions={(row: any) => (
                            <div className="actions">
                                <button
                                    type="button"
                                    title="Review & Sign Off"
                                    onClick={() => handleOpenReview(row.raw)}
                                >
                                    <img src="/svgs/edit.svg" alt="Review" />
                                </button>
                                <button
                                    type="button"
                                    title="View Official Sheet"
                                    onClick={() => navigate(`/lesson-plan/lesson-plan-list/${row.raw.id}`)}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#6b7280"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    );
};

export default LessonPlanApprovals;
