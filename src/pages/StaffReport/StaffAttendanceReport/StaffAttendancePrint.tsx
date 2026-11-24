// src/pages/StaffReport/StaffAttendanceReport/StaffAttendancePrint.tsx

import React from "react";
import "./StaffAttendancePrint.scss";
import type {
  MonthlyStaffAttendanceRow,
  StaffAttendanceRecord,
} from "../../../hooks/useStaffAttendance";
import {
  buildStaffRows,
  getMonthDays,
  type MonthDayInfo,
  type StaffRow,
} from "./StaffAttendanceReportTable";

export interface StaffAttendancePrintProps {
  schoolName?: string;
  schoolAddress?: string;
  logoUrl?: string;
  roleName?: string;
  monthName?: string;
  month: number;
  year: number;
  staffRows: StaffRow[];
  days: MonthDayInfo[];
}

export interface PrintMonthlyStaffAttendanceReportParams {
  schoolName?: string;
  schoolAddress?: string;
  logoUrl?: string;
  roleName?: string;
  monthName?: string;
  month: number;
  year: number;
  records: (MonthlyStaffAttendanceRow | StaffAttendanceRecord)[];
}

const escapeHtml = (str?: string | number | null): string => {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * React component for rendering the monthly staff attendance report.
 * Matches A4 Landscape layout.
 */
export const StaffAttendancePrint: React.FC<StaffAttendancePrintProps> = ({
  schoolName,
  schoolAddress,
  logoUrl,
  roleName,
  monthName,
  year,
  staffRows,
  days,
}) => {
  return (
    <div className="attendance_print_sheet">
      {/* Header */}
      <div className="print_header">
        <div className="print_header_left">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="print_logo" />
          ) : (
            <div style={{ width: 140 }} />
          )}
        </div>
        <div className="print_header_center">
          <h1 className="print_school_name">
            {schoolName || "SCHOOL ATTENDANCE REPORT"}
          </h1>
          {schoolAddress && (
            <p className="print_school_address">{schoolAddress}</p>
          )}
          <h2 className="print_report_title">Staff Attendance Report</h2>
        </div>
        <div className="print_header_right">
          <table className="print_meta_table">
            <tbody>
              <tr>
                <td className="meta_label">Role:</td>
                <td className="meta_value">{roleName || "All"}</td>
              </tr>
              <tr>
                <td className="meta_label">Month:</td>
                <td className="meta_value">{monthName || "-"}</td>
              </tr>
              <tr>
                <td className="meta_label">Year:</td>
                <td className="meta_value">{year}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Table */}
      <table className="print_attendance_table">
        <thead>
          <tr>
            <th rowSpan={2} className="col_sl">
              Sl
            </th>
            <th rowSpan={2} className="col_name">
              Name
            </th>
            <th rowSpan={2} className="col_adm">
              Staff ID
            </th>
            <th rowSpan={2} className="col_adm">
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
            <th rowSpan={2} className="col_pct">
              %
            </th>
            {days.map((d) => (
              <th key={`day_${d.day}`} className="col_day_num">
                {d.day}
              </th>
            ))}
          </tr>
          <tr>
            {days.map((d) => (
              <th key={`w_${d.day}`} className="col_day_w">
                {d.weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staffRows.length === 0 ? (
            <tr>
              <td
                colSpan={11 + days.length}
                style={{ padding: "16px 0", textAlign: "center" }}
              >
                No staff attendance records found.
              </td>
            </tr>
          ) : (
            staffRows.map((row, idx) => (
              <tr key={row.key || idx}>
                <td className="cell_sl">{idx + 1}</td>
                <td className="cell_name" title={row.name}>
                  {row.name}
                </td>
                <td className="cell_adm">{row.staffCode}</td>
                <td className="cell_adm">{row.role}</td>
                <td className="cell_stat">{row.counts.P}</td>
                <td className="cell_stat">{row.counts.L}</td>
                <td className="cell_stat">{row.counts.A}</td>
                <td className="cell_stat">{row.counts.F}</td>
                <td className="cell_stat">{row.counts.H}</td>
                <td className="cell_stat">{row.counts.Le}</td>
                <td className="cell_pct">{row.percentage}</td>
                {days.map((d) => {
                  const dayCell = row.days[d.day];
                  return (
                    <td
                      key={`cell_${row.key}_${d.day}`}
                      className="cell_day_val"
                    >
                      {dayCell ? dayCell.code : "-"}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Triggers printing of the monthly staff attendance report in A4 landscape format.
 */
export const printMonthlyStaffAttendanceReport = (
  params: PrintMonthlyStaffAttendanceReportParams
): void => {
  const {
    schoolName = "School Attendance Report",
    schoolAddress = "",
    logoUrl = "",
    roleName = "All",
    monthName = "-",
    month,
    year,
    records,
  } = params;

  const days = getMonthDays(month, year);
  const staffRows = buildStaffRows(records, month, year);

  const oldIframe = document.getElementById("staff-attendance-print-frame");
  if (oldIframe) {
    oldIframe.parentNode?.removeChild(oldIframe);
  }

  const iframe = document.createElement("iframe");
  iframe.id = "staff-attendance-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const daysThNum = days
    .map((d) => `<th class="col_day_num">${d.day}</th>`)
    .join("");
  const daysThW = days
    .map((d) => `<th class="col_day_w">${escapeHtml(d.weekday)}</th>`)
    .join("");

  const rowsHtml =
    staffRows.length === 0
      ? `<tr><td colspan="${11 + days.length}" class="empty_cell">No attendance records found.</td></tr>`
      : staffRows
          .map((row, idx) => {
            const dayTds = days
              .map((d) => {
                const dayCell = row.days[d.day];
                const code = dayCell ? dayCell.code : "-";
                const isW = !dayCell && d.is_weekend;
                const cellVal = isW ? "W" : code;
                const cls = dayCell
                  ? `stat_${dayCell.code.toLowerCase()}`
                  : isW
                  ? "weekend"
                  : "";
                return `<td class="cell_day_val ${cls}">${cellVal}</td>`;
              })
              .join("");

            return `
              <tr>
                <td class="cell_sl">${idx + 1}</td>
                <td class="cell_name">${escapeHtml(row.name)}</td>
                <td class="cell_adm">${escapeHtml(row.staffCode)}</td>
                <td class="cell_adm">${escapeHtml(row.role)}</td>
                <td class="cell_stat">${row.counts.P}</td>
                <td class="cell_stat">${row.counts.L}</td>
                <td class="cell_stat">${row.counts.A}</td>
                <td class="cell_stat">${row.counts.F}</td>
                <td class="cell_stat">${row.counts.H}</td>
                <td class="cell_stat">${row.counts.Le}</td>
                <td class="cell_pct">${escapeHtml(row.percentage)}</td>
                ${dayTds}
              </tr>
            `;
          })
          .join("");

  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="Logo" class="print_logo" />`
    : `<div style="width:140px;"></div>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Staff Attendance Report - ${escapeHtml(monthName)} ${year}</title>
  <style>
    @page { size: landscape; margin: 8mm 6mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; padding: 0; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #111; background: #fff; }
    .print_sheet { width: 100%; }
    .print_header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; width: 100%; border-bottom: 1.5px solid #333; padding-bottom: 6px; }
    .print_header_left { width: 140px; }
    .print_logo { max-height: 48px; max-width: 130px; object-fit: contain; }
    .print_header_center { flex: 1; text-align: center; padding: 0 10px; }
    .print_school_name { font-size: 13px; font-weight: 700; text-transform: uppercase; margin: 0 0 2px 0; color: #000; letter-spacing: 0.3px; }
    .print_school_address { font-size: 9px; color: #444; margin: 0 0 4px 0; }
    .print_report_title { font-size: 11px; font-weight: 700; color: #111; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .print_header_right { width: 150px; }
    .print_meta_table { width: 100%; border-collapse: collapse; font-size: 9px; }
    .print_meta_table td { padding: 1px 3px; border: none; }
    .meta_label { font-weight: 700; color: #444; text-align: right; width: 45%; }
    .meta_value { color: #000; font-weight: 600; }
    .print_attendance_table { width: 100%; border-collapse: collapse; font-size: 7.5px; table-layout: fixed; margin-top: 4px; }
    .print_attendance_table th, .print_attendance_table td { border: 0.5px solid #444; padding: 2px 1px; text-align: center; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .print_attendance_table thead th { background-color: #eaeaea; font-weight: 700; color: #000; }
    .col_sl { width: 20px; }
    .col_name { width: 90px; text-align: left; padding-left: 3px; }
    .col_adm { width: 50px; }
    .col_stat { width: 15px; font-weight: 700; }
    .col_pct { width: 26px; font-weight: 700; }
    .col_day_num { width: auto; font-size: 7.5px; }
    .col_day_w { width: auto; font-size: 6.5px; text-transform: uppercase; }
    .cell_sl { font-size: 7.5px; }
    .cell_name { text-align: left; padding-left: 3px; font-weight: 600; }
    .cell_adm { font-size: 7.5px; }
    .cell_pct { font-weight: 700; }
    .cell_day_val { font-size: 7.5px; font-weight: 600; }
    .stat_p { color: #16a34a; }
    .stat_l { color: #d97706; }
    .stat_a { color: #dc2626; }
    .stat_f { color: #0284c7; }
    .stat_h { color: #64748b; }
    .stat_le { color: #6366f1; }
    .weekend { color: #94a3b8; background-color: #f8fafc; }
    .empty_cell { padding: 16px 0; text-align: center; font-size: 9px; color: #666; }
    .print_footer { margin-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #444; border-top: 0.5px solid #ccc; padding-top: 4px; }
    .legend_items { display: flex; gap: 8px; }
    .legend_item strong { margin-left: 2px; }
  </style>
</head>
<body>
  <div class="print_sheet">
    <div class="print_header">
      <div class="print_header_left">${logoHtml}</div>
      <div class="print_header_center">
        <h1 class="print_school_name">${escapeHtml(schoolName)}</h1>
        ${schoolAddress ? `<p class="print_school_address">${escapeHtml(schoolAddress)}</p>` : ""}
        <h2 class="print_report_title">Staff Attendance Report</h2>
      </div>
      <div class="print_header_right">
        <table class="print_meta_table">
          <tbody>
            <tr><td class="meta_label">Role:</td><td class="meta_value">${escapeHtml(roleName)}</td></tr>
            <tr><td class="meta_label">Month:</td><td class="meta_value">${escapeHtml(monthName)}</td></tr>
            <tr><td class="meta_label">Year:</td><td class="meta_value">${year}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <table class="print_attendance_table">
      <thead>
        <tr>
          <th rowspan="2" class="col_sl">Sl</th>
          <th rowspan="2" class="col_name">Name</th>
          <th rowspan="2" class="col_adm">Staff ID</th>
          <th rowspan="2" class="col_adm">Role</th>
          <th rowspan="2" class="col_stat">P</th>
          <th rowspan="2" class="col_stat">L</th>
          <th rowspan="2" class="col_stat">A</th>
          <th rowspan="2" class="col_stat">F</th>
          <th rowspan="2" class="col_stat">H</th>
          <th rowspan="2" class="col_stat">Le</th>
          <th rowspan="2" class="col_pct">%</th>
          ${daysThNum}
        </tr>
        <tr>
          ${daysThW}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="print_footer">
      <div class="legend_items">
        <span class="legend_item">Present: <strong class="stat_p">P</strong></span>
        <span class="legend_item">Late: <strong class="stat_l">L</strong></span>
        <span class="legend_item">Absent: <strong class="stat_a">A</strong></span>
        <span class="legend_item">Half Day: <strong class="stat_f">F</strong></span>
        <span class="legend_item">Holiday: <strong class="stat_h">H</strong></span>
        <span class="legend_item">Leave: <strong class="stat_le">Le</strong></span>
      </div>
      <div>Printed on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
    </div>
  </div>
</body>
</html>`;

  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Staff attendance print failed:", e);
    }
  }, 250);
};
