import React, { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { useFetchAllStudents } from "../../../hooks/useStudent";
import {
  useFetchAllStudentParents,
  useFetchStudentParentById,
  useAddStudentParent,
  useUpdateStudentParent,
  useDeleteStudentParent,
  type StudentParent,
} from "../../../hooks/useStudentParent";
import { studentParentSchema } from "../../../validations/studentParentSchema";

const ITEMS_PER_PAGE = 10;

const initialFilter = {
  class_id: "",
  section_id: "",
  parent_name: "",
  phone: "",
};

const initialForm = {
  student_id: "",
  father_name: "",
  father_phone: "",
  mother_name: "",
  mother_phone: "",
  guardian_name: "",
  guardian_phone: "",
};

export const StudentParentList: React.FC = () => {
  // Pagination & Search
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Criteria Filters
  const [filterCriteria, setFilterCriteria] = useState(initialFilter);
  const [appliedCriteria, setAppliedCriteria] = useState(initialFilter);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentParent | null>(null);
  const [viewingId, setViewingId] = useState<number | string | null>(null);
  const { data: viewingParentRes, isLoading: isViewingLoading } = useFetchStudentParentById(viewingId || undefined);
  const viewData: StudentParent | null = useMemo(() => {
    if (!viewingParentRes) return null;
    const raw = (viewingParentRes as any)?.data ?? viewingParentRes;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [viewingParentRes]);
  const [deleteTarget, setDeleteTarget] = useState<StudentParent | null>(null);

  // Form state
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Class & Section filters for modal student picker
  const [modalClassId, setModalClassId] = useState<string>("");
  const [modalSectionId, setModalSectionId] = useState<string>("");

  // Queries
  const { data: studentClasses } = useFetchAllStudentClasses();
  const { data: sectionsData } = useFetchAllSections();
  const { data: studentsResponse, isLoading: isStudentsLoading } = useFetchAllStudents(1, {
    class_id: modalClassId || undefined,
    section_id: modalSectionId || undefined,
  });

  const {
    data: apiResponse,
    isLoading: isListLoading,
    isFetching: isListFetching,
    isError: isListError,
  } = useFetchAllStudentParents(page, debouncedSearch);

  const addMutation = useAddStudentParent();
  const updateMutation = useUpdateStudentParent();
  const deleteMutation = useDeleteStudentParent();

  const isSaving = addMutation.isPending || updateMutation.isPending;

  // Options
  const classOptions = useMemo(() => {
    const raw = Array.isArray(studentClasses?.data)
      ? studentClasses.data
      : Array.isArray(studentClasses)
      ? studentClasses
      : [];
    return raw.map((cls: any) => ({
      label: cls.name || cls.class_name,
      value: cls.id,
    }));
  }, [studentClasses]);

  const filterSectionOptions = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data)
      ? sectionsData.data
      : Array.isArray(sectionsData)
      ? sectionsData
      : [];
    if (!filterCriteria.class_id) {
      return raw.map((sec: any) => ({
        label: sec.name || sec.section_name,
        value: sec.id,
      }));
    }
    return raw
      .filter((sec: any) => String(sec.class_id) === String(filterCriteria.class_id))
      .map((sec: any) => ({
        label: sec.name || sec.section_name,
        value: sec.id,
      }));
  }, [sectionsData, filterCriteria.class_id]);

  const modalSectionOptions = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data)
      ? sectionsData.data
      : Array.isArray(sectionsData)
      ? sectionsData
      : [];
    if (!modalClassId) {
      return raw.map((sec: any) => ({
        label: sec.name || sec.section_name,
        value: sec.id,
      }));
    }
    return raw
      .filter((sec: any) => String(sec.class_id) === String(modalClassId))
      .map((sec: any) => ({
        label: sec.name || sec.section_name,
        value: sec.id,
      }));
  }, [sectionsData, modalClassId]);

  const studentOptions = useMemo(() => {
    const raw = Array.isArray(studentsResponse?.data)
      ? studentsResponse.data
      : Array.isArray(studentsResponse)
      ? studentsResponse
      : [];

    const options = raw.map((std: any) => {
      const name =
        std.full_name ||
        `${std.first_name || ""} ${std.last_name || ""}`.trim() ||
        `Student #${std.id}`;
      const adm = std.admission_no ? `[${std.admission_no}] ` : "";
      return {
        label: `${adm}${name} (ID: ${std.id})`,
        value: std.id,
      };
    });

    if (
      formData.student_id &&
      !options.some((opt) => String(opt.value) === String(formData.student_id))
    ) {
      options.unshift({
        label: `Student ID: ${formData.student_id}`,
        value: formData.student_id,
      });
    }

    return options;
  }, [studentsResponse, formData.student_id]);

  // Extract raw list
  const rawList: StudentParent[] = useMemo(() => {
    if (!apiResponse) return [];
    if (Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }
    if (apiResponse.data && Array.isArray((apiResponse.data as any).data)) {
      return (apiResponse.data as any).data;
    }
    if (Array.isArray(apiResponse)) {
      return apiResponse as any;
    }
    return [];
  }, [apiResponse]);

  // Filtered List
  const filteredList = useMemo(() => {
    let result = rawList;

    if (appliedCriteria.class_id) {
      result = result.filter(
        (item) => String(item.student?.class?.id) === String(appliedCriteria.class_id)
      );
    }

    if (appliedCriteria.section_id) {
      result = result.filter(
        (item) =>
          String(item.student?.section?.id) === String(appliedCriteria.section_id)
      );
    }

    if (appliedCriteria.parent_name.trim()) {
      const q = appliedCriteria.parent_name.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.father_name || "").toLowerCase().includes(q) ||
          (item.mother_name || "").toLowerCase().includes(q) ||
          (item.guardian_name || "").toLowerCase().includes(q)
      );
    }

    if (appliedCriteria.phone.trim()) {
      const q = appliedCriteria.phone.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.father_phone || "").toLowerCase().includes(q) ||
          (item.mother_phone || "").toLowerCase().includes(q) ||
          (item.guardian_phone || "").toLowerCase().includes(q) ||
          String(item.student_id || "").toLowerCase().includes(q)
      );
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter((item) => {
        const matchStudentId = String(item.student_id || "").toLowerCase().includes(q);
        const matchFather = (item.father_name || "").toLowerCase().includes(q);
        const matchFatherPhone = (item.father_phone || "").toLowerCase().includes(q);
        const matchMother = (item.mother_name || "").toLowerCase().includes(q);
        const matchMotherPhone = (item.mother_phone || "").toLowerCase().includes(q);
        const matchGuardian = (item.guardian_name || "").toLowerCase().includes(q);
        const matchGuardianPhone = (item.guardian_phone || "").toLowerCase().includes(q);
        return (
          matchStudentId ||
          matchFather ||
          matchFatherPhone ||
          matchMother ||
          matchMotherPhone ||
          matchGuardian ||
          matchGuardianPhone
        );
      });
    }

    return result;
  }, [rawList, appliedCriteria, debouncedSearch]);

  // Pagination
  const backendLastPage =
    (apiResponse as any)?.data?.last_page ||
    (apiResponse as any)?.meta?.last_page ||
    (apiResponse as any)?.last_page;

  const totalPages = useMemo(() => {
    if (backendLastPage) return Number(backendLastPage);
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [backendLastPage, filteredList.length]);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "student_id", title: "Student ID" },
    { key: "father_name", title: "Father Name" },
    { key: "father_phone", title: "Father Phone" },
    { key: "mother_name", title: "Mother Name" },
    { key: "mother_phone", title: "Mother Phone" },
    { key: "guardian_name", title: "Guardian Name" },
    { key: "guardian_phone", title: "Guardian Phone" },
  ];

  const tableData = useMemo(() => {
    const listToDisplay = backendLastPage
      ? filteredList
      : filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const startIndex = backendLastPage
      ? (page - 1) * ((apiResponse as any)?.data?.per_page || ITEMS_PER_PAGE)
      : (page - 1) * ITEMS_PER_PAGE;

    return listToDisplay.map((item, index) => ({
      id: item.id,
      sl: startIndex + index + 1,
      student_id: item.student_id ? String(item.student_id) : "-",
      father_name: item.father_name || "-",
      father_phone: item.father_phone || "-",
      mother_name: item.mother_name || "-",
      mother_phone: item.mother_phone || "-",
      guardian_name: item.guardian_name || "-",
      guardian_phone: item.guardian_phone || "-",
      full_data: item,
      raw: item,
    }));
  }, [filteredList, page, backendLastPage, apiResponse]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setFormErrors({});
    setModalClassId("");
    setModalSectionId("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StudentParent) => {
    setEditingItem(item);
    setFormData({
      student_id: item.student_id ? String(item.student_id) : "",
      father_name: item.father_name || "",
      father_phone: item.father_phone || "",
      mother_name: item.mother_name || "",
      mother_phone: item.mother_phone || "",
      guardian_name: item.guardian_name || "",
      guardian_phone: item.guardian_phone || "",
    });
    setFormErrors({});
    if (item.student?.class?.id) setModalClassId(String(item.student.class.id));
    if (item.student?.section?.id) setModalSectionId(String(item.student.section.id));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialForm);
    setFormErrors({});
  };

  const handleInputChange = (e: any) => {
    const name = e?.target?.name || "";
    const value = e?.target?.value !== undefined ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const validationResult = studentParentSchema.safeParse({
      student_id: formData.student_id ? String(formData.student_id) : "",
      father_name: formData.father_name.trim(),
      father_phone: formData.father_phone.trim(),
      mother_name: formData.mother_name.trim(),
      mother_phone: formData.mother_phone.trim(),
      guardian_name: formData.guardian_name.trim(),
      guardian_phone: formData.guardian_phone.trim(),
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && typeof fieldName === "string") {
          errors[fieldName] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const payload = {
      student_id: Number(formData.student_id) || formData.student_id,
      father_name: formData.father_name.trim() || undefined,
      father_phone: formData.father_phone.trim() || undefined,
      mother_name: formData.mother_name.trim() || undefined,
      mother_phone: formData.mother_phone.trim() || undefined,
      guardian_name: formData.guardian_name.trim() || undefined,
      guardian_phone: formData.guardian_phone.trim() || undefined,
    };

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          ...payload,
        });
        toast.success("Student parent details updated successfully");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("Student parent details saved successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save student parent details";
      toast.error(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Student parent record deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete student parent";
      toast.error(msg);
    }
  };

  return (
    <div className="page_wrapper">
      <div className="student_parent">
        {isListLoading && <LoadingOverlay isLoading={true} />}

        {/* Reusable PopupScreen for Add / Edit */}
        {isModalOpen && (
          <PopupScreen
            title={editingItem ? "Edit Student Parent" : "Add Student Parent"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    label="Class (Filter)"
                    placeholder="Select class"
                    value={modalClassId}
                    options={classOptions}
                    onChange={(val) => {
                      setModalClassId(String(val));
                      setModalSectionId("");
                    }}
                  />
                  <CustomSelect
                    label="Section (Filter)"
                    placeholder={modalClassId ? "Select section" : "Select class first"}
                    value={modalSectionId}
                    options={modalSectionOptions}
                    onChange={(val) => setModalSectionId(String(val))}
                  />
                  <CustomSelect
                    label="Student *"
                    placeholder={
                      isStudentsLoading
                        ? "Loading students..."
                        : studentOptions.length > 0
                        ? "Select student"
                        : "No students found"
                    }
                    value={formData.student_id}
                    options={studentOptions}
                    error={formErrors.student_id}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, student_id: String(val) }));
                      if (formErrors.student_id) {
                        setFormErrors((prev) => ({ ...prev, student_id: "" }));
                      }
                    }}
                  />
                </div>

                <div className="body_section">
                  <InputField
                    type="text"
                    label="Father Name"
                    placeHolder="Enter father name"
                    name="father_name"
                    value={formData.father_name}
                    error={formErrors.father_name}
                    onChange={handleInputChange}
                  />
                  <InputField
                    type="text"
                    label="Father Phone"
                    placeHolder="Enter 10-digit phone"
                    name="father_phone"
                    value={formData.father_phone}
                    error={formErrors.father_phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="body_section">
                  <InputField
                    type="text"
                    label="Mother Name"
                    placeHolder="Enter mother name"
                    name="mother_name"
                    value={formData.mother_name}
                    error={formErrors.mother_name}
                    onChange={handleInputChange}
                  />
                  <InputField
                    type="text"
                    label="Mother Phone"
                    placeHolder="Enter 10-digit phone"
                    name="mother_phone"
                    value={formData.mother_phone}
                    error={formErrors.mother_phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="body_section">
                  <InputField
                    type="text"
                    label="Guardian Name"
                    placeHolder="Enter guardian name"
                    name="guardian_name"
                    value={formData.guardian_name}
                    error={formErrors.guardian_name}
                    onChange={handleInputChange}
                  />
                  <InputField
                    type="text"
                    label="Guardian Phone"
                    placeHolder="Enter 10-digit phone"
                    name="guardian_phone"
                    value={formData.guardian_phone}
                    error={formErrors.guardian_phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Cancel" onClick={handleCloseModal} />
                <PrimaryButton
                  title={isSaving ? "Saving..." : editingItem ? "Update" : "Save"}
                  isLoading={isSaving}
                  onClick={handleSubmit}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Reusable PopupScreen for View */}
        {viewingId && (
          <PopupScreen
            title={`Student Parent Details #${viewingId}`}
            onClick={() => setViewingId(null)}
          >
            <div className="popup_body">
              {isViewingLoading ? (
                <LoadingOverlay isLoading={true} />
              ) : (
                <div className="fields_wrapper">
                  <div className="body_section">
                    <InputField
                      type="text"
                      label="Student ID"
                      value={viewData?.student_id ? String(viewData.student_id) : "-"}
                      readOnly
                      placeHolder=""
                    />
                    <InputField
                      type="text"
                      label="Father Name"
                      value={viewData?.father_name || "-"}
                      readOnly
                      placeHolder=""
                    />
                    <InputField
                      type="text"
                      label="Father Phone"
                      value={viewData?.father_phone || "-"}
                      readOnly
                      placeHolder=""
                    />
                  </div>
                  <div className="body_section">
                    <InputField
                      type="text"
                      label="Mother Name"
                      value={viewData?.mother_name || "-"}
                      readOnly
                      placeHolder=""
                    />
                    <InputField
                      type="text"
                      label="Mother Phone"
                      value={viewData?.mother_phone || "-"}
                      readOnly
                      placeHolder=""
                    />
                  </div>
                  <div className="body_section">
                    <InputField
                      type="text"
                      label="Guardian Name"
                      value={viewData?.guardian_name || "-"}
                      readOnly
                      placeHolder=""
                    />
                    <InputField
                      type="text"
                      label="Guardian Phone"
                      value={viewData?.guardian_phone || "-"}
                      readOnly
                      placeHolder=""
                    />
                  </div>
                </div>
              )}

              <div className="buttons">
                <SecondaryButton title="Close" onClick={() => setViewingId(null)} />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Reusable PopupScreen for Delete Confirmation */}
        {deleteTarget && (
          <PopupScreen
            title={`Delete Student Parent #${deleteTarget.id}`}
            onClick={() => setDeleteTarget(null)}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to delete the parent record for{" "}
                  <strong>
                    {deleteTarget.father_name ||
                      deleteTarget.mother_name ||
                      deleteTarget.guardian_name ||
                      `Student #${deleteTarget.student_id}`}
                  </strong>
                  ?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title="Cancel"
                  onClick={() => setDeleteTarget(null)}
                />
                <PrimaryButton
                  title={deleteMutation.isPending ? "Deleting..." : "Delete"}
                  isLoading={deleteMutation.isPending}
                  onClick={handleConfirmDelete}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Reusable TableWrapper for Filter Criteria */}
        <TableWrapper title="Select Criteria" isAddButton={false}>
          <div className="search_screen">
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    value={filterCriteria.class_id}
                    label="Class"
                    placeholder="Select class"
                    options={classOptions}
                    onChange={(val) =>
                      setFilterCriteria((prev) => ({
                        ...prev,
                        class_id: String(val),
                        section_id: "",
                      }))
                    }
                  />
                  <CustomSelect
                    value={filterCriteria.section_id}
                    label="Section"
                    placeholder={
                      filterCriteria.class_id
                        ? "Select section"
                        : "Select class first"
                    }
                    options={filterSectionOptions}
                    onChange={(val) =>
                      setFilterCriteria((prev) => ({
                        ...prev,
                        section_id: String(val),
                      }))
                    }
                  />
                </div>
                <div className="body_section">
                  <InputField
                    type="text"
                    label="Parent Name"
                    placeHolder="Search by father, mother, guardian"
                    value={filterCriteria.parent_name}
                    onChange={(e: any) =>
                      setFilterCriteria((prev) => ({
                        ...prev,
                        parent_name: e?.target ? e.target.value : e,
                      }))
                    }
                  />
                  <InputField
                    type="text"
                    label="Phone / Student ID"
                    placeHolder="Enter phone number or student ID"
                    value={filterCriteria.phone}
                    onChange={(e: any) =>
                      setFilterCriteria((prev) => ({
                        ...prev,
                        phone: e?.target ? e.target.value : e,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title="Reset"
                  onClick={() => {
                    setFilterCriteria(initialFilter);
                    setAppliedCriteria(initialFilter);
                    setSearchTerm("");
                    setPage(1);
                  }}
                />
                <PrimaryButton
                  title="Search"
                  isLoading={isListFetching}
                  onClick={() => {
                    setAppliedCriteria({ ...filterCriteria });
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </TableWrapper>

        {/* Reusable TableWrapper & DataTable */}
        <TableWrapper
          title="Student Parent List"
          isAddButton={true}
          addButtonTitle="Add Student Parent"
          isSearchBar={true}
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
            actionsTitle="Action"
            emptyMessage={
              isListLoading
                ? undefined
                : isListError
                ? "Failed to load student parents. Please try again."
                : "No student parents found."
            }
            actions={(row) => {
              const item: StudentParent = row.raw;
              return (
                <div className="actions">
                  <button
                    type="button"
                    className="hvr_zm_out"
                    title="View Details"
                    onClick={() => setViewingId(item.id)}
                  >
                    <img src="/svgs/eye_open.svg" alt="View" />
                  </button>
                  <button type="button"
                    className="hvr_zm_out"
                    title="Edit Details"
                    onClick={() => handleOpenEditModal(item)}
                  >
                    <img src="/svgs/edit.svg" alt="Edit" />
                  </button>
                  <button
                    type="button"
                    className="hvr_zm_out"
                    title="Delete Parent"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <img src="/svgs/delete.svg" alt="Delete" />
                  </button>
                </div>
              );
            }}
          />
        </TableWrapper>
      </div>
    </div>
  );
};

export default StudentParentList;
