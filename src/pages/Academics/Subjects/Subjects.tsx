import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { InputField } from "../../../components/InputFields/InputFields";
import InputRadioButtons from "../../../components/InputRadioButtons/InputRadioButtons";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useFetchAllSubjects,
  useAddSubject,
  useUpdateSubject,
  useRemoveSubject,
  type Subject,
} from "../../../hooks/useSubject";

const initialFormState = {
  name: "",
  code: "",
  type: "Theory",
};

const ITEMS_PER_PAGE = 10;

const SUBJECT_TYPE_OPTIONS = [
  { label: "Theory", value: "Theory" },
  { label: "Practical", value: "Practical" },
];

const Subjects: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Queries & Mutations
  const { data: apiResponse, isLoading } = useFetchAllSubjects(page, debouncedSearch);
  const addSubjectMutation = useAddSubject();
  const updateSubjectMutation = useUpdateSubject();
  const removeSubjectMutation = useRemoveSubject();

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "subject", title: "Subject" },
    { key: "subject_type", title: "Subject Type" },
    { key: "subject_code", title: "Subject Code" },
  ];

  // Extract raw subjects list
  const rawList: Subject[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data?.data)) return apiResponse.data.data;
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  // Client-side search fallback
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item: Subject) => {
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchCode = (item.code || "").toLowerCase().includes(q);
      const matchType = (item.type || "").toLowerCase().includes(q);
      return matchName || matchCode || matchType;
    });
  }, [rawList, searchTerm]);

  // Pagination calculation
  const backendLastPage =
    apiResponse?.data?.last_page ||
    apiResponse?.meta?.last_page ||
    apiResponse?.last_page;

  const totalPages = useMemo(() => {
    if (backendLastPage) return Number(backendLastPage);
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [backendLastPage, filteredList.length]);

  const tableData = useMemo(() => {
    const listToDisplay = backendLastPage
      ? filteredList
      : filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const startIndex = backendLastPage
      ? (page - 1) * (apiResponse?.data?.per_page || ITEMS_PER_PAGE)
      : (page - 1) * ITEMS_PER_PAGE;

    return listToDisplay.map((item: Subject, index: number) => ({
      id: item.id,
      sl: startIndex + index + 1,
      subject: item.name || "-",
      subject_type: item.type || "-",
      subject_code: item.code || "-",
      full_data: item,
    }));
  }, [filteredList, page, backendLastPage, apiResponse]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: Subject) => {
    setEditingSubject(item);
    setFormData({
      name: item.name || "",
      code: item.code || "",
      type: item.type?.toLowerCase() === "practical" ? "Practical" : (item.type || "Theory"),
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Subject name is required";
    }
    if (!formData.type.trim()) {
      newErrors.type = "Subject type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Add or Edit
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      type: formData.type.trim(),
    };

    try {
      if (editingSubject) {
        await updateSubjectMutation.mutateAsync({
          id: editingSubject.id,
          ...payload,
        });
        toast.success("Subject updated successfully");
      } else {
        await addSubjectMutation.mutateAsync(payload);
        toast.success("Subject added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save subject";
      toast.error(errorMsg);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (item: Subject) => {
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeSubjectMutation.mutateAsync(deleteTarget.id);
      toast.success("Subject deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete subject";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    addSubjectMutation.isPending || updateSubjectMutation.isPending;

  if (isLoading && !apiResponse) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="page_wrapper">
      <div className="subjects_page">
        {/* Create / Edit Subject Popup */}
        {isModalOpen && (
          <PopupScreen
            title={editingSubject ? "Edit Subject" : "Add Subject"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <InputField
                    type="text"
                    label="Subject Name *"
                    placeHolder="Enter subject name"
                    value={formData.name}
                    error={errors.name}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, name: val }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                  <InputField
                    type="text"
                    label="Subject Code"
                    placeHolder="Enter subject code"
                    value={formData.code}
                    error={errors.code}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, code: val }));
                      if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
                    }}
                  />
                </div>

                <div className="body_section">
                  <InputRadioButtons
                    name="subject_type"
                    title="Subject Type *"
                    options={SUBJECT_TYPE_OPTIONS}
                    selectedValue={formData.type}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, type: value }));
                      if (errors.type) setErrors((prev) => ({ ...prev, type: "" }));
                    }}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingSubject ? "Cancel" : "Reset"}
                  onClick={
                    editingSubject
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
                      : editingSubject
                        ? "Update Subject"
                        : "Save Subject"
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
            title="Delete Subject"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to delete subject{" "}
                  <strong>"{deleteTarget.name}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton
                  onClick={handleCancelDelete}
                  title="Cancel"
                  disable={removeSubjectMutation.isPending}
                />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  disabled={removeSubjectMutation.isPending}
                  isLoading={removeSubjectMutation.isPending}
                  title={
                    removeSubjectMutation.isPending
                      ? "Deleting..."
                      : "Delete"
                  }
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Subjects Table */}
        <TableWrapper
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          title="Subjects List"
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
                  className="hvr_zm_out"
                  title="Edit Subject"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="hvr_zm_out"
                  title="Delete Subject"
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

export default Subjects;

