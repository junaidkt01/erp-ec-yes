import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import InputCheckbox from "../../../components/InputCheckbox/InputCheckbox";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useFetchAllStudentClasses,
  useAddStudentClass,
  useUpdateStudentClass,
  useRemoveStudentClass,
  type ClassItem,
} from "../../../hooks/useStudentClass";
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear";
import { useFetchAllStudentCategories } from "../../../hooks/useStudentCategory";
import { useFetchAllSections, type SectionItem } from "../../../hooks/useSections";

const initialFormState = {
  name: "",
  academic_year_id: "" as string | number,
  category_id: "" as string | number,
  section_ids: [] as number[],
};

const ITEMS_PER_PAGE = 10;

const Class: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Queries & Mutations
  const { data: apiResponse, isLoading } = useFetchAllStudentClasses(page, debouncedSearch);
  const { data: academicYears } = useFetchAllAcademicYears();
  const { data: categories } = useFetchAllStudentCategories();
  const { data: sectionsData } = useFetchAllSections();

  const addClassMutation = useAddStudentClass();
  const updateClassMutation = useUpdateStudentClass();
  const removeClassMutation = useRemoveStudentClass();

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete Target Modal State
  const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "class", title: "Class" },
    { key: "section", title: "Section" },
    { key: "academic_year", title: "Academic Year" },
    { key: "category", title: "Category" },
  ];

  // Options for Academic Years
  const academicYearOptions = useMemo(() => {
    const list = Array.isArray(academicYears) ? academicYears : [];
    return list.map((y: any) => ({
      label: y.name,
      value: y.id,
    }));
  }, [academicYears]);

  // Options for Student Categories
  const categoryOptions = useMemo(() => {
    const arr = Array.isArray(categories?.data?.data)
      ? categories.data.data
      : Array.isArray(categories?.data)
        ? categories.data
        : Array.isArray(categories)
          ? categories
          : [];
    return arr.map((cat: any) => ({
      label: cat.name,
      value: cat.id,
    }));
  }, [categories]);

  // Available Sections for Class assignment
  const availableSections: SectionItem[] = useMemo(() => {
    const arr = Array.isArray(sectionsData?.data)
      ? sectionsData.data
      : Array.isArray(sectionsData)
        ? sectionsData
        : [];
    return arr;
  }, [sectionsData]);

  // Extract raw classes list
  const rawList: ClassItem[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data?.data)) return apiResponse.data.data;
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  // Client-side search fallback
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item: ClassItem) => {
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchYear = (item.academic_year?.name || "").toLowerCase().includes(q);
      const matchCat = (item.category?.name || "").toLowerCase().includes(q);
      const matchSec = item.sections?.some((s: any) =>
        (s.name || "").toLowerCase().includes(q)
      );
      return matchName || matchYear || matchCat || matchSec;
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

    return listToDisplay.map((item: ClassItem, index: number) => {
      const sectionNames =
        Array.isArray(item.sections) && item.sections.length > 0
          ? item.sections.map((s: any) => s.name || s).join(", ")
          : "-";

      return {
        id: item.id,
        sl: startIndex + index + 1,
        class: item.name || "-",
        section: sectionNames,
        academic_year: item.academic_year?.name || "-",
        category: item.category?.name || "-",
        full_data: item,
      };
    });
  }, [filteredList, page, backendLastPage, apiResponse]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingClass(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: ClassItem) => {
    setEditingClass(item);
    const existingSectionIds = Array.isArray(item.sections)
      ? item.sections.map((s: any) => s.id)
      : [];

    setFormData({
      name: item.name || "",
      academic_year_id: item.academic_year_id ?? item.academic_year?.id ?? "",
      category_id: item.category_id ?? item.category?.id ?? "",
      section_ids: existingSectionIds,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Toggle Section selection
  const handleToggleSection = (sectionId: number) => {
    setFormData((prev) => {
      const exists = prev.section_ids.includes(sectionId);
      return {
        ...prev,
        section_ids: exists
          ? prev.section_ids.filter((id) => id !== sectionId)
          : [...prev.section_ids, sectionId],
      };
    });
  };

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Class name is required";
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
      academic_year_id: formData.academic_year_id ? Number(formData.academic_year_id) : null,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      sections: formData.section_ids,
      section_ids: formData.section_ids,
    };

    try {
      if (editingClass) {
        await updateClassMutation.mutateAsync({
          id: editingClass.id,
          ...payload,
        });
        toast.success("Class updated successfully");
      } else {
        await addClassMutation.mutateAsync(payload);
        toast.success("Class added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save class";
      toast.error(errorMsg);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (cls: ClassItem) => {
    setDeleteTarget(cls);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeClassMutation.mutateAsync(deleteTarget.id);
      toast.success("Class deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete class";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    addClassMutation.isPending || updateClassMutation.isPending;

  if (isLoading && !apiResponse) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="page_wrapper">
      <div className="class_page">
        {/* Create / Edit Class Popup */}
        {isModalOpen && (
          <PopupScreen
            title={editingClass ? "Edit Class" : "Add Class"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <InputField
                    type="text"
                    label="Class Name *"
                    placeHolder="Enter class name"
                    value={formData.name}
                    error={errors.name}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, name: val }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                  <CustomSelect
                    label="Academic Year"
                    placeholder="Select academic year"
                    value={formData.academic_year_id}
                    options={academicYearOptions}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, academic_year_id: val }))
                    }
                  />
                  <CustomSelect
                    label="Category"
                    placeholder="Select category"
                    value={formData.category_id}
                    options={categoryOptions}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, category_id: val }))
                    }
                  />
                </div>

                {availableSections.length > 0 && (
                  <div className="body_section">
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#4B5563",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Sections
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "14px",
                        alignItems: "center",
                      }}
                    >
                      {availableSections.map((sec) => (
                        <InputCheckbox
                          key={sec.id}
                          label={sec.name}
                          checked={formData.section_ids.includes(sec.id)}
                          onChange={() => handleToggleSection(sec.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingClass ? "Cancel" : "Reset"}
                  onClick={
                    editingClass
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
                      : editingClass
                        ? "Update Class"
                        : "Save Class"
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
            title="Delete Class"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to delete class{" "}
                  <strong>"{deleteTarget.name}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton
                  onClick={handleCancelDelete}
                  title="Cancel"
                  disable={removeClassMutation.isPending}
                />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  disabled={removeClassMutation.isPending}
                  isLoading={removeClassMutation.isPending}
                  title={
                    removeClassMutation.isPending
                      ? "Deleting..."
                      : "Delete"
                  }
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Classes Table */}
        <TableWrapper
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          title="Class List"
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
                  title="Edit Class"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="hvr_zm_out"
                  title="Delete Class"
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

export default Class;
