// src/pages/StaffReport/StaffAttendanceReport/StaffAttendanceReportTable.tsx

import React, { useMemo, useRef } from "react";
import "../../Profile/components/StudentAttendanceReport/StudentAttendanceReport.scss";
import type {
  MonthlyStaffAttendanceRow,
  StaffAttendanceRecord,
} from "../../../hooks/useStaffAttendance";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type StatusCode = "P" | "L" | "A" | "F" | "H" | "Le";
export type Summary = Record<StatusCode, number>;

export const EMPTY_SUMMARY: Summary = { P: 0, L: 0, A: 0, F: 0, H: 0, Le: 0 };

export const STATUS_CLASS: Record<StatusCode, string> = {
  P: "stat_p",
  L: "stat_l",
  A: "stat_a",
  F: "stat_f",
  H: "stat_h",
  Le: "stat_le",
};

// API status string -> short code
export const toStatusCode = (status?: string): StatusCode | null => {
  switch (String(status ?? "").trim().toLowerCase()) {
    case "present":
    case "p":
      return "P";
    case "late":
    case "l":
      return "L";
    case "absent":
    case "a":
      return "A";
    case "half day":
    case "half-day":
    case "half_day":
    case "f":
      return "F";
    case "holiday":
    case "h":
      return "H";
    case "leave":
    case "le":
      return "Le";
    default:
      return null;
  }
};

// Parse "YYYY-MM-DD" without timezone shifting
export const parseDateParts = (date?: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(date ?? ""));
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
};

export interface DayCell {
  code: StatusCode;
  note?: string | null;
}

export interface StaffRow {
  key: string;
  staffId: number | string;
  name: string;
  staffCode: string;
  role: string;
  days: Record<number, DayCell>;
  counts: Summary;
  percentage: string;
}

// Present, Late = 1; Half Day = 0.5; Holidays excluded from working days
export const calcPercentage = (c: Summary) => {
  const workingDays = c.P + c.L + c.A + c.F + c.Le;
  if (workingDays === 0) return "-";
  const attended = c.P + c.L + c.F * 0.5;
  const pct = (attended / workingDays) * 100;
  return pct === 100 || pct === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(2)}%`;
};

export interface MonthDayInfo {
  day: number;
  day_name: string;
  weekday: string;
  is_weekend: boolean;
}

export const getMonthDays = (month: number, year: number): MonthDayInfo[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const weekdays2Letter = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month - 1, i + 1);
    const dayOfWeek = d.getDay();
    return {
      day: i + 1,
      day_name: d.toLocaleDateString("en-US", { weekday: "short" }),
      weekday: weekdays2Letter[dayOfWeek],
      is_weekend: dayOfWeek === 0,
    };
  });
};

/**
 * Builds StaffRow[] from either pre-aggregated monthly-report rows OR raw attendance records
 */
export const buildStaffRows = (
  items: (MonthlyStaffAttendanceRow | StaffAttendanceRecord)[],
  month: number,
  year: number
): StaffRow[] => {
  const rows = new Map<string, StaffRow>();

  items.forEach((item: any) => {
    // Case 1: Pre-aggregated item with attendance / days dictionary
    if (item.attendance || item.days || item.P !== undefined) {
      const staffId = item.staff_id || item.id;
      const key = String(staffId || item.staff_code || item.name);
      const name = item.name || item.full_name || `Staff #${staffId}`;
      const staffCode = item.staff_code || item.staff_no || "-";
      const role = item.role || item.role_name || "-";

      const daysMap: Record<number, DayCell> = {};
      const counts: Summary = { ...EMPTY_SUMMARY };

      const attRecord = item.attendance || item.days || {};
      Object.entries(attRecord).forEach(([dStr, statVal]) => {
        const dNum = Number(dStr);
        if (!isNaN(dNum)) {
          const code = toStatusCode(String(statVal));
          if (code) {
            daysMap[dNum] = { code };
            counts[code] = (counts[code] || 0) + 1;
          }
        }
      });

      // Override counts if backend explicitly provided summary numbers
      (["P", "L", "A", "F", "H", "Le"] as StatusCode[]).forEach((k) => {
        if (typeof item[k] === "number") {
          counts[k] = item[k];
        }
      });

      const percentage =
        item.percentage || item.percent
          ? String(item.percentage || item.percent)
          : calcPercentage(counts);

      rows.set(key, {
        key,
        staffId,
        name,
        staffCode,
        role,
        days: daysMap,
        counts,
        percentage,
      });
      return;
    }

    // Case 2: Individual attendance log record (one record per staff per date)
    const parts = parseDateParts(item.date);
    if (!parts || parts.month !== month || parts.year !== year) return;

    const code = toStatusCode(item.status);
    if (!code) return;

    const staffId = item.staff_id || item.staff?.id || item.id;
    const key = String(staffId || item.staff_code);
    let row = rows.get(key);
    if (!row) {
      const staffObj = item.staff || {};
      row = {
        key,
        staffId,
        name:
          staffObj.full_name ||
          staffObj.name ||
          item.staff_name ||
          item.name ||
          `Staff #${staffId}`,
        staffCode:
          staffObj.staff_code ||
          staffObj.staff_no ||
          item.staff_code ||
          "-",
        role: staffObj.role || item.role || "-",
        days: {},
        counts: { ...EMPTY_SUMMARY },
        percentage: "-",
      };
      rows.set(key, row);
    }

    const existing = row.days[parts.day];
    if (existing) row.counts[existing.code] -= 1;
    row.days[parts.day] = { code, note: item.note };
    row.counts[code] += 1;
  });

  const list = [...rows.values()];
  list.forEach((row) => {
    if (row.percentage === "-") {
      row.percentage = calcPercentage(row.counts);
    }
  });

  return list.sort((a, b) => a.name.localeCompare(b.name));
};

export interface StaffAttendanceReportTableProps {
  records: (MonthlyStaffAttendanceRow | StaffAttendanceRecord)[];
  month: number;
  year: number;
  yearOptions: number[];
  onMonthYearChange: (month: number, year: number) => void;
  search?: string;
  isLoading?: boolean;
  isError?: boolean;
  hasSearched?: boolean;
}

const StaffAttendanceReportTable: React.FC<StaffAttendanceReportTableProps> = ({
  records,
  month,
  year,
  yearOptions,
  onMonthYearChange,
  search = "",
  isLoading,
  isError,
  hasSearched,
}) => {
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const handleTableScroll = (direction: "left" | "right") => {
    tableWrapperRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const handlePrevMonth = () => {
    if (month === 1) onMonthYearChange(12, year - 1);
    else onMonthYearChange(month - 1, year);
  };

  const handleNextMonth = () => {
    if (month === 12) onMonthYearChange(1, year + 1);
    else onMonthYearChange(month + 1, year);
  };

  const days = useMemo(() => getMonthDays(month, year), [month, year]);

  const staffRows = useMemo<StaffRow[]>(
    () => buildStaffRows(records, month, year),
    [records, month, year]
  );

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staffRows;
    return staffRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.staffCode.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
    );
  }, [staffRows, search]);

  const summary = useMemo<Summary>(() => {
    return visibleRows.reduce<Summary>(
      (acc, row) => {
        (Object.keys(acc) as StatusCode[]).forEach((k) => {
          acc[k] += row.counts[k];
        });
        return acc;
      },
      { ...EMPTY_SUMMARY }
    );
  }, [visibleRows]);

  const getDayCell = (
    row: StaffRow,
    dayItem: { day: number; is_weekend: boolean }
  ) => {
    const cell = row.days[dayItem.day];
    if (cell) {
      return {
        display: cell.code,
        className: `cell_day ${STATUS_CLASS[cell.code]}`,
        note: cell.note || "",
      };
    }
    if (dayItem.is_weekend) {
      return { display: "W", className: "cell_day weekend stat_w", note: "" };
    }
    return { display: "", className: "cell_day", note: "" };
  };

  const emptyMessage = !hasSearched
    ? "Select criteria and click Search to view the report."
    : `No staff attendance records for ${MONTH_NAMES[month - 1]} ${year}.`;

  return (
    <div className="student_attendance_report">
      <div className="table_canvas">
        {/* Header: title, summary badges, month/year selector */}
        <div className="table_header">
          <div className="table_title">
            <p>Staff Attendance Report</p>
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
              value={month}
              onChange={(e) => onMonthYearChange(Number(e.target.value), year)}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className="select_input"
              value={year}
              onChange={(e) => onMonthYearChange(month, Number(e.target.value))}
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

        {/* Legend & horizontal scroll controls */}
        <div className="report_legend_bar">
          <div className="legend_items_group">
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

          <div className="table_scroll_nav">
            <span className="scroll_label">Scroll days:</span>
            <button
              type="button"
              className="scroll_btn"
              onClick={() => handleTableScroll("left")}
              title="Scroll left"
              aria-label="Scroll table left"
            >
              &larr;
            </button>
            <button
              type="button"
              className="scroll_btn"
              onClick={() => handleTableScroll("right")}
              title="Scroll right"
              aria-label="Scroll table right"
            >
              &rarr;
            </button>
          </div>
        </div>

        {/* Table Matrix */}
        <div className="attendance_table_sections">
          {isLoading ? (
            <div className="loading_state">
              <span>Loading attendance report...</span>
            </div>
          ) : isError ? (
            <div className="error_state">
              <span>Failed to load attendance report.</span>
            </div>
          ) : null}

          <div
            className="table_wrapper attendance_table_wrapper"
            ref={tableWrapperRef}
          >
            <table className="custom_table attendance_matrix_table">
              <thead>
                <tr>
                  <th rowSpan={2} className="col_name">
                    Name
                  </th>
                  <th rowSpan={2} className="col_admission">
                    Staff ID
                  </th>
                  <th rowSpan={2} className="col_role">
                    Role
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
                  {days.map((d) => (
                    <th key={`num_${d.day}`} className="col_day_num">
                      {d.day}
                    </th>
                  ))}
                </tr>
                <tr>
                  {days.map((d) => (
                    <th key={`name_${d.day}`} className="col_day_name">
                      {d.day_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={10 + days.length}
                      className="empty_state"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.key}>
                      <td className="cell_name">{row.name}</td>
                      <td className="cell_admission">{row.staffCode}</td>
                      <td className="cell_role">{row.role}</td>
                      <td className="cell_stat">{row.counts.P}</td>
                      <td className="cell_stat">{row.counts.L}</td>
                      <td className="cell_stat">{row.counts.A}</td>
                      <td className="cell_stat">{row.counts.F}</td>
                      <td className="cell_stat">{row.counts.H}</td>
                      <td className="cell_stat">{row.counts.Le}</td>
                      <td className="cell_percent">{row.percentage}</td>
                      {days.map((dayItem) => {
                        const { display, className, note } = getDayCell(
                          row,
                          dayItem
                        );
                        return (
                          <td
                            key={`cell_${dayItem.day}`}
                            title={note}
                            className={className}
                          >
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAttendanceReportTable;
