import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { InputField } from "../../../components/InputFields/InputFields";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { BASE_URL } from "../../../api/endpoints";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllStudents } from "../../../hooks/useStudent";
import {
    useFetchStudentIncidents,
    useDeleteStudentIncident,
} from "../../../hooks/useIncidents";
import { useDebounce } from "../../../hooks/useDebounce";
import "./BehaviourReport.scss";

interface CriteriaFilter {
    class_id: string | number;
    section_id: string | number;
    student_id: string | number;
    date_from: string;
    date_to: string;
}

const initialCriteria: CriteriaFilter = {
    class_id: "",
    section_id: "",
    student_id: "",
    date_from: "",
    date_to: "",
};

const BehaviourReport: React.FC = () => {
    const [page, setPage] = useState(1);
    const [filterData, setFilterData] = useState<CriteriaFilter>(initialCriteria);
    const [appliedFilters, setAppliedFilters] = useState<CriteriaFilter>(initialCriteria);
    const [tableSearch, setTableSearch] = useState("");
    const debouncedTableSearch = useDebounce(tableSearch, 300);

    // Filter Dropdown Queries
    const { data: studentClasses } = useFetchAllStudentClasses();
    const classOptions = useMemo(() => {
        return (studentClasses || []).map((cls: any) => ({
            label: cls.name,
            value: cls.id,
        }));
    }, [studentClasses]);

    const { data: sections } = useFetchAllSections();
    const sectionOptions = useMemo(() => {
        if (!filterData.class_id) return [];
        return (sections || [])
            .filter((sec: any) => String(sec.class_id) === String(filterData.class_id))
            .map((sec: any) => ({
                label: sec.name,
                value: sec.id,
            }));
    }, [sections, filterData.class_id]);

    const { data: studentsData } = useFetchAllStudents(1, {
        class_id: filterData.class_id || undefined,
        section_id: filterData.section_id || undefined,
    });

    const studentOptions = useMemo(() => {
        const list = studentsData?.data || [];
        return list.map((st: any) => ({
            label: `${st.full_name || `${st.first_name || ""} ${st.last_name || ""}`.trim()} (${st.admission_no || st.id})`,
            value: st.id,
        }));
    }, [studentsData]);

    // Format Date helper to YYYY-MM-DD
    const formatDateParam = (val: any): string => {
        if (!val) return "";
        if (val instanceof Date) {
            return new Date(val.getTime() - val.getTimezoneOffset() * 60000)
                .toISOString()
                .split("T")[0];
        }
        if (typeof val === "string") {
            return val.split("T")[0];
        }
        return String(val);
    };

    // Main Assigned Incidents Query
    const queryParams = useMemo(() => {
        return {
            class_id: appliedFilters.class_id || undefined,
            section_id: appliedFilters.section_id || undefined,
            student_id: appliedFilters.student_id || undefined,
            date_from: formatDateParam(appliedFilters.date_from) || undefined,
            date_to: formatDateParam(appliedFilters.date_to) || undefined,
            page,
        };
    }, [appliedFilters, page]);

    const {
        data: apiResponse,
        isLoading,
        isFetching,
    } = useFetchStudentIncidents(queryParams);

    const deleteMutation = useDeleteStudentIncident();

    // Modals state
    const [viewRecord, setViewRecord] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

    // Handle Filter Criteria Search & Reset
    const handleSearch = () => {
        setPage(1);
        setAppliedFilters({ ...filterData });
    };

    const handleReset = () => {
        setFilterData(initialCriteria);
        setAppliedFilters(initialCriteria);
        setPage(1);
    };

    // Columns
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "student_info", title: "Student Name" },
        { key: "class_and_section", title: "Class & Section" },
        { key: "incident_title", title: "Incident" },
        { key: "point_badge", title: "Points" },
        { key: "date", title: "Date" },
        { key: "description", title: "Description" },
    ];

    const responseData: any = apiResponse;

    // Raw list extracted from response
    const rawList: any[] = useMemo(() => {
        if (!responseData) return [];
        if (Array.isArray(responseData?.data?.data)) return responseData.data.data;
        if (Array.isArray(responseData?.data)) return responseData.data;
        if (Array.isArray(responseData)) return responseData;
        return [];
    }, [responseData]);

    // Local client-side search across records
    const filteredList = useMemo(() => {
        if (!debouncedTableSearch.trim()) return rawList;
        const q = debouncedTableSearch.trim().toLowerCase();
        return rawList.filter((item: any) => {
            const studentName = (
                item.student?.full_name ||
                item.student_name ||
                item.student?.name ||
                `${item.student?.first_name || ""} ${item.student?.last_name || ""}`
            ).toLowerCase();
            const admissionNo = String(
                item.student?.admission_no || item.admission_no || ""
            ).toLowerCase();
            const incidentTitle = (
                item.incident?.title ||
                item.incident_title ||
                item.title ||
                ""
            ).toLowerCase();
            const description = (item.description || "").toLowerCase();

            return (
                studentName.includes(q) ||
                admissionNo.includes(q) ||
                incidentTitle.includes(q) ||
                description.includes(q)
            );
        });
    }, [rawList, debouncedTableSearch]);

    // Total pages calculation
    const totalPages = useMemo(() => {
        return (
            responseData?.data?.last_page ||
            responseData?.meta?.last_page ||
            responseData?.last_page ||
            Math.max(1, Math.ceil(filteredList.length / (responseData?.meta?.per_page || 15)))
        );
    }, [responseData, filteredList]);

    // Table rows mapping
    const tableData = useMemo(() => {
        const perPage = apiResponse?.meta?.per_page || 15;

        return filteredList.map((item: any, index: number) => {
            const studentObj = item.student || {};
            const incidentObj = item.incident || {};

            const studentName =
                studentObj.full_name ||
                item.student_name ||
                studentObj.name ||
                `${studentObj.first_name || ""} ${studentObj.last_name || ""}`.trim() ||
                "Student";

            const admissionNo = studentObj.admission_no || item.admission_no || "";
            const photoUrl = studentObj.photo
                ? `${BASE_URL}/public/${studentObj.photo}`
                : "/student.png";

            const className = studentObj.class?.name || item.class_name || "";
            const sectionName = studentObj.section?.name || item.section_name || "";
            const classAndSection = [className, sectionName].filter(Boolean).join(" - ") || "-";

            const incidentTitle = incidentObj.title || item.incident_title || item.title || "-";

            const isNegative =
                incidentObj.is_negative === true ||
                incidentObj.is_negative === 1 ||
                item.is_negative === true ||
                item.is_negative === 1;

            const pointVal = Number(
                incidentObj.point ?? item.point ?? item.points ?? item.total_points ?? 0
            );

            const displayPoints = pointVal > 0 ? (isNegative ? `-${pointVal}` : `+${pointVal}`) : `${pointVal}`;

            const dateStr = item.date || item.created_at || "-";
            const formattedDate = dateStr !== "-" ? dateStr.split("T")[0] : "-";

            return {
                id: item.id ?? index,
                sl: (page - 1) * perPage + index + 1,
                student_info: (
                    <div className="student_cell">
                        <img
                            src={photoUrl}
                            alt={studentName}
                            className="student_avatar"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/student.png";
                            }}
                        />
                        <div className="student_info">
                            <span className="student_name_text">{studentName}</span>
                            {admissionNo && (
                                <span className="student_admission_text">
                                    Adm: {admissionNo}
                                </span>
                            )}
                        </div>
                    </div>
                ),
                class_and_section: classAndSection,
                incident_title: incidentTitle,
                point_badge: (
                    <span
                        className={`point_badge ${pointVal === 0 ? "neutral" : isNegative ? "negative" : "positive"
                            }`}
                    >
                        {displayPoints} pts
                    </span>
                ),
                date: formattedDate,
                description: item.description || "-",
                full_data: item,
                student_name: studentName,
                admission_no: admissionNo,
                photo_url: photoUrl,
                incident_title_plain: incidentTitle,
                point_val: pointVal,
                is_negative: isNegative,
                date_plain: formattedDate,
            };
        });
    }, [filteredList, page, apiResponse]);

    // Handle Delete Action
    const handleConfirmDelete = async () => {
        if (!deleteTarget?.id) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            toast.success("Assigned incident record deleted successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete assigned incident";
            toast.error(errorMsg);
        }
    };


    const isFilterLoading = isFetching && !isLoading;

    return (
        <div className="page_wrapper">
            <div className="behaviour_report_page">
                {isLoading && !apiResponse && <LoadingOverlay isLoading={true} />}

                {/* View Details Popup */}
                {viewRecord && (
                    <PopupScreen
                        title="Incident Record Details"
                        onClick={() => setViewRecord(null)}
                    >
                        <div className="popup_body incident_details_popup">
                            <div className="student_header_card">
                                <img
                                    src={viewRecord.photo_url || "/student.png"}
                                    alt={viewRecord.student_name}
                                    className="header_avatar"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/student.png";
                                    }}
                                />
                                <div className="header_meta">
                                    <h4>{viewRecord.student_name}</h4>
                                    <p>
                                        {viewRecord.admission_no ? `Admission No: ${viewRecord.admission_no} • ` : ""}
                                        Class: {viewRecord.class_and_section}
                                    </p>
                                </div>
                            </div>

                            <div className="detail_grid">
                                <div className="detail_item">
                                    <label>Incident</label>
                                    <p className="value">{viewRecord.incident_title_plain}</p>
                                </div>

                                <div className="detail_item">
                                    <label>Points Awarded</label>
                                    <p className="value">
                                        <span
                                            className={`point_badge ${viewRecord.point_val === 0
                                                    ? "neutral"
                                                    : viewRecord.is_negative
                                                        ? "negative"
                                                        : "positive"
                                                }`}
                                        >
                                            {viewRecord.is_negative
                                                ? `-${viewRecord.point_val}`
                                                : `+${viewRecord.point_val}`}{" "}
                                            pts
                                        </span>
                                    </p>
                                </div>

                                <div className="detail_item">
                                    <label>Date</label>
                                    <p className="value">{viewRecord.date_plain}</p>
                                </div>

                                <div className="detail_item">
                                    <label>Type</label>
                                    <p className="value">
                                        {viewRecord.is_negative ? "Negative Incident" : "Positive Incident"}
                                    </p>
                                </div>

                                <div className="detail_item full_width">
                                    <label>Description / Remarks</label>
                                    <div className="description_box">
                                        {viewRecord.description || "No remark description provided."}
                                    </div>
                                </div>
                            </div>

                            <div className="buttons">
                                <PrimaryButton
                                    title="Close"
                                    onClick={() => setViewRecord(null)}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Delete Confirmation Popup */}
                {deleteTarget && (
                    <PopupScreen
                        title="Delete Assigned Incident"
                        onClick={() => setDeleteTarget(null)}
                    >
                        <div className="popup_body">
                            <div className="body_section">
                                <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
                                    Are you sure you want to delete this assigned incident record for{" "}
                                    <strong>{deleteTarget.student_name}</strong>?
                                </p>
                            </div>

                            <div className="buttons">
                                <SecondaryButton
                                    title="Cancel"
                                    onClick={() => setDeleteTarget(null)}
                                    disable={deleteMutation.isPending}
                                />
                                <PrimaryButton
                                    title={deleteMutation.isPending ? "Deleting..." : "Delete"}
                                    onClick={handleConfirmDelete}
                                    disabled={deleteMutation.isPending}
                                    isLoading={deleteMutation.isPending}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Criteria Filter Card */}
                <TableWrapper title="Select Criteria">
                    <div className="search_screen">
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        value={filterData.class_id}
                                        label="Class"
                                        placeholder="Select class"
                                        options={classOptions}
                                        onChange={(val) =>
                                            setFilterData((prev) => ({
                                                ...prev,
                                                class_id: val,
                                                section_id: "",
                                                student_id: "",
                                            }))
                                        }
                                    />
                                    <CustomSelect
                                        value={filterData.section_id}
                                        label="Section"
                                        placeholder={filterData.class_id ? "Select section" : "Select a class first"}
                                        options={sectionOptions}
                                        onChange={(val) =>
                                            setFilterData((prev) => ({
                                                ...prev,
                                                section_id: val,
                                                student_id: "",
                                            }))
                                        }
                                    />
                                    <CustomSelect
                                        value={filterData.student_id}
                                        label="Student"
                                        placeholder="Select student"
                                        options={studentOptions}
                                        onChange={(val) =>
                                            setFilterData((prev) => ({ ...prev, student_id: val }))
                                        }
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="date"
                                        label="Date From"
                                        placeHolder="Select start date"
                                        value={filterData.date_from}
                                        onChange={(date: any) =>
                                            setFilterData((prev) => ({ ...prev, date_from: date }))
                                        }
                                    />
                                    <InputField
                                        type="date"
                                        label="Date To"
                                        placeHolder="Select end date"
                                        value={filterData.date_to}
                                        onChange={(date: any) =>
                                            setFilterData((prev) => ({ ...prev, date_to: date }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleReset} />
                                <PrimaryButton
                                    title="Search"
                                    onClick={handleSearch}
                                    isLoading={isFilterLoading}
                                />
                            </div>
                        </div>
                    </div>
                </TableWrapper>

                {/* Assigned Incidents Table */}
                <TableWrapper
                    isSearchBar
                    searchValue={tableSearch}
                    searchOnchange={setTableSearch}
                    title="Student Incident Report"
                >
                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                        actions={(row) => (
                            <div className="action_buttons">
                                <button
                                    type="button"
                                    className="action_btn"
                                    title="View Details"
                                    onClick={() => setViewRecord(row)}
                                >
                                    <img src="/svgs/eye_open.svg" alt="View" />
                                </button>
                                <button
                                    type="button"
                                    className="action_btn"
                                    title="Delete Record"
                                    onClick={() => setDeleteTarget(row)}
                                >
                                    <img src="/svgs/delete.svg" alt="Delete" />
                                </button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    );
};

export default BehaviourReport;