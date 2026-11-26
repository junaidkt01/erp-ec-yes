import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
  useFetchAllExamTypes,
  useAddExamType,
  useUpdateExamType,
  useDeleteExamType,
  type ExamTypeItem,
} from "../../../hooks/useExamination";

const defaultExamTypes: ExamTypeItem[] = [
  { id: 1, name: "First Term", is_group: false, status: true, average_passing_examination: false, average_mark: null },
  { id: 2, name: "Second Term", is_group: false, status: true, average_passing_examination: true, average_mark: 24 },
  { id: 3, name: "Second Term", is_group: false, status: true, average_passing_examination: true, average_mark: 24 },
  { id: 4, name: "Second Term", is_group: false, status: true, average_passing_examination: true, average_mark: 24 },
  { id: 5, name: "Second Term", is_group: false, status: true, average_passing_examination: true, average_mark: 24 },
];

const ITEMS_PER_PAGE = 10;

const ExamType: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: apiData } = useFetchAllExamTypes({ page, per_page: ITEMS_PER_PAGE, search: searchTerm });
  const addMutation = useAddExamType();
  const updateMutation = useUpdateExamType();
  const deleteMutation = useDeleteExamType();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamTypeItem | null>(null);
  const [examName, setExamName] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [averagePassing, setAveragePassing] = useState(false);
  const [averageMark, setAverageMark] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<ExamTypeItem | null>(null);

  const rawList: ExamTypeItem[] = useMemo(() => {
    if (apiData?.data && Array.isArray(apiData.data)) return apiData.data;
    if (Array.isArray(apiData)) return apiData;
    return defaultExamTypes;
  }, [apiData]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item) => item.name?.toLowerCase().includes(q));
  }, [rawList, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "name", title: "Exam Name" },
    { key: "average_passing", title: "Average Passing Exam" },
    { key: "average_mark", title: "Average Mark" },
  ];

  const tableData = useMemo(() => {
    const paginated = filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return paginated.map((item, index) => ({
      id: item.id,
      sl: (page - 1) * ITEMS_PER_PAGE + index + 1,
      name: item.name || "-",
      average_passing: item.average_passing_examination ? "Yes" : "No",
      average_mark: item.average_passing_examination ? (item.average_mark ?? "-") : "-",
      full_data: item,
    }));
  }, [filteredList, page]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setExamName("");
    setIsGroup(false);
    setAveragePassing(false);
    setAverageMark("");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ExamTypeItem) => {
    setEditingItem(item);
    setExamName(item.name || "");
    setIsGroup(Boolean(item.is_group));
    setAveragePassing(Boolean(item.average_passing_examination));
    setAverageMark(String(item.average_mark ?? ""));
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setExamName("");
    setIsGroup(false);
    setAveragePassing(false);
    setAverageMark("");
    setErrors({});
  };

  const handleReset = () => {
    setExamName("");
    setIsGroup(false);
    setAveragePassing(false);
    setAverageMark("");
    setErrors({});
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!examName.trim()) errs.name = "Exam name is required";
    if (averagePassing && !averageMark.trim()) errs.averageMark = "Average mark is required when toggle is on";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = {
        name: examName.trim(),
        is_group: isGroup,
        status: true,
        average_passing_examination: averagePassing,
        average_mark: averagePassing ? Number(averageMark) : null,
      };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...payload });
        toast.success("Exam type updated successfully");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("Exam type created successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save exam type");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Exam type deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete exam type");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="page_wrapper">
      <div className="exam_type_page">
        {/* Add / Edit Exam Type Modal */}
        {isModalOpen && (
          <PopupScreen
            className="exam_popup_modal"
            title={editingItem ? "Edit Exam Type" : "Add Exam Type"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div style={{ display: "grid", gap: "16px" }}>
                <InputField
                  type="text"
                  label="Exam Name"
                  placeHolder="Enter exam name"
                  value={examName}
                  error={errors.name}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setExamName(val);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    Average Passing Examination
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={averagePassing}
                    onClick={() => setAveragePassing(!averagePassing)}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "14px",
                      background: averagePassing ? "#605dec" : "#cbd5e1",
                      border: "none",
                      padding: "2px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "background 0.25s ease",
                    }}
                  >
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#fff",
                        display: "block",
                        transform: averagePassing ? "translateX(20px)" : "translateX(0)",
                        transition: "transform 0.25s ease",
                      }}
                    />
                  </button>
                </div>

                {averagePassing && (
                  <InputField
                    type="number"
                    label="Average Mark"
                    placeHolder="Enter average mark"
                    value={averageMark}
                    error={errors.averageMark}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setAverageMark(val);
                      if (errors.averageMark) setErrors((prev) => ({ ...prev, averageMark: "" }));
                    }}
                  />
                )}
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingItem ? "Cancel" : "Reset"}
                  onClick={editingItem ? handleCloseModal : handleReset}
                />
                <PrimaryButton
                  title={addMutation.isPending || updateMutation.isPending ? "Saving..." : editingItem ? "Update Exam Type" : "Save Exam Type"}
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
            className="exam_popup_modal"
            title="Delete Exam Type"
            onClick={() => setDeleteTarget(null)}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>Are you sure you want to delete exam type <strong>"{deleteTarget.name}"</strong>?</p>
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

        {/* Exam Type List Table */}
        <TableWrapper
          title="Exam Type List"
          addButtonTitle="Add Exam Type"
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
                  title="Edit Exam Type"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete Exam Type"
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

export default ExamType;
