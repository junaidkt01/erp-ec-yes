import { useNavigate, useParams } from "react-router-dom";
import { useFetchLessonPlanById } from "../../../hooks/useLessonPlan";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import "./ViewLessonPlan.scss";

const ViewLessonPlan = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const { data: plan, isLoading } = useFetchLessonPlanById(id || "1");

    if (isLoading) {
        return (
            <div className="page_wrapper">
                <p style={{ padding: "20px" }}>Loading lesson plan sheet...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="page_wrapper">
                <p style={{ padding: "20px" }}>Lesson plan not found.</p>
                <SecondaryButton title="Back to List" onClick={() => navigate("/lesson-plan/lesson-plan-list")} />
            </div>
        );
    }

    const schedule = plan.schedule || {
        monday: { class_assignment: "", home_assignment: "" },
        tuesday: { class_assignment: "", home_assignment: "" },
        wednesday: { class_assignment: "", home_assignment: "" },
        thursday: { class_assignment: "", home_assignment: "" },
        friday: { class_assignment: "", home_assignment: "" },
        saturday: { class_assignment: "", home_assignment: "" },
    };

    return (
        <div className="page_wrapper">
            <div className="view_lesson_plan_page">
                {/* Top Action Toolbar (hidden during print) */}
                <div className="no_print print_toolbar">
                    <button
                        type="button"
                        className="button secondary_button"
                        onClick={() => navigate("/lesson-plan/lesson-plan-list")}
                    >
                        &larr; Back to List
                    </button>

                    <div className="right_tools">
                        <button
                            type="button"
                            className="button secondary_button"
                            onClick={() => navigate(`/lesson-plan/add-lesson-plan/${plan.id}`)}
                        >
                            <img src="/svgs/edit.svg" alt="" style={{ width: "14px", marginRight: "6px" }} />
                            Edit Plan
                        </button>
                        <PrimaryButton
                            title="Print Lesson Plan"
                            icon={
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ marginLeft: "6px" }}
                                >
                                    <polyline points="6 9 6 2 18 2 18 9" />
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                    <rect x="6" y="14" width="12" height="8" />
                                </svg>
                            }
                            onClick={() => window.print()}
                        />
                    </div>
                </div>

                {/* Printable Document (Exact Replica of Uploaded PDF Template) */}
                <div className="lesson_plan_sheet_container">
                    <div className="official_table_sheet">
                        {/* 1. Header */}
                        <div className="sheet_header_banner">
                            <h1>LESSON PLAN</h1>
                        </div>

                        {/* 2. Top Meta Grid */}
                        <div className="meta_row row_3col">
                            <div className="cell cell_subject">
                                <span className="cell_label">Subject</span>
                                <span className="cell_value">{plan.subject}</span>
                            </div>
                            <div className="cell cell_title">
                                <span className="cell_label">Title of Lesson</span>
                                <span className="cell_value font_bold">{plan.lesson_title}</span>
                            </div>
                            <div className="cell cell_date">
                                <span className="cell_label">Date</span>
                                <span className="cell_value">{plan.plan_date}</span>
                            </div>
                        </div>

                        <div className="meta_row row_4col">
                            <div className="cell">
                                <span className="cell_label">Class & Section</span>
                                <span className="cell_value">
                                    {plan.class_name} - {plan.section_name}
                                </span>
                            </div>
                            <div className="cell">
                                <span className="cell_label">Chapter Number</span>
                                <span className="cell_value">{plan.chapter_number}</span>
                            </div>
                            <div className="cell">
                                <span className="cell_label">Page Numbers</span>
                                <span className="cell_value">{plan.page_numbers}</span>
                            </div>
                            <div className="cell">
                                <span className="cell_label">No. of periods</span>
                                <span className="cell_value">{plan.no_of_periods}</span>
                            </div>
                        </div>

                        {/* 3. Objectives */}
                        <div className="content_row">
                            <div className="row_label_col">
                                <p>Objectives</p>
                            </div>
                            <div className="row_content_col">
                                <p className="pre_wrap_text">
                                    {plan.objectives || "No specific objectives entered."}
                                </p>
                            </div>
                        </div>

                        {/* 4. Introductory Activities */}
                        <div className="content_row">
                            <div className="row_label_col">
                                <p>Introductory Activities</p>
                            </div>
                            <div className="row_content_col">
                                <p className="pre_wrap_text">
                                    {plan.introductory_activities || "No introductory activities entered."}
                                </p>
                            </div>
                        </div>

                        {/* 5. Teaching aids & Activities */}
                        <div className="content_row content_row_tall">
                            <div className="row_label_col">
                                <p>Teaching aids & Activities</p>
                            </div>
                            <div className="row_content_col">
                                <p className="pre_wrap_text">
                                    {plan.teaching_aids || "No teaching aids & activities entered."}
                                </p>
                            </div>
                        </div>

                        {/* 6. Execution Grid: Monday through Saturday */}
                        <div className="schedule_grid_section">
                            <table className="official_grid_table">
                                <thead>
                                    <tr>
                                        <th className="empty_corner_th" style={{ width: "120px" }}></th>
                                        <th>Monday</th>
                                        <th>Tuesday</th>
                                        <th>Wednesday</th>
                                        <th>Thursday</th>
                                        <th>Friday</th>
                                        <th>Saturday</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="schedule_row">
                                        <td className="schedule_label_td">Class Assignment</td>
                                        <td>{schedule.monday.class_assignment || "—"}</td>
                                        <td>{schedule.tuesday.class_assignment || "—"}</td>
                                        <td>{schedule.wednesday.class_assignment || "—"}</td>
                                        <td>{schedule.thursday.class_assignment || "—"}</td>
                                        <td>{schedule.friday.class_assignment || "—"}</td>
                                        <td>{schedule.saturday.class_assignment || "—"}</td>
                                    </tr>
                                    <tr className="schedule_row">
                                        <td className="schedule_label_td">Home Assignment</td>
                                        <td>{schedule.monday.home_assignment || "—"}</td>
                                        <td>{schedule.tuesday.home_assignment || "—"}</td>
                                        <td>{schedule.wednesday.home_assignment || "—"}</td>
                                        <td>{schedule.thursday.home_assignment || "—"}</td>
                                        <td>{schedule.friday.home_assignment || "—"}</td>
                                        <td>{schedule.saturday.home_assignment || "—"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 7. Footer: ACO's / Principal's Sign */}
                        <div className="sheet_footer_sign_row">
                            <div className="remarks_box">
                                {plan.reviewer_remarks && (
                                    <p>
                                        <strong>Reviewer Remarks:</strong> {plan.reviewer_remarks}
                                    </p>
                                )}
                                {plan.status === "Approved" && (
                                    <span className="approval_stamp">APPROVED</span>
                                )}
                            </div>

                            <div className="sign_block">
                                <div className="sign_line"></div>
                                <p className="sign_text">ACO’s / Principal’s Sign</p>
                                {plan.reviewed_by && (
                                    <p className="reviewer_name">
                                        {plan.reviewed_by} ({plan.reviewed_at || "Verified"})
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewLessonPlan;
