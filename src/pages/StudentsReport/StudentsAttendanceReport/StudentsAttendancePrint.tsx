import React from "react";
import "./StudentsAttendancePrint.scss";
import type { StudentAttendanceRecord } from "../../../hooks/useStudentAttendance";
import {
    buildStudentRows,
    getMonthDays,
    type MonthDayInfo,
    type StudentRow,
} from "./StudentsAttendanceReportTable";

export interface StudentsAttendancePrintProps {
    schoolName?: string;
    schoolAddress?: string;
    logoUrl?: string;
    className?: string;
    sectionName?: string;
    monthName?: string;
    month: number;
    year: number;
    studentRows: StudentRow[];
    days: MonthDayInfo[];
}

export interface PrintMonthlyAttendanceReportParams {
    schoolName?: string;
    schoolAddress?: string;
    logoUrl?: string;
    className?: string;
    sectionName?: string;
    monthName?: string;
    month: number;
    year: number;
    records: StudentAttendanceRecord[];
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
 * React component for rendering the monthly student attendance report.
 * Matches A4 Landscape layout as defined in the print preview template.
 */
export const StudentsAttendancePrint: React.FC<StudentsAttendancePrintProps> = ({
    schoolName,
    schoolAddress,
    logoUrl,
    className,
    sectionName,
    monthName,
    year,
    studentRows,
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
                    <h1 className="print_school_name">{schoolName || "SCHOOL ATTENDANCE REPORT"}</h1>
                    {schoolAddress && <p className="print_school_address">{schoolAddress}</p>}
                    <h2 className="print_report_title">Student Attendance Report</h2>
                </div>
                <div className="print_header_right">
                    <table className="print_meta_table">
                        <tbody>
                            <tr>
                                <td className="meta_label">Class:</td>
                                <td className="meta_value">{className || "-"}</td>
                            </tr>
                            <tr>
                                <td className="meta_label">Section:</td>
                                <td className="meta_value">{sectionName || "-"}</td>
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
                        <th rowSpan={2} className="col_sl">Sl</th>
                        <th rowSpan={2} className="col_name">Name</th>
                        <th rowSpan={2} className="col_adm">Admission No</th>
                        <th rowSpan={2} className="col_stat">P</th>
                        <th rowSpan={2} className="col_stat">L</th>
                        <th rowSpan={2} className="col_stat">A</th>
                        <th rowSpan={2} className="col_stat">F</th>
                        <th rowSpan={2} className="col_stat">H</th>
                        <th rowSpan={2} className="col_stat">Le</th>
                        <th rowSpan={2} className="col_pct">%</th>
                        {days.map((d) => (
                            <th key={`day_${d.day}`} className="col_day_num">{d.day}</th>
                        ))}
                    </tr>
                    <tr>
                        {days.map((d) => (
                            <th key={`w_${d.day}`} className="col_day_w">{d.weekday}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {studentRows.length === 0 ? (
                        <tr>
                            <td colSpan={10 + days.length} style={{ padding: "16px 0", textAlign: "center" }}>
                                No attendance records found.
                            </td>
                        </tr>
                    ) : (
                        studentRows.map((row, idx) => (
                            <tr key={row.key || idx}>
                                <td className="cell_sl">{idx + 1}</td>
                                <td className="cell_name" title={row.name}>{row.name}</td>
                                <td className="cell_adm">{row.admissionNo}</td>
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
                                        <td key={`cell_${row.key}_${d.day}`} className="cell_day_val">
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
 * Triggers printing of the monthly attendance report in A4 landscape format.
 * Generates an isolated iframe to guarantee no SPA/layout styling leaks.
 */
export const printMonthlyAttendanceReport = (params: PrintMonthlyAttendanceReportParams): void => {
    const {
        schoolName = "School Attendance Report",
        schoolAddress = "",
        logoUrl = "",
        className = "-",
        sectionName = "-",
        monthName = "-",
        month,
        year,
        records,
    } = params;

    const days = getMonthDays(month, year);
    const studentRows = buildStudentRows(records, month, year);

    const oldIframe = document.getElementById("student-attendance-print-frame");
    if (oldIframe) {
        oldIframe.parentNode?.removeChild(oldIframe);
    }

    const iframe = document.createElement("iframe");
    iframe.id = "student-attendance-print-frame";
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

    const daysThWeekday = days
        .map((d) => `<th class="col_day_w">${d.weekday}</th>`)
        .join("");

    const rowsHtml = studentRows.length === 0
        ? `<tr><td colspan="${10 + days.length}" style="padding: 20px; font-size: 11px; text-align: center;">No attendance records found for ${escapeHtml(monthName)} ${year}.</td></tr>`
        : studentRows
            .map((row, idx) => {
                const dayTds = days
                    .map((d) => {
                        const cell = row.days[d.day];
                        const val = cell ? escapeHtml(cell.code) : "-";
                        return `<td class="cell_day_val">${val}</td>`;
                    })
                    .join("");

                return `
                    <tr>
                        <td class="cell_sl">${idx + 1}</td>
                        <td class="cell_name" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</td>
                        <td class="cell_adm">${escapeHtml(row.admissionNo)}</td>
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

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Student Attendance Report - ${escapeHtml(className)} ${escapeHtml(sectionName)} - ${escapeHtml(monthName)} ${year}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 6mm 5mm 6mm 5mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #000000;
      background: #ffffff;
      padding: 2mm 0;
      width: 100%;
    }
    .attendance_print_sheet {
      width: 100%;
    }
    .print_header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      width: 100%;
    }
    .print_header_left {
      width: 160px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .print_logo {
      max-height: 52px;
      max-width: 150px;
      object-fit: contain;
    }
    .print_header_center {
      flex: 1;
      text-align: center;
      padding: 0 10px;
    }
    .print_school_name {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #000000;
      margin-bottom: 2px;
    }
    .print_school_address {
      font-size: 9.5px;
      color: #333333;
      margin-bottom: 5px;
    }
    .print_report_title {
      font-size: 11.5px;
      font-weight: 700;
      color: #000000;
      margin-top: 3px;
    }
    .print_header_right {
      width: 160px;
      display: flex;
      justify-content: flex-end;
    }
    .print_meta_table {
      border-collapse: collapse;
      border: 1px solid #777777;
      font-size: 9px;
      width: 140px;
    }
    .print_meta_table td {
      border: 1px solid #777777;
      padding: 2px 5px;
      line-height: 1.2;
    }
    .meta_label {
      font-weight: 700;
      width: 52px;
      color: #222222;
    }
    .meta_value {
      font-weight: 500;
      color: #000000;
    }
    .print_attendance_table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 8px;
    }
    .print_attendance_table thead {
      display: table-header-group;
    }
    .print_attendance_table tr {
      page-break-inside: avoid;
    }
    .print_attendance_table th,
    .print_attendance_table td {
      border: 1px solid #777777;
      text-align: center;
      vertical-align: middle;
      padding: 2px 1px;
      height: 16px;
      line-height: 1.1;
    }
    .print_attendance_table th {
      background-color: #e5e7eb !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-weight: 700;
      color: #000000;
    }
    .col_sl { width: 22px; }
    .col_name { width: 140px; text-align: left !important; padding-left: 4px !important; }
    .col_adm { width: 60px; }
    .col_stat { width: 18px; }
    .col_pct { width: 40px; }
    .col_day_num { width: auto; font-size: 8px; }
    .col_day_w { width: auto; font-size: 7.5px; }

    .cell_sl { font-weight: 400; }
    .cell_name {
      text-align: left !important;
      padding-left: 4px !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 400;
    }
    .cell_adm {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cell_stat { font-weight: 400; }
    .cell_pct { font-weight: 500; }
    .cell_day_val { font-weight: 400; }
  </style>
</head>
<body>
  <div class="attendance_print_sheet">
    <div class="print_header">
      <div class="print_header_left">
        ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Logo" class="print_logo" />` : `<div style="width:140px;"></div>`}
      </div>
      <div class="print_header_center">
        <h1 class="print_school_name">${escapeHtml(schoolName)}</h1>
        ${schoolAddress ? `<p class="print_school_address">${escapeHtml(schoolAddress)}</p>` : ""}
        <h2 class="print_report_title">Student Attendance Report</h2>
      </div>
      <div class="print_header_right">
        <table class="print_meta_table">
          <tbody>
            <tr><td class="meta_label">Class:</td><td class="meta_value">${escapeHtml(className)}</td></tr>
            <tr><td class="meta_label">Section:</td><td class="meta_value">${escapeHtml(sectionName)}</td></tr>
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
          <th rowspan="2" class="col_adm">Admission No</th>
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
          ${daysThWeekday}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>
</body>
</html>
    `;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
        console.error("Unable to access print iframe document");
        return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const doPrint = () => {
        try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        } catch (e) {
            console.error("Print invocation error:", e);
        } finally {
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 2000);
        }
    };

    const logoImg = doc.querySelector(".print_logo") as HTMLImageElement | null;
    if (logoImg && !logoImg.complete) {
        logoImg.onload = () => doPrint();
        logoImg.onerror = () => doPrint();
        setTimeout(doPrint, 1000); // Fallback if image hang
    } else {
        setTimeout(doPrint, 250);
    }
};

export default StudentsAttendancePrint;
