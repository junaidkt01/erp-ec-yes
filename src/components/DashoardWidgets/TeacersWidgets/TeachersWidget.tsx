import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay, { ErrorStatusOverlay } from "../../Loadingoverlay";
import { PrimaryButton, SecondaryButton } from "../../Buttons/Buttons";
import PopupScreen from "../../PopupScreen/PopupScreen";
import { useAuth } from "../../../auth/useAuth";
import {
    useTeacherWidgets,
    type YourStudentsWidget,
    type YourClassesWidget,
    type SubjectsWidget,
    type NextPeriodsWidget,
} from "../../../hooks/useTeacherWidgets";
import "./TeachersWidget.scss";

interface TeachersWidgetProps {
    teacherId?: number | string;
}

const mapActionUrl = (url?: string, fallback = "/dashboard"): string => {
    if (!url) return fallback;
    const normalized = url.toLowerCase().trim();
    if (normalized.includes("student")) return "/student-info/student-list";
    if (normalized.includes("class")) return "/teacher/classes";
    if (normalized.includes("subject")) return "/teacher/subjects";
    if (normalized.includes("timetable") || normalized.includes("period")) return "/teacher/next-periods";
    return url;
};

const cleanFooterText = (text?: string): string => {
    if (!text) return "";
    return text.replace(/^[\s•·-]+/, "").trim();
};

const TeachersWidget: React.FC<TeachersWidgetProps> = ({ teacherId }) => {
    const navigate = useNavigate();
    const { data: authData } = useAuth();
    const [activePopup, setActivePopup] = useState<"students" | "classes" | "subjects" | "periods" | null>(null);
    console.log("widgett: auth", authData)

    // Resolve teacher id from prop, auth profile, or fallback to 19 (default demo teacher)
    const resolvedTeacherId =
        teacherId ??
        authData?.teacher_id ??
        (authData?.user?.roles?.some((r: any) =>
            (typeof r === "string" ? r : r?.name)?.toLowerCase().includes("teacher")
        )
            ? authData?.user?.id
            : undefined) ??
        19;

    const { data, isLoading, isError, error } = useTeacherWidgets(resolvedTeacherId);
    console.log("widgett: teacher", data, resolvedTeacherId)

    if (isLoading && !data) {
        return <LoadingOverlay isLoading />;
    }

    if (isError && !data) {
        return (
            <ErrorStatusOverlay
                isError
                status={(error as any)?.response?.status ?? 500}
                message={error?.message || "Failed to load teacher widgets"}
            />
        );
    }

    const widgets = data?.widgets;
    const yourStudents: YourStudentsWidget | undefined = widgets?.your_students;
    const yourClasses: YourClassesWidget | undefined = widgets?.your_classes;
    const subjects: SubjectsWidget | undefined = widgets?.subjects;
    const nextPeriods: NextPeriodsWidget | undefined = widgets?.next_periods;

    return (
        <div className="teachers_widgets">
            {/* 1. Your Students */}
            <div className="widget hvr_zm_in">
                <div className="widget_head">
                    <div className="icon">
                        <img src="/widget/students.png" alt="Students" />
                        <p>{yourStudents?.title || "Your Students"}</p>
                    </div>
                </div>

                <div className="widget_body">
                    <p className="total_count">{yourStudents?.total_count ?? 0}</p>
                    <div className="pills_container">
                        {yourStudents?.breakdown && yourStudents.breakdown.length > 0 ? (
                            yourStudents.breakdown.map((item, idx) => (
                                <div key={idx} className="notification">
                                    <p>{item.pill || `${item.class_name}: ${item.count}`}</p>
                                </div>
                            ))
                        ) : yourStudents?.badge ? (
                            <div className="notification">
                                <p>{yourStudents.badge}</p>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="widget_footer">
                    <div className="status_message">
                        <div className="status_point warning" />
                        <p className="message_text">
                            {cleanFooterText(yourStudents?.footer?.text) || "All assigned"}
                        </p>
                    </div>
                    <PrimaryButton
                        title={yourStudents?.footer?.action_label || "View All"}
                        onClick={() => setActivePopup("students")}
                    />
                </div>
            </div>

            {/* 2. Your Classes */}
            <div className="widget hvr_zm_in">
                <div className="widget_head">
                    <div className="icon">
                        <img src="/widget/teachers.png" alt="Classes" />
                        <p>{yourClasses?.title || "Your Classes"}</p>
                    </div>
                </div>

                <div className="widget_body">
                    <p className="total_count">{yourClasses?.total_count ?? 0}</p>
                    <div className="pills_container">
                        {yourClasses?.pills && yourClasses.pills.length > 0 ? (
                            yourClasses.pills.map((pill, idx) => (
                                <div key={idx} className="notification">
                                    <p>{pill}</p>
                                </div>
                            ))
                        ) : yourClasses?.display ? (
                            <div className="notification">
                                <p>{yourClasses.display}</p>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="widget_footer">
                    <div className="status_message">
                        <div className="status_point info" />
                        <p className="message_text">
                            {cleanFooterText(yourClasses?.footer?.text) || "Classes updated"}
                        </p>
                    </div>
                    <PrimaryButton
                        title={yourClasses?.footer?.action_label || "View All"}
                        onClick={() => setActivePopup("classes")}
                    />
                </div>
            </div>

            {/* 3. Subjects */}
            <div className="widget hvr_zm_in">
                <div className="widget_head">
                    <div className="icon">
                        <img src="/widget/staffs.png" alt="Subjects" />
                        <p>{subjects?.title || "Subjects"}</p>
                    </div>
                </div>

                <div className="widget_body">
                    <p className="total_count">{subjects?.total_count ?? 0}</p>
                    <div className="pills_container">
                        {subjects?.pills && subjects.pills.length > 0 ? (
                            subjects.pills.map((pill, idx) => (
                                <div key={idx} className="notification">
                                    <p>{pill}</p>
                                </div>
                            ))
                        ) : subjects?.display ? (
                            <div className="notification">
                                <p>{subjects.display}</p>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="widget_footer">
                    <div className="status_message">
                        <div className="status_point success" />
                        <p className="message_text">
                            {cleanFooterText(subjects?.footer?.text) || "Subjects assigned"}
                        </p>
                    </div>
                    <PrimaryButton
                        title={subjects?.footer?.action_label || "View All"}
                        onClick={() => setActivePopup("subjects")}
                    />
                </div>
            </div>

            {/* 4. Next Periods */}
            <div className="widget hvr_zm_in">
                <div className="widget_head">
                    <div className="icon">
                        <img src="/widget/parents.png" alt="Next Periods" />
                        <p>{nextPeriods?.title || "Next Periods"}</p>
                    </div>
                </div>

                <div className="widget_body periods_body">
                    <div className="periods_list">
                        {nextPeriods?.periods && nextPeriods.periods.length > 0 ? (
                            nextPeriods.periods.map((period) => (
                                <div key={period.id} className="notification period_item">
                                    <p>
                                        {period.display ||
                                            `${period.class_name} - ${period.section_name} | ${period.subject_code} at ${period.start_time}`}
                                    </p>
                                </div>
                            ))
                        ) : nextPeriods?.pills && nextPeriods.pills.length > 0 ? (
                            nextPeriods.pills.map((pill, idx) => (
                                <div key={idx} className="notification period_item">
                                    <p>{pill}</p>
                                </div>
                            ))
                        ) : (
                            <p className="no_data_text">No upcoming periods</p>
                        )}
                    </div>
                </div>

                <div className="widget_footer">
                    <div className="status_message">
                        <div className="status_point info" />
                        <p className="message_text">
                            {cleanFooterText(nextPeriods?.footer?.text) || "Timetable synced"}
                        </p>
                    </div>
                    <PrimaryButton
                        title={nextPeriods?.footer?.action_label || "View All"}
                        onClick={() => setActivePopup("periods")}
                    />
                </div>
            </div>

            {/* POPUP 0: Your Students Details */}
            {activePopup === "students" && (
                <PopupScreen
                    title={yourStudents?.title || "Your Students"}
                    onClick={() => setActivePopup(null)}
                >
                    <div className="popup_body">
                        <div className="event_details_view">
                            <div className="detail_item">
                                <span className="label">Total Students</span>
                                <span className="value">
                                    {yourStudents?.total_count ?? 0}
                                </span>
                            </div>
                            <div className="detail_item">
                                <span className="label">Status</span>
                                <span className="value">
                                    {cleanFooterText(yourStudents?.footer?.text) || "All assigned"}
                                </span>
                            </div>
                            {yourStudents?.badge && (
                                <div className="detail_item">
                                    <span className="label">Badge</span>
                                    <span className="value">{yourStudents.badge}</span>
                                </div>
                            )}
                        </div>

                        {yourStudents?.breakdown && yourStudents.breakdown.length > 0 ? (
                            <div
                                className="event_details_view"
                                style={{
                                    borderTop: "0.5px solid #bdbcdb",
                                    paddingTop: "16px",
                                }}
                            >
                                {yourStudents.breakdown.map((item, idx) => (
                                    <div key={item.class_id || idx} className="detail_item">
                                        <span className="label">{item.class_name}</span>
                                        <span className="value">{item.count} Students</span>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        <div className="buttons">
                            <SecondaryButton
                                title="Close"
                                onClick={() => setActivePopup(null)}
                            />
                            <PrimaryButton
                                title={yourStudents?.footer?.action_label || "View All"}
                                onClick={() => {
                                    setActivePopup(null);
                                    navigate(
                                        mapActionUrl(
                                            yourStudents?.footer?.action_url,
                                            "/student-info/student-list"
                                        )
                                    );
                                }}
                            />
                        </div>
                    </div>
                </PopupScreen>
            )}

            {/* POPUP 1: Your Classes Details */}
            {activePopup === "classes" && (
                <PopupScreen
                    title={yourClasses?.title || "Your Classes"}
                    onClick={() => setActivePopup(null)}
                >
                    <div className="popup_body">
                        <div className="event_details_view">
                            <div className="detail_item">
                                <span className="label">Total Classes</span>
                                <span className="value">
                                    {yourClasses?.total_count ?? yourClasses?.classes?.length ?? 0}
                                </span>
                            </div>
                            <div className="detail_item">
                                <span className="label">Status</span>
                                <span className="value">
                                    {cleanFooterText(yourClasses?.footer?.text) || "Classes updated"}
                                </span>
                            </div>
                            {yourClasses?.classes && yourClasses.classes.length > 0 ? (
                                yourClasses.classes.map((cls, idx) => (
                                    <div key={cls.id || idx} className="detail_item">
                                        <span className="label">Class {idx + 1}</span>
                                        <span className="value">{cls.name}</span>
                                    </div>
                                ))
                            ) : yourClasses?.pills && yourClasses.pills.length > 0 ? (
                                yourClasses.pills.map((pill, idx) => (
                                    <div key={idx} className="detail_item">
                                        <span className="label">Class {idx + 1}</span>
                                        <span className="value">{pill}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="detail_item full_width">
                                    <span className="label">Classes</span>
                                    <span className="value">{yourClasses?.display || "No classes assigned"}</span>
                                </div>
                            )}
                        </div>

                        <div className="buttons">
                            <SecondaryButton
                                title="Close"
                                onClick={() => setActivePopup(null)}
                            />
                            <PrimaryButton
                                title={yourClasses?.footer?.action_label || "View All"}
                                onClick={() => {
                                    setActivePopup(null);
                                    navigate(
                                        mapActionUrl(
                                            yourClasses?.footer?.action_url,
                                            "/teacher/classes"
                                        )
                                    );
                                }}
                            />
                        </div>
                    </div>
                </PopupScreen>
            )}

            {/* POPUP 2: Your Subjects Details */}
            {activePopup === "subjects" && (
                <PopupScreen
                    title={subjects?.title || "Subjects"}
                    onClick={() => setActivePopup(null)}
                >
                    <div className="popup_body">
                        <div className="event_details_view">
                            <div className="detail_item">
                                <span className="label">Total Subjects</span>
                                <span className="value">
                                    {subjects?.total_count ?? subjects?.subjects?.length ?? 0}
                                </span>
                            </div>
                            <div className="detail_item">
                                <span className="label">Status</span>
                                <span className="value">
                                    {cleanFooterText(subjects?.footer?.text) || "Subjects assigned"}
                                </span>
                            </div>
                        </div>

                        {subjects?.subjects && subjects.subjects.length > 0 ? (
                            subjects.subjects.map((sub, idx) => (
                                <div
                                    key={sub.id || idx}
                                    className="event_details_view"
                                    style={{
                                        borderTop: "0.5px solid #bdbcdb",
                                        paddingTop: "16px",
                                    }}
                                >
                                    <div className="detail_item">
                                        <span className="label">Subject Name</span>
                                        <span className="value">{sub.name}</span>
                                    </div>
                                    <div className="detail_item">
                                        <span className="label">Subject Code</span>
                                        <span className="value">{sub.code || "N/A"}</span>
                                    </div>
                                    <div className="detail_item">
                                        <span className="label">Type</span>
                                        <span className="value">{sub.type || "Theory"}</span>
                                    </div>
                                    {sub.id && (
                                        <div className="detail_item">
                                            <span className="label">Subject ID</span>
                                            <span className="value">{sub.id}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : subjects?.pills && subjects.pills.length > 0 ? (
                            <div
                                className="event_details_view"
                                style={{
                                    borderTop: "0.5px solid #bdbcdb",
                                    paddingTop: "16px",
                                }}
                            >
                                {subjects.pills.map((pill, idx) => (
                                    <div key={idx} className="detail_item">
                                        <span className="label">Subject {idx + 1}</span>
                                        <span className="value">{pill}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="event_details_view"
                                style={{
                                    borderTop: "0.5px solid #bdbcdb",
                                    paddingTop: "16px",
                                }}
                            >
                                <div className="detail_item full_width">
                                    <span className="label">Description</span>
                                    <span className="value">
                                        {subjects?.display || "No subjects assigned."}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="buttons">
                            <SecondaryButton
                                title="Close"
                                onClick={() => setActivePopup(null)}
                            />
                            <PrimaryButton
                                title={subjects?.footer?.action_label || "View All"}
                                onClick={() => {
                                    setActivePopup(null);
                                    navigate(
                                        mapActionUrl(
                                            subjects?.footer?.action_url,
                                            "/teacher/subjects"
                                        )
                                    );
                                }}
                            />
                        </div>
                    </div>
                </PopupScreen>
            )}

            {/* POPUP 3: Next Periods Details */}
            {activePopup === "periods" && (
                <PopupScreen
                    title={nextPeriods?.title || "Next Periods"}
                    onClick={() => setActivePopup(null)}
                >
                    <div className="popup_body">
                        <div className="event_details_view">
                            <div className="detail_item">
                                <span className="label">Total Periods</span>
                                <span className="value">
                                    {nextPeriods?.total_count ?? nextPeriods?.periods?.length ?? 0}
                                </span>
                            </div>
                            <div className="detail_item">
                                <span className="label">Status</span>
                                <span className="value">
                                    {cleanFooterText(nextPeriods?.footer?.text) || "Timetable synced"}
                                </span>
                            </div>
                        </div>

                        {nextPeriods?.periods && nextPeriods.periods.length > 0 ? (
                            nextPeriods.periods.map((period, idx) => (
                                <div
                                    key={period.id || idx}
                                    className="event_details_view"
                                    style={{
                                        borderTop: "0.5px solid #bdbcdb",
                                        paddingTop: "16px",
                                    }}
                                >
                                    <div className="detail_item">
                                        <span className="label">Subject</span>
                                        <span className="value">
                                            {period.subject_name || period.subject_code || "N/A"}
                                        </span>
                                    </div>
                                    <div className="detail_item">
                                        <span className="label">Class & Section</span>
                                        <span className="value">
                                            {period.class_name
                                                ? `${period.class_name}${period.section_name ? ` - ${period.section_name}` : ""}`
                                                : "N/A"}
                                        </span>
                                    </div>
                                    <div className="detail_item">
                                        <span className="label">Day</span>
                                        <span className="value">{period.day || "N/A"}</span>
                                    </div>
                                    <div className="detail_item">
                                        <span className="label">Time</span>
                                        <span className="value">
                                            {period.start_time
                                                ? `${period.start_time}${period.end_time ? ` - ${period.end_time}` : ""}`
                                                : "N/A"}
                                        </span>
                                    </div>
                                    {period.subject_code && period.subject_name && (
                                        <div className="detail_item">
                                            <span className="label">Subject Code</span>
                                            <span className="value">{period.subject_code}</span>
                                        </div>
                                    )}
                                    {period.display && (
                                        <div className="detail_item full_width">
                                            <span className="label">Description</span>
                                            <span className="value">{period.display}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : nextPeriods?.pills && nextPeriods.pills.length > 0 ? (
                            <div
                                className="event_details_view"
                                style={{
                                    borderTop: "0.5px solid #bdbcdb",
                                    paddingTop: "16px",
                                }}
                            >
                                {nextPeriods.pills.map((pill, idx) => (
                                    <div key={idx} className="detail_item">
                                        <span className="label">Period {idx + 1}</span>
                                        <span className="value">{pill}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="event_details_view"
                                style={{
                                    borderTop: "0.5px solid #bdbcdb",
                                    paddingTop: "16px",
                                }}
                            >
                                <div className="detail_item full_width">
                                    <span className="label">Schedule</span>
                                    <span className="value">No upcoming periods scheduled.</span>
                                </div>
                            </div>
                        )}

                        <div className="buttons">
                            <SecondaryButton
                                title="Close"
                                onClick={() => setActivePopup(null)}
                            />
                            <PrimaryButton
                                title={nextPeriods?.footer?.action_label || "View All"}
                                onClick={() => {
                                    setActivePopup(null);
                                    navigate(
                                        mapActionUrl(
                                            nextPeriods?.footer?.action_url,
                                            "/teacher/next-periods"
                                        )
                                    );
                                }}
                            />
                        </div>
                    </div>
                </PopupScreen>
            )}
        </div>
    );
};

export default TeachersWidget;
