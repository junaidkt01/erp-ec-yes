import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { InputField } from "../../../components/InputFields/InputFields";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useFetchAllStudentCategories,
  useAddStudentCategory,
  useUpdateStudentCategory,
  useRemoveStudentCategory,
  type StudentCategory as StudentCategoryType,
} from "../../../hooks/useStudentCategory";

const initialFormState = {
  name: "",
  description: "",
};

const ITEMS_PER_PAGE = 10;

const StudentCategory: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Queries and mutations
  const { data: apiResponse, isLoading } = useFetchAllStudentCategories(page, debouncedSearch);
  const addCategoryMutation = useAddStudentCategory();
  const updateCategoryMutation = useUpdateStudentCategory();
  const removeCategoryMutation = useRemoveStudentCategory();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StudentCategoryType | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<StudentCategoryType | null>(null);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "category", title: "Category" },
    { key: "description", title: "Description" },
  ];

  // Extract raw list
  const rawList: StudentCategoryType[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data?.data)) return apiResponse.data.data;
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  // Client-side search filter (handles both local filtering and backend query results)
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item: StudentCategoryType) => {
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchDesc = (item.description || "").toLowerCase().includes(q);
      return matchName || matchDesc;
    });
  }, [rawList, searchTerm]);

  // Determine if backend provides pagination metadata
  const backendLastPage =
    apiResponse?.data?.last_page ||
    apiResponse?.meta?.last_page ||
    apiResponse?.last_page;

  const totalPages = useMemo(() => {
    if (backendLastPage) return Number(backendLastPage);
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [backendLastPage, filteredList.length]);

  // Paginated data for DataTable
  const tableData = useMemo(() => {
    const listToDisplay = backendLastPage
      ? filteredList
      : filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const startIndex = backendLastPage
      ? (page - 1) * (apiResponse?.data?.per_page || ITEMS_PER_PAGE)
      : (page - 1) * ITEMS_PER_PAGE;

    return listToDisplay.map((item: StudentCategoryType, index: number) => ({
      id: item.id,
      sl: startIndex + index + 1,
      category: item.name || "-",
      description: item.description || "-",
      full_data: item,
    }));
  }, [filteredList, page, backendLastPage, apiResponse]);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: StudentCategoryType) => {
    setEditingCategory(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit create or update
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          ...payload,
        });
        toast.success("Student category updated successfully");
      } else {
        await addCategoryMutation.mutateAsync(payload);
        toast.success("Student category added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save student category";
      toast.error(errorMsg);
    }
  };

  // Delete handlers
  const handleDeleteClick = (category: StudentCategoryType) => {
    setDeleteTarget(category);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeCategoryMutation.mutateAsync(deleteTarget.id);
      toast.success("Student category deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete student category";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    addCategoryMutation.isPending || updateCategoryMutation.isPending;

  if (isLoading && !apiResponse) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="page_wrapper">
      <div className="student_category">
        {/* Create / Edit Student Category Popup */}
        {isModalOpen && (
          <PopupScreen
            title={editingCategory ? "Edit Student Category" : "Add Student Category"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="body_section">
                <InputField
                  type="text"
                  label="Category Name *"
                  placeHolder="Enter category name"
                  value={formData.name}
                  error={errors.name}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, name: val }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                />
              </div>

              <div className="body_section">
                <InputField
                  type="text"
                  label="Description"
                  placeHolder="Enter description"
                  value={formData.description}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, description: val }));
                  }}
                />
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingCategory ? "Cancel" : "Reset"}
                  onClick={
                    editingCategory
                      ? handleCloseModal
                      : () => {
                          setFormData(initialFormState);
                          setErrors({});
                        }
                  }
                />
                <PrimaryButton
                  title={
                    isSaving
                      ? "Saving..."
                      : editingCategory
                        ? "Update Category"
                        : "Save Category"
                  }
                  onClick={handleSubmit}
                  disabled={isSaving}
                  isLoading={isSaving}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Popup */}
        {deleteTarget && (
          <PopupScreen
            title="Delete Student Category"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to delete category{" "}
                  <strong>"{deleteTarget.name}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton
                  onClick={handleCancelDelete}
                  title="Cancel"
                  disable={removeCategoryMutation.isPending}
                />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  disabled={removeCategoryMutation.isPending}
                  isLoading={removeCategoryMutation.isPending}
                  title={
                    removeCategoryMutation.isPending
                      ? "Deleting..."
                      : "Delete"
                  }
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Student Categories Table */}
        <TableWrapper
          onClick={handleOpenAddModal}
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          title="Student Category List"
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
                  className="hvr_zm_out"
                  title="Edit Category"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="hvr_zm_out"
                  title="Delete Category"
                  onClick={() => handleDeleteClick(row.full_data)}
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

export default StudentCategory;