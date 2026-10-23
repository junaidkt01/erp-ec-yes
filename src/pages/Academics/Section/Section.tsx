import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useFetchAllSections,
  useAddSection,
  useUpdateSection,
  useRemoveSection,
  type SectionItem,
} from "../../../hooks/useSections";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";

const initialFormState = {
  name: "",
  class_id: "" as string | number,
};

const ITEMS_PER_PAGE = 10;

const Section: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Queries & Mutations
  const { data: apiResponse, isLoading } = useFetchAllSections(page, debouncedSearch);
  const { data: classList } = useFetchAllStudentClasses();

  const addSectionMutation = useAddSection();
  const updateSectionMutation = useUpdateSection();
  const removeSectionMutation = useRemoveSection();

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<SectionItem | null>(null);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "section", title: "Section" },
    { key: "class", title: "Class" },
  ];

  // Options for class dropdown
  const classOptions = useMemo(() => {
    const arr = Array.isArray(classList?.data)
      ? classList.data
      : Array.isArray(classList)
        ? classList
        : [];
    return arr.map((cls: any) => ({
      label: cls.name,
      value: cls.id,
    }));
  }, [classList]);

  // Extract raw sections list
  const rawList: SectionItem[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data?.data)) return apiResponse.data.data;
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  // Client-side search fallback
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item: SectionItem) => {
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchClass = (item.class?.name || "").toLowerCase().includes(q);
      return matchName || matchClass;
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

    return listToDisplay.map((item: SectionItem, index: number) => ({
      id: item.id,
      sl: startIndex + index + 1,
      section: item.name || "-",
      class: item.class?.name || "-",
      full_data: item,
    }));
  }, [filteredList, page, backendLastPage, apiResponse]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSection(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: SectionItem) => {
    setEditingSection(item);
    setFormData({
      name: item.name || "",
      class_id: item.class_id ?? item.class?.id ?? "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Section name is required";
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
      class_id: formData.class_id ? Number(formData.class_id) : null,
    };

    try {
      if (editingSection) {
        await updateSectionMutation.mutateAsync({
          id: editingSection.id,
          ...payload,
        });
        toast.success("Section updated successfully");
      } else {
        await addSectionMutation.mutateAsync(payload);
        toast.success("Section added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save section";
      toast.error(errorMsg);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (sec: SectionItem) => {
    setDeleteTarget(sec);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeSectionMutation.mutateAsync(deleteTarget.id);
      toast.success("Section deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete section";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    addSectionMutation.isPending || updateSectionMutation.isPending;

  if (isLoading && !apiResponse) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="page_wrapper">
      <div className="section_page">
        {/* Create / Edit Section Popup */}
        {isModalOpen && (
          <PopupScreen
            title={editingSection ? "Edit Section" : "Add Section"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <InputField
                    type="text"
                    label="Section Name *"
                    placeHolder="Enter section name"
                    value={formData.name}
                    error={errors.name}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, name: val }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                  <CustomSelect
                    label="Class"
                    placeholder="Select class"
                    value={formData.class_id}
                    options={classOptions}
                    onChange={(val) => setFormData((prev) => ({ ...prev, class_id: val }))}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingSection ? "Cancel" : "Reset"}
                  onClick={
                    editingSection
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
                      : editingSection
                        ? "Update Section"
                        : "Save Section"
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
            title="Delete Section"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to delete section{" "}
                  <strong>"{deleteTarget.name}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton
                  onClick={handleCancelDelete}
                  title="Cancel"
                  disable={removeSectionMutation.isPending}
                />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  disabled={removeSectionMutation.isPending}
                  isLoading={removeSectionMutation.isPending}
                  title={
                    removeSectionMutation.isPending
                      ? "Deleting..."
                      : "Delete"
                  }
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Sections Table */}
        <TableWrapper
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          title="Section List"
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
                  title="Edit Section"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="hvr_zm_out"
                  title="Delete Section"
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

export default Section;
