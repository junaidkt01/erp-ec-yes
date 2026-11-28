import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
    useFetchAllLessonPlans,
    useDeleteLessonPlan,
    type LessonPlanItem,
} from "../../../hooks/useLessonPlan";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import { toast } from "sonner";
import "./LessonPlanList.scss";

const LessonPlanList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("All");
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [deleteTarget, setDeleteTarget] = useState<LessonPlanItem | null>(null);

    const { data: classesData } = useFetchAllStudentClasses();
    const { data: subjectsData } = useFetchAllSubjects();

    const classList = Array.isArray(classesData?.data) ? classesData.data : Array.isArray(classesData) ? classesData : [];
    const subjectList = Array.isArray(subjectsData?.data) ? subjectsData.data : Array.isArray(subjectsData) ? subjectsData : [];

    const classFilterOptions = [
        { label: "All Classes", value: "All" },
        ...(classList.length > 0
            ? classList.map((c: any) => ({ label: c.name, value: c.name }))
            : [
                { label: "Class 8", value: "Class 8" },
                { label: "Class 9", value: "Class 9" },
                { label: "Class 10", value: "Class 10" },
            ]),
    ];

    const subjectFilterOptions = [
        { label: "All Subjects", value: "All" },
        ...(subjectList.length > 0
            ? subjectList.map((s: any) => ({ label: s.name, value: s.name }))
            : [
                { label: "Science", value: "Science" },
                { label: "Mathematics", value: "Mathematics" },
                { label: "English", value: "English" },
                { label: "Social Science", value: "Social Science" },
            ]),
    ];

    const { data: plansData, isLoading } = useFetchAllLessonPlans({
        page,
        per_page: 8,
        search,
        class_name: selectedClass,
        subject: selectedSubject,
        status: selectedStatus,
    });

    const deletePlanMutation = useDeleteLessonPlan();

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "lesson_title", title: "Title of Lesson" },
        { key: "subject", title: "Subject" },
        { key: "class_section", title: "Class & Section" },
        { key: "chapter_number", title: "Chapter No." },
        { key: "periods", title: "No. of Periods" },
        { key: "plan_date", title: "Date" },
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
        lesson_title: item.lesson_title,
        subject: item.subject,
        class_section: `${item.class_name} - ${item.section_name}`,
        chapter_number: item.chapter_number,
        periods: `${item.no_of_periods} Periods`,
        plan_date: item.plan_date,
        status: getStatusBadge(item.status),
        raw: item,
    }));

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deletePlanMutation.mutateAsync(deleteTarget.id);
            toast.success("Lesson plan deleted successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to delete lesson plan");
        }
    };

    return (
        <div className="page_wrapper">
            <div className="lesson_plan_list_page">
                {/* 1. Filter Criteria Card */}
                <TableWrapper
                    title="Filter Lesson Plans"
                    isAddButton
                    addButtonTitle="Add Lesson Plan"
                    onClick={() => navigate("/lesson-plan/add-lesson-plan")}
                >
                    <div className="popup_body">
                        <div className="fields_wrapper">
                            <div className="body_section">
                                <CustomSelect label="Class" value={selectedClass} options={classFilterOptions}
                                    onChange={(val: any) => {
                                        setSelectedClass(val);
                                        setPage(1);
                                    }} />
                                <CustomSelect label="Subject" value={selectedSubject} options={subjectFilterOptions}
                                    onChange={(val: any) => {
                                        setSelectedSubject(val);
                                        setPage(1);
                                    }} />
                            </div>
                            <div className="body_section">
                                <CustomSelect label="Status" value={selectedStatus}
                                    options={[
                                        { label: "All Statuses", value: "All" },
                                        { label: "Approved", value: "Approved" },
                                        { label: "Under Review", value: "Submitted" },
                                        { label: "Revision Needed", value: "Revision_Requested" },
                                        { label: "Draft", value: "Draft" },
                                    ]}
                                    onChange={(val: any) => {
                                        setSelectedStatus(val);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="buttons" >
                            <SecondaryButton title="Reset Filters"
                                onClick={() => {
                                    setSelectedClass("All");
                                    setSelectedSubject("All");
                                    setSelectedStatus("All");
                                    setSearch("");
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>
                </TableWrapper>

                {/* 2. Lesson Plans Table */}
                <TableWrapper
                    isAddButton
                    addButtonTitle="Review Approvals (ACO / Principal)"
                    onClick={() => navigate("/lesson-plan/lesson-plan-approvals")}
                    isSearchBar
                    title="Lesson Plans"
                    searchValue={search}
                    searchOnchange={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                // onClick={() => navigate("/lesson-plan/add-lesson-plan")}
                >
                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                        emptyMessage={isLoading ? "Loading lesson plans..." : "No lesson plans found."}
                        actions={(row: any) => (
                            <div className="actions">
                                <button
                                    type="button"
                                    title="View & Print Official Form"
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
                                <button
                                    type="button"
                                    title="Edit Lesson Plan"
                                    onClick={() => navigate(`/lesson-plan/add-lesson-plan/${row.raw.id}`)}
                                >
                                    <img src="/svgs/edit.svg" alt="Edit" />
                                </button>
                                <button
                                    type="button"
                                    title="Delete Lesson Plan"
                                    onClick={() => setDeleteTarget(row.raw)}
                                >
                                    <img src="/svgs/delete.svg" alt="Delete" />
                                </button>
                            </div>
                        )}
                    />
                </TableWrapper>

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <PopupScreen title="Delete Lesson Plan" onClick={() => setDeleteTarget(null)}>
                        <div className="popup_body">
                            <p style={{ margin: "16px 0", fontSize: "15px", color: "#374151" }}>
                                Are you sure you want to delete lesson plan <strong>{deleteTarget.lesson_title}</strong>?
                            </p>
                            <div className="buttons">
                                <SecondaryButton title="Cancel" onClick={() => setDeleteTarget(null)} />
                                <PrimaryButton
                                    title={deletePlanMutation.isPending ? "Deleting..." : "Delete"}
                                    disabled={deletePlanMutation.isPending}
                                    isLoading={deletePlanMutation.isPending}
                                    onClick={handleDelete}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}
            </div>
        </div>
    );
};

export default LessonPlanList;
