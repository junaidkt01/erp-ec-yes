import React, { useMemo, useState } from "react";
import {
    useFetchMonthlyStudentAttendanceReport,
    type DayHeaderItem,
    type MonthlyAttendanceStudentRow,
} from "../../../../hooks/useStudentAttendance";
import "./StudentAttendanceReport.scss";

interface StudentAttendanceReportProps {
    student?: any;
    studentId?: number | string;
    classId?: number | string;
    sectionId?: number | string;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const StudentAttendanceReport: React.FC<StudentAttendanceReportProps> = ({
    student,
    studentId,
    classId,
    sectionId,
}) => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

    // Fallback ID if not explicitly passed
    const resolvedStudentId = studentId || student?.id || student?.student_id;
    const resolvedClassId = classId || student?.class_id || student?.class?.id;
    const resolvedSectionId = sectionId || student?.section_id || student?.section?.id;

    const { data: reportData, isLoading, isError } = useFetchMonthlyStudentAttendanceReport({
        student_id: resolvedStudentId,
        class_id: resolvedClassId,
        section_id: resolvedSectionId,
        month: selectedMonth,
        year: selectedYear,
    });

    // Month Navigation
    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear((prev) => prev - 1);
        } else {
            setSelectedMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear((prev) => prev + 1);
        } else {
            setSelectedMonth((prev) => prev + 1);
        }
    };

    // Generate days for the selected month/year if not provided by backend
    const computedDays = useMemo<DayHeaderItem[]>(() => {
        if (reportData?.days_header && Array.isArray(reportData.days_header) && reportData.days_header.length > 0) {
            return reportData.days_header.map((d: any, index: number) => ({
                day: d.day ?? d.date_number ?? index + 1,
                day_name: d.day_name ?? d.weekday ?? d.name ?? "",
                is_weekend: d.is_weekend ?? (d.day_name === "Sun" || d.weekday === "Sun"),
                ...d,
            }));
        }

        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const d = new Date(selectedYear, selectedMonth - 1, dayNum);
            const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
            const isWeekend = d.getDay() === 0; // Sunday
            return {
                day: dayNum,
                day_name: weekday,
                is_weekend: isWeekend,
            };
        });
    }, [reportData?.days_header, selectedMonth, selectedYear]);

    // Format summary stats
    const summary = useMemo(() => {
        const defaultSummary = { P: 0, L: 0, A: 0, F: 0, H: 0, Le: 0 };
        if (reportData?.summary) {
            return {
                P: reportData.summary.P ?? 0,
                L: reportData.summary.L ?? 0,
                A: reportData.summary.A ?? 0,
                F: reportData.summary.F ?? 0,
                H: reportData.summary.H ?? 0,
                Le: reportData.summary.Le ?? 0,
            };
        }
        return defaultSummary;
    }, [reportData?.summary]);

    // Student rows to display
    const studentRows = useMemo<MonthlyAttendanceStudentRow[]>(() => {
        if (reportData?.data && Array.isArray(reportData.data) && reportData.data.length > 0) {
            return reportData.data;
        }

        // Fallback default single row for the current student
        const studentName = student?.full_name || student?.name || "AFSANA KOSAR";
        const admissionNo = student?.admission_no || student?.student_code || "1";

        return [
            {
                id: resolvedStudentId || 1,
                name: studentName,
                full_name: studentName,
                admission_no: admissionNo,
                P: summary.P,
                L: summary.L,
                A: summary.A,
                F: summary.F,
                H: summary.H,
                Le: summary.Le,
                percentage: "100%",
                attendance: {},
            },
        ];
    }, [reportData?.data, student, resolvedStudentId, summary]);

    // Helper to get day cell content
    const getDayCellData = (row: MonthlyAttendanceStudentRow, dayItem: DayHeaderItem) => {
        const dayKey = String(dayItem.day);
        const val =
            row[dayKey] ??
            row[`day_${dayKey}`] ??
            row.attendance?.[dayKey] ??
            row.days?.[dayKey] ??
            row.attendances?.[dayKey];

        if (val) {
            const normalized = String(val).trim();
            const lower = normalized.toLowerCase();
            let statusClass = "cell_day";

            if (lower === "p" || lower === "present") statusClass += " stat_p";
            else if (lower === "l" || lower === "late") statusClass += " stat_l";
            else if (lower === "a" || lower === "absent") statusClass += " stat_a";
            else if (lower === "f" || lower === "half day") statusClass += " stat_f";
            else if (lower === "h" || lower === "holiday") statusClass += " stat_h";
            else if (lower === "le" || lower === "leave") statusClass += " stat_le";
            else if (lower === "w" || lower === "weekend") statusClass += " stat_w weekend";

            return {
                display: normalized.length > 2 ? normalized.charAt(0).toUpperCase() : normalized,
                className: statusClass,
            };
        }

        // If Sunday / Weekend and no record exists, default to "W"
        if (dayItem.is_weekend || dayItem.day_name === "Sun") {
            return {
                display: "W",
                className: "cell_day weekend stat_w",
            };
        }

        return {
            display: "",
            className: "cell_day",
        };
    };

    const yearOptions = useMemo(() => {
        const currentY = today.getFullYear();
        return [currentY - 2, currentY - 1, currentY, currentY + 1];
    }, [today]);

    return (
        <div className="student_attendance_report">
            <div className="table_canvas">
                {/* Table Header with Title, Badges, and Month/Year controls */}
                <div className="table_header">
                    <div className="table_title">
                        <p>Student Attendance Report</p>
                        <div className="summary_badges">
                            <span className="stat p">P:{summary.P}</span>
                            <span className="stat l">L:{summary.L}</span>
                            <span className="stat a">A:{summary.A}</span>
                            <span className="stat f">F:{summary.F}</span>
                            <span className="stat h">H:{summary.H}</span>
                            <span className="stat le">Le:{summary.Le}</span>
                        </div>
                    </div>

                    <div className="month_year_selector">
                        <button
                            className="nav_btn"
                            onClick={handlePrevMonth}
                            title="Previous Month"
                            type="button"
                        >
                            ‹
                        </button>

                        <select
                            className="select_input"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                            {MONTH_NAMES.map((m, idx) => (
                                <option key={m} value={idx + 1}>
                                    {m}
                                </option>
                            ))}
                        </select>

                        <select
                            className="select_input"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>

                        <button
                            className="nav_btn"
                            onClick={handleNextMonth}
                            title="Next Month"
                            type="button"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Legend Row */}
                <div className="report_legend_bar">
                    <span className="legend_item">
                        Present: <strong className="p">P</strong>
                    </span>
                    <span className="legend_item">
                        Late: <strong className="l">L</strong>
                    </span>
                    <span className="legend_item">
                        Absent: <strong className="a">A</strong>
                    </span>
                    <span className="legend_item">
                        Half Day: <strong className="f">F</strong>
                    </span>
                    <span className="legend_item">
                        Holiday: <strong className="h">H</strong>
                    </span>
                    <span className="legend_item">
                        Leave: <strong className="le">Le</strong>
                    </span>
                </div>

                {/* Table Section */}
                <div className="table_section">
                    {isLoading ? (
                        <div className="loading_state">
                            <span>Loading attendance report...</span>
                        </div>
                    ) : isError ? (
                        <div className="error_state">
                            <span>Failed to load attendance report. Showing local view.</span>
                        </div>
                    ) : null}

                    <div className="table_wrapper attendance_table_wrapper">
                        <table className="custom_table attendance_matrix_table">
                            <thead>
                                <tr>
                                    <th rowSpan={2} className="col_name">
                                        Name
                                    </th>
                                    <th rowSpan={2} className="col_admission">
                                        Admission No
                                    </th>
                                    <th rowSpan={2} className="col_stat">
                                        P
                                    </th>
                                    <th rowSpan={2} className="col_stat">
                                        L
                                    </th>
                                    <th rowSpan={2} className="col_stat">
                                        A
                                    </th>
                                    <th rowSpan={2} className="col_stat">
                                        F
                                    </th>
                                    <th rowSpan={2} className="col_stat">
                                        H
                                    </th>
                                    <th rowSpan={2} className="col_stat">
                                        Le
                                    </th>
                                    <th rowSpan={2} className="col_percent">
                                        %
                                    </th>
                                    {computedDays.map((d) => (
                                        <th key={`num_${d.day}`} className="col_day_num">
                                            {d.day}
                                        </th>
                                    ))}
                                </tr>
                                <tr>
                                    {computedDays.map((d) => (
                                        <th key={`name_${d.day}`} className="col_day_name">
                                            {d.day_name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {studentRows.map((row, idx) => {
                                    const displayName = row.full_name || row.name || student?.full_name || "N/A";
                                    const admissionNo =
                                        row.admission_no || row.roll_no || student?.admission_no || "1";
                                    const pCount = row.P ?? summary.P;
                                    const lCount = row.L ?? summary.L;
                                    const aCount = row.A ?? summary.A;
                                    const fCount = row.F ?? summary.F;
                                    const hCount = row.H ?? summary.H;
                                    const leCount = row.Le ?? summary.Le;
                                    const percent = row.percentage ?? row.percent ?? "100%";

                                    return (
                                        <tr key={row.id ?? idx}>
                                            <td className="cell_name">{displayName}</td>
                                            <td className="cell_admission">{admissionNo}</td>
                                            <td className="cell_stat">{pCount}</td>
                                            <td className="cell_stat">{lCount}</td>
                                            <td className="cell_stat">{aCount}</td>
                                            <td className="cell_stat">{fCount}</td>
                                            <td className="cell_stat">{hCount}</td>
                                            <td className="cell_stat">{leCount}</td>
                                            <td className="cell_percent">{percent}</td>

                                            {computedDays.map((dayItem) => {
                                                const { display, className } = getDayCellData(row, dayItem);
                                                return (
                                                    <td key={`cell_${dayItem.day}`} className={className}>
                                                        {display}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceReport;
