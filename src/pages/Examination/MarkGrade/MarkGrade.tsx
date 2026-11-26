import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
  useFetchMarkGrades,
  useAddMarkGrade,
  useUpdateMarkGrade,
  useDeleteMarkGrade,
  type MarkGradeItem,
} from "../../../hooks/useExamination";

const defaultGrades: MarkGradeItem[] = [
  { id: 1, grade_name: "A+", gpa: 5, percent_from: 80, percent_to: 100, gpa_from: 5, gpa_to: 5.99, description: "Outstanding performance" },
  { id: 2, grade_name: "A", gpa: 4, percent_from: 70, percent_to: 79, gpa_from: 4, gpa_to: 4.99, description: "Very Good" },
  { id: 3, grade_name: "B", gpa: 3.5, percent_from: 60, percent_to: 69, gpa_from: 3.5, gpa_to: 3.99, description: "Good" },
  { id: 4, grade_name: "C", gpa: 3, percent_from: 50, percent_to: 59, gpa_from: 3, gpa_to: 3.49, description: "Average" },
  { id: 5, grade_name: "D", gpa: 2, percent_from: 40, percent_to: 49, gpa_from: 2, gpa_to: 2.99, description: "Pass" },
  { id: 6, grade_name: "F", gpa: 0, percent_from: 0, percent_to: 39, gpa_from: 0, gpa_to: 1.99, description: "Fail" },
];

const initialForm = {
  grade_name: "",
  gpa: "",
  percent_from: "",
  percent_to: "",
  gpa_from: "",
  gpa_to: "",
  description: "",
};

const ITEMS_PER_PAGE = 10;

const MarkGrade: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: apiData } = useFetchMarkGrades({ page, per_page: ITEMS_PER_PAGE, search: searchTerm });
  const addMutation = useAddMarkGrade();
  const updateMutation = useUpdateMarkGrade();
  const deleteMutation = useDeleteMarkGrade();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarkGradeItem | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<MarkGradeItem | null>(null);

  const rawList: MarkGradeItem[] = useMemo(() => {
    if (apiData?.data && Array.isArray(apiData.data)) return apiData.data;
    if (Array.isArray(apiData)) return apiData;
    return defaultGrades;
  }, [apiData]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((g) => g.grade_name?.toLowerCase().includes(q) || String(g.gpa).includes(q));
  }, [rawList, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "grade_name", title: "Grade" },
    { key: "gpa", title: "GPA" },
    { key: "percent_range", title: "Percent (From To)" },
    { key: "gpa_range", title: "GPA (From To)" },
  ];

  const tableData = useMemo(() => {
    const paginated = filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return paginated.map((item, index) => ({
      id: item.id,
      sl: (page - 1) * ITEMS_PER_PAGE + index + 1,
      grade_name: item.grade_name || "-",
      gpa: item.gpa ?? "-",
      percent_range: `${item.percent_from}-${item.percent_to}%`,
      gpa_range: `${item.gpa_from}-${item.gpa_to}`,
      full_data: item,
    }));
  }, [filteredList, page]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MarkGradeItem) => {
    setEditingItem(item);
    setFormData({
      grade_name: item.grade_name || "",
      gpa: String(item.gpa ?? ""),
      percent_from: String(item.percent_from ?? ""),
      percent_to: String(item.percent_to ?? ""),
      gpa_from: String(item.gpa_from ?? ""),
      gpa_to: String(item.gpa_to ?? ""),
      description: item.description || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialForm);
    setErrors({});
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.grade_name.trim()) errs.grade_name = "Grade name is required";
    if (!String(formData.gpa).trim()) errs.gpa = "GPA is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = {
        grade_name: formData.grade_name.trim(),
        gpa: Number(formData.gpa) || 0,
        percent_from: Number(formData.percent_from) || 0,
        percent_to: Number(formData.percent_to) || 100,
        gpa_from: Number(formData.gpa_from) || 0,
        gpa_to: Number(formData.gpa_to) || 5,
        description: formData.description.trim() || undefined,
      };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...payload });
        toast.success("Grade updated successfully");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("Grade created successfully via /api/mark-grades");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save grade");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Grade deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete grade");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="page_wrapper">
      <div className="mark_grade_page">
        {/* Add / Edit Grade Modal */}
        {isModalOpen && (
          <PopupScreen
            className="grade_popup_modal"
            title={editingItem ? "Edit Grade" : "Add Grade"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div style={{ display: "grid", gap: "16px" }}>
                {/* Row 1: Grade Name, GPA, Percent From */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <InputField
                    type="text"
                    label="Grade Name"
                    placeHolder="Enter grade name"
                    value={formData.grade_name}
                    error={errors.grade_name}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, grade_name: e?.target?.value || e }))}
                  />
                  <InputField
                    type="number"
                    label="GPA"
                    placeHolder="Enter GPA"
                    value={formData.gpa}
                    error={errors.gpa}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, gpa: e?.target?.value || e }))}
                  />
                  <InputField
                    type="number"
                    label="Percent From"
                    placeHolder="e.g. 80"
                    value={formData.percent_from}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, percent_from: e?.target?.value || e }))}
                  />
                </div>

                {/* Row 2: Percent To, GPA From, GPA To */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <InputField
                    type="number"
                    label="Percent To"
                    placeHolder="e.g. 100"
                    value={formData.percent_to}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, percent_to: e?.target?.value || e }))}
                  />
                  <InputField
                    type="number"
                    label="GPA From"
                    placeHolder="e.g. 5"
                    value={formData.gpa_from}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, gpa_from: e?.target?.value || e }))}
                  />
                  <InputField
                    type="number"
                    label="GPA To"
                    placeHolder="e.g. 5.99"
                    value={formData.gpa_to}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, gpa_to: e?.target?.value || e }))}
                  />
                </div>

                {/* Row 3: Description */}
                <div>
                  <InputField
                    type="text"
                    label="Description"
                    placeHolder="Enter description"
                    value={formData.description}
                    onChange={(e: any) => setFormData((prev) => ({ ...prev, description: e?.target?.value || e }))}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingItem ? "Cancel" : "Reset"}
                  onClick={editingItem ? handleCloseModal : () => setFormData(initialForm)}
                />
                <PrimaryButton
                  title={addMutation.isPending || updateMutation.isPending ? "Saving..." : editingItem ? "Update Grade" : "Save Grade"}
                  icon={<Save size={16} />}
                  onClick={handleSave}
                  disabled={addMutation.isPending || updateMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <PopupScreen
            className="grade_popup_modal"
            title="Delete Grade"
            onClick={() => setDeleteTarget(null)}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>Are you sure you want to delete grade <strong>"{deleteTarget.grade_name}"</strong>?</p>
              </div>
              <div className="buttons">
                <SecondaryButton onClick={() => setDeleteTarget(null)} title="Cancel" />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  title={deleteMutation.isPending ? "Deleting..." : "Delete"}
                  disabled={deleteMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Grade List Table */}
        <TableWrapper
          title="Grade List"
          addButtonTitle="Add Grade"
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          onClick={handleOpenAddModal}
        >
          <DataTable
            columns={columns}
            data={tableData}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            actions={(row) => (
              <div className="actions">
                <button
                  type="button"
                  className="edit_btn hvr_zm_out"
                  title="Edit Grade"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete Grade"
                  onClick={() => setDeleteTarget(row.full_data)}
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

export default MarkGrade;
