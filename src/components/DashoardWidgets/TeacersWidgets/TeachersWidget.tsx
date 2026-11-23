import React from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay, { ErrorStatusOverlay } from "../../Loadingoverlay";
import { PrimaryButton } from "../../Buttons/Buttons";
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
    if (normalized.includes("class")) return "/academics/class";
    if (normalized.includes("subject")) return "/academics/subjects";
    if (normalized.includes("timetable")) return "/academics/timetable";
    return url;
};

const cleanFooterText = (text?: string): string => {
    if (!text) return "";
    return text.replace(/^[\s•·-]+/, "").trim();
};

const TeachersWidget: React.FC<TeachersWidgetProps> = ({ teacherId }) => {
    const navigate = useNavigate();
    const { data: authData } = useAuth();
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
                        onClick={() =>
                            navigate(
                                mapActionUrl(
                                    yourStudents?.footer?.action_url,
                                    "/student-info/student-list"
                                )
                            )
                        }
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
                        onClick={() =>
                            navigate(
                                mapActionUrl(yourClasses?.footer?.action_url, "/academics/class")
                            )
                        }
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
                        onClick={() =>
                            navigate(
                                mapActionUrl(
                                    subjects?.footer?.action_url,
                                    "/academics/subjects"
                                )
                            )
                        }
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
                        onClick={() =>
                            navigate(
                                mapActionUrl(
                                    nextPeriods?.footer?.action_url,
                                    "/academics/timetable"
                                )
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default TeachersWidget;
