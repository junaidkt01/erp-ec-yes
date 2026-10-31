import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    CheckCircle,
    Download,
    Paperclip,
} from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { InputField } from "../../../components/InputFields/InputFields";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import {
    useFetchAllHomeworks,
    useCreateHomework,
    useUpdateHomework,
    useDeleteHomework,
    type HomeworkItem,
} from "../../../hooks/useHomework";
import { formatDate, toDate, toDateString } from "../homeworkUtils";
import "./HomeWorkList.scss";

interface HomeworkFormData {
    class_id: string;
    section_id: string;
    subject_id: string;
    homework_date: string;
    submission_date: string;
    marks: string;
    description: string;
    file: File | null;
}

const initialHomeworkForm: HomeworkFormData = {
    class_id: "",
    section_id: "",
    subject_id: "",
    homework_date: "",
    submission_date: "",
    marks: "",
    description: "",
    file: null,
};

const initialFilters = {
    class_id: "",
    section_id: "",
    subject_id: "",
    homework_date: "",
    submission_date: "",
    search: "",
};

const HomeWorkList: React.FC = () => {
    const navigate = useNavigate();

    // Pagination
    const [page, setPage] = useState(1);

    // Search & Debounce
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);

    // Filter criteria state
    const [filterData, setFilterData] = useState(initialFilters);
    const [appliedFilter, setAppliedFilter] = useState(initialFilters);

    // Modals
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null);
    const [formData, setFormData] = useState<HomeworkFormData>(initialHomeworkForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // View Modal
    const [viewingHomework, setViewingHomework] = useState<HomeworkItem | null>(null);

    // Delete Modal
    const [deleteTarget, setDeleteTarget] = useState<HomeworkItem | null>(null);

    // Master Dropdown Queries
    const { data: studentClasses } = useFetchAllStudentClasses();
    const classOptions = useMemo(() => {
        const raw = Array.isArray(studentClasses?.data) ? studentClasses.data : Array.isArray(studentClasses) ? studentClasses : [];
        return raw.map((cls: any) => ({
            label: cls.name || cls.class_name,
            value: cls.id,
        }));
    }, [studentClasses]);

    const { data: sectionsData } = useFetchAllSections();
    const allSections = useMemo(() => {
        return Array.isArray(sectionsData?.data) ? sectionsData.data : Array.isArray(sectionsData) ? sectionsData : [];
    }, [sectionsData]);

    const filterSectionOptions = useMemo(() => {
        if (!filterData?.class_id) return [];
        return allSections
            .filter((sec: any) => String(sec.class_id) === String(filterData.class_id))
            .map((sec: any) => ({
                label: sec.name || sec.section_name,
                value: sec.id,
            }));
    }, [allSections, filterData?.class_id]);

    const formSectionOptions = useMemo(() => {
        if (!formData?.class_id) return [];
        return allSections
            .filter((sec: any) => String(sec.class_id) === String(formData.class_id))
            .map((sec: any) => ({
                label: sec.name || sec.section_name,
                value: sec.id,
            }));
    }, [allSections, formData?.class_id]);

    const { data: subjectsData } = useFetchAllSubjects();
    const subjectOptions = useMemo(() => {
        const raw = Array.isArray(subjectsData?.data) ? subjectsData.data : Array.isArray(subjectsData) ? subjectsData : [];
        return raw.map((sub: any) => ({
            label: sub.name || sub.subject_name,
            value: sub.id,
        }));
    }, [subjectsData]);

    // Homework Query & Mutations
    const { data: homeworkApiResponse, isLoading: isHomeworkLoading, isFetching: isHomeworkFetching, isError: isHomeworkError } = useFetchAllHomeworks({
        page,
        class_id: appliedFilter.class_id,
        section_id: appliedFilter.section_id,
        subject_id: appliedFilter.subject_id,
        homework_date: appliedFilter.homework_date,
        submission_date: appliedFilter.submission_date,
        search: debouncedSearch || appliedFilter.search,
    });

    const createMutation = useCreateHomework();
    const updateMutation = useUpdateHomework();
    const deleteMutation = useDeleteHomework();

    // Data parsing for Homework List
    const homeworkList: HomeworkItem[] = useMemo(() => {
        const resp = homeworkApiResponse?.data;
        if (Array.isArray(resp)) return resp;
        if (Array.isArray(resp?.data)) return resp.data;
        if (Array.isArray(homeworkApiResponse)) return homeworkApiResponse;
        return [];
    }, [homeworkApiResponse]);

    const totalHomeworkPages = useMemo(() => {
        return (
            homeworkApiResponse?.data?.last_page ||
            homeworkApiResponse?.meta?.last_page ||
            homeworkApiResponse?.last_page ||
            (homeworkList.length > 0 ? Math.ceil(homeworkList.length / (homeworkApiResponse?.data?.per_page || 15)) : 1)
        );
    }, [homeworkApiResponse, homeworkList]);

    const homeworkPerPage = homeworkApiResponse?.data?.per_page || homeworkApiResponse?.meta?.per_page || 15;

    // Handlers for Filters
    const handleSearchClick = () => {
        setAppliedFilter({ ...filterData });
        setPage(1);
    };

    const handleResetFilter = () => {
        setFilterData(initialFilters);
        setAppliedFilter(initialFilters);
        setSearchTerm("");
        setPage(1);
    };

    const handleTableSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1);
    };

    // Homework Add / Edit Handlers
    const handleOpenAddModal = () => {
        setEditingHomework(null);
        setFormData(initialHomeworkForm);
        setFormErrors({});
        setIsAddEditOpen(true);
    };

    const handleOpenEditModal = (item: HomeworkItem) => {
        setEditingHomework(item);
        setFormData({
            class_id: String(item.class_id || item.class?.id || ""),
            section_id: String(item.section_id || item.section?.id || ""),
            subject_id: String(item.subject_id || item.subject?.id || ""),
            homework_date: item.homework_date ? item.homework_date.split("T")[0] : "",
            submission_date: item.submission_date ? item.submission_date.split("T")[0] : "",
            marks: String(item.marks || ""),
            description: item.description || "",
            file: null,
        });
        setFormErrors({});
        setIsAddEditOpen(true);
    };

    const handleCloseAddEdit = () => {
        setIsAddEditOpen(false);
        setEditingHomework(null);
        setFormData(initialHomeworkForm);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.class_id) errors.class_id = "Class is required";
        if (!formData.section_id) errors.section_id = "Section is required";
        if (!formData.subject_id) errors.subject_id = "Subject is required";
        if (!formData.homework_date) errors.homework_date = "Homework date is required";
        if (!formData.submission_date) errors.submission_date = "Submission date is required";
        if (!formData.marks) errors.marks = "Marks are required";
        if (!formData.description.trim()) errors.description = "Description is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveHomework = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            if (editingHomework) {
                await updateMutation.mutateAsync({
                    id: editingHomework.id,
                    class_id: formData.class_id,
                    section_id: formData.section_id,
                    subject_id: formData.subject_id,
                    homework_date: formData.homework_date,
                    submission_date: formData.submission_date,
                    marks: formData.marks,
                    description: formData.description,
                    file: formData.file,
                });
                toast.success("Homework updated successfully");
            } else {
                await createMutation.mutateAsync({
                    class_id: formData.class_id,
                    section_id: formData.section_id,
                    subject_id: formData.subject_id,
                    homework_date: formData.homework_date,
                    submission_date: formData.submission_date,
                    marks: formData.marks,
                    description: formData.description,
                    file: formData.file,
                });
                toast.success("Homework assignment created successfully");
            }
            handleCloseAddEdit();
        } catch (err: any) {
            console.error("Save homework error:", err);
            const msg = err?.response?.data?.message || "Failed to save homework assignment";
            toast.error(msg);
        }
    };

    // Delete Handlers
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            toast.success("Homework deleted successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            console.error("Delete homework error:", err);
            toast.error(err?.response?.data?.message || "Failed to delete homework");
        }
    };

    // Columns Definition for Homework List
    const homeworkColumns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "class_and_section", title: "Class & Section" },
        { key: "marks", title: "Marks" },
        { key: "subject", title: "Subject" },
        { key: "homework_date", title: "Homework Date" },
        { key: "submission_date", title: "Submission Date" },
        { key: "evaluation_date", title: "Evaluation Date" },
    ];

    const homeworkTableData = useMemo(() => {
        return homeworkList.map((item, index) => {
            const className = item.class?.name || item.class_name || `Class ${item.class_id}`;
            const sectionName = item.section?.name || item.section_name || `Section ${item.section_id}`;

            return {
                sl: (page - 1) * homeworkPerPage + (index + 1),
                class_and_section: `${className} (${sectionName})`,
                marks: item.marks ?? "-",
                subject: item.subject?.name || item.subject_name || `Subject ${item.subject_id}`,
                homework_date: formatDate(item.homework_date),
                submission_date: formatDate(item.submission_date),
                evaluation_date: formatDate(item.evaluation_date),
                raw: item,
            };
        });
    }, [homeworkList, page, homeworkPerPage]);

    return (
        <div className="page_wrapper">
            <div className="home_work_list">
                {isHomeworkLoading && <LoadingOverlay isLoading={true} />}

                {/* Filter Criteria Section */}
                <TableWrapper
                    title="Select Criteria"
                    isAddButton={false}
                >
                    <div className="search_screen">
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        value={filterData.class_id}
                                        label="Class"
                                        placeholder="Select class"
                                        options={classOptions}
                                        onChange={(val) => setFilterData((prev) => ({ ...prev, class_id: String(val), section_id: "" }))}
                                    />
                                    <CustomSelect
                                        value={filterData.section_id}
                                        label="Section"
                                        placeholder={filterData.class_id ? "Select section" : "Select class first"}
                                        options={filterSectionOptions}
                                        onChange={(val) => setFilterData((prev) => ({ ...prev, section_id: String(val) }))}
                                    />
                                    <CustomSelect
                                        value={filterData.subject_id}
                                        label="Subject"
                                        placeholder="Select subject"
                                        options={subjectOptions}
                                        onChange={(val) => setFilterData((prev) => ({ ...prev, subject_id: String(val) }))}
                                    />
                                </div>
                                <div className="body_section">
                                    <InputField
                                        type="date"
                                        label="Homework Date"
                                        placeHolder="Select date"
                                        value={toDate(filterData.homework_date)}
                                        onChange={(date: Date | null) => setFilterData((prev) => ({ ...prev, homework_date: toDateString(date) }))}
                                    />
                                    <InputField
                                        type="date"
                                        label="Submission Date"
                                        placeHolder="Select date"
                                        value={toDate(filterData.submission_date)}
                                        onChange={(date: Date | null) => setFilterData((prev) => ({ ...prev, submission_date: toDateString(date) }))}
                                    />
                                    <InputField
                                        type="text"
                                        label="Search Keyword"
                                        placeHolder="Search by title, subject..."
                                        value={filterData.search}
                                        onChange={(e) => setFilterData((prev) => ({ ...prev, search: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleResetFilter} />
                                <PrimaryButton
                                    title="Search"
                                    isLoading={isHomeworkFetching}
                                    onClick={handleSearchClick}
                                />
                            </div>
                        </div>
                    </div>
                </TableWrapper>

                {/* Homework List Table */}
                <TableWrapper
                    title="Homework List"
                    isAddButton={true}
                    addButtonTitle="Add Homework"
                    isSearchBar={true}
                    searchValue={searchTerm}
                    searchOnchange={handleTableSearch}
                    onClick={handleOpenAddModal}
                >
                    <DataTable
                        columns={homeworkColumns}
                        data={homeworkTableData}
                        currentPage={page}
                        totalPages={totalHomeworkPages}
                        onPageChange={(p) => setPage(p)}
                        actionsTitle="Action"
                        emptyMessage={
                            isHomeworkLoading
                                ? undefined
                                : isHomeworkError
                                    ? "Failed to load homework. Please try again."
                                    : "No homework found."
                        }
                        actions={(row: any) => {
                            const item: HomeworkItem = row.raw;
                            return (
                                <div className="actions">
                                    {/* View Details */}
                                    <button
                                        type="button"
                                        title="View Details"
                                        onClick={() => setViewingHomework(item)}
                                    >
                                        <img src="/svgs/eye_open.svg" alt="View" />
                                    </button>

                                    {/* Evaluate Submissions Link to the Homework Report */}
                                    <button
                                        type="button"
                                        className="eval_btn"
                                        title="Evaluate Submissions"
                                        onClick={() => {
                                            navigate("/home-work/homework-report", {
                                                state: {
                                                    class_id: item.class_id,
                                                    section_id: item.section_id,
                                                    subject_id: item.subject_id,
                                                    homework_date: item.homework_date ? item.homework_date.split("T")[0] : "",
                                                },
                                            });
                                        }}
                                    >
                                        <CheckCircle size={14} />
                                        <span>Eval</span>
                                    </button>

                                    {/* Edit Homework */}
                                    <button
                                        type="button"
                                        title="Edit Homework"
                                        onClick={() => handleOpenEditModal(item)}
                                    >
                                        <img src="/svgs/edit.svg" alt="Edit" />
                                    </button>

                                    {/* Delete Homework */}
                                    <button
                                        type="button"
                                        title="Delete Homework"
                                        onClick={() => setDeleteTarget(item)}
                                    >
                                        <img src="/svgs/delete.svg" alt="Delete" />
                                    </button>
                                </div>
                            );
                        }}
                    />
                </TableWrapper>

                {/* ─── MODAL 1: Add / Edit Homework ─── */}
                {isAddEditOpen && (
                    <PopupScreen
                        title={editingHomework ? "Edit Homework" : "Add Homework"}
                        onClick={handleCloseAddEdit}
                    >
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        value={formData.class_id}
                                        label="Class *"
                                        placeholder="Select class"
                                        options={classOptions}
                                        onChange={(val) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                class_id: String(val),
                                                section_id: "",
                                            }))
                                        }
                                    />
                                    <CustomSelect
                                        value={formData.section_id}
                                        label="Section *"
                                        placeholder={formData.class_id ? "Select section" : "Select class first"}
                                        options={formSectionOptions}
                                        onChange={(val) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                section_id: String(val),
                                            }))
                                        }
                                    />
                                    <CustomSelect
                                        value={formData.subject_id}
                                        label="Subject *"
                                        placeholder="Select subject"
                                        options={subjectOptions}
                                        onChange={(val) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                subject_id: String(val),
                                            }))
                                        }
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="date"
                                        label="Homework Date *"
                                        placeHolder="Select date"
                                        value={toDate(formData.homework_date)}
                                        error={formErrors.homework_date}
                                        onChange={(date: Date | null) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                homework_date: toDateString(date),
                                            }))
                                        }
                                    />
                                    <InputField
                                        type="date"
                                        label="Submission Date *"
                                        placeHolder="Select date"
                                        value={toDate(formData.submission_date)}
                                        error={formErrors.submission_date}
                                        onChange={(date: Date | null) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                submission_date: toDateString(date),
                                            }))
                                        }
                                    />
                                    <InputField
                                        type="number"
                                        label="Marks *"
                                        placeHolder="e.g. 50"
                                        value={formData.marks}
                                        error={formErrors.marks}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                marks: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="body_section">
                                    <div className="file_upload_field">
                                        <label>Attach Document (Max 100MB)</label>
                                        <label className="file_input_container">
                                            <span className="upload_btn">
                                                <Paperclip size={14} />
                                                <span>Choose File</span>
                                            </span>
                                            <span className="selected_file_name">
                                                {formData.file
                                                    ? formData.file.name
                                                    : editingHomework?.file || "No file chosen"}
                                            </span>
                                            <input
                                                type="file"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0] || null;
                                                    setFormData((prev) => ({ ...prev, file: f }));
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Description *"
                                        placeHolder="Enter instructions / description for this assignment"
                                        value={formData.description}
                                        error={formErrors.description}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Cancel" onClick={handleCloseAddEdit} />
                                <PrimaryButton
                                    title={editingHomework ? "Update Homework" : "Save Homework"}
                                    isLoading={createMutation.isPending || updateMutation.isPending}
                                    onClick={handleSaveHomework}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* ─── MODAL 2: View Homework Details ─── */}
                {viewingHomework && (
                    <PopupScreen
                        title="Homework Details"
                        onClick={() => setViewingHomework(null)}
                    >
                        <div className="details_modal_content">
                            <div className="details_grid">
                                <div className="detail_item">
                                    <span className="label">Class & Section</span>
                                    <span className="value">
                                        {viewingHomework.class?.name || `Class ${viewingHomework.class_id}`} (
                                        {viewingHomework.section?.name || `Section ${viewingHomework.section_id}`})
                                    </span>
                                </div>
                                <div className="detail_item">
                                    <span className="label">Subject</span>
                                    <span className="value">
                                        {viewingHomework.subject?.name || `Subject ${viewingHomework.subject_id}`}
                                    </span>
                                </div>
                                <div className="detail_item">
                                    <span className="label">Homework Date</span>
                                    <span className="value">
                                        {viewingHomework.homework_date ? viewingHomework.homework_date.split("T")[0] : "-"}
                                    </span>
                                </div>
                                <div className="detail_item">
                                    <span className="label">Submission Date</span>
                                    <span className="value">
                                        {viewingHomework.submission_date ? viewingHomework.submission_date.split("T")[0] : "-"}
                                    </span>
                                </div>
                                <div className="detail_item">
                                    <span className="label">Total Marks</span>
                                    <span className="value">{viewingHomework.marks ?? "-"}</span>
                                </div>
                                <div className="detail_item">
                                    <span className="label">Created By</span>
                                    <span className="value">
                                        {typeof viewingHomework.created_by === "object"
                                            ? viewingHomework.created_by?.name
                                            : (viewingHomework.created_by || "Admin")}
                                    </span>
                                </div>
                            </div>

                            <div className="description_block">
                                <span className="label">Description / Instructions</span>
                                <div className="desc_text">
                                    {viewingHomework.description || "No description provided."}
                                </div>
                            </div>

                            {(viewingHomework.file || viewingHomework.file_url) && (
                                <div className="attachment_block">
                                    <div className="file_info">
                                        <Paperclip size={18} />
                                        <span>Attachment: {viewingHomework.file || "Download Document"}</span>
                                    </div>
                                    <a
                                        href={viewingHomework.file_url || viewingHomework.file || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="download_btn"
                                    >
                                        <Download size={14} />
                                        <span>Download</span>
                                    </a>
                                </div>
                            )}

                            <div className="buttons">
                                <SecondaryButton title="Close" onClick={() => setViewingHomework(null)} />
                                <PrimaryButton
                                    title="Evaluate Submissions"
                                    onClick={() => {
                                        const h = viewingHomework;
                                        setViewingHomework(null);
                                        navigate("/home-work/homework-report", {
                                            state: {
                                                class_id: h.class_id,
                                                section_id: h.section_id,
                                                subject_id: h.subject_id,
                                                homework_date: h.homework_date ? h.homework_date.split("T")[0] : "",
                                            },
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* ─── MODAL 3: Delete Confirmation ─── */}
                {deleteTarget && (
                    <PopupScreen
                        title="Delete Homework"
                        onClick={() => setDeleteTarget(null)}
                    >
                        <div className="delete_confirmation_box">
                            <p>
                                Are you sure you want to delete this homework assignment for{" "}
                                <span className="delete_target_name">
                                    {deleteTarget.subject?.name || `Subject ${deleteTarget.subject_id}`}
                                </span>{" "}
                                assigned on{" "}
                                <strong>
                                    {deleteTarget.homework_date ? deleteTarget.homework_date.split("T")[0] : ""}
                                </strong>
                                ?
                            </p>
                            <p style={{ fontSize: 13, color: "#666" }}>
                                This action cannot be undone and will remove all student submission records for this homework.
                            </p>
                            <div className="confirmation_buttons">
                                <SecondaryButton
                                    title="Cancel"
                                    onClick={() => setDeleteTarget(null)}
                                />
                                <button
                                    type="button"
                                    className="danger_btn"
                                    disabled={deleteMutation.isPending}
                                    onClick={handleDeleteConfirm}
                                >
                                    {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
                                </button>
                            </div>
                        </div>
                    </PopupScreen>
                )}
            </div>
        </div>
    );
};

export default HomeWorkList;