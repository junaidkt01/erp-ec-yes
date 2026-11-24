// src/pages/Academics/AssignSubject/AssignSubject.tsx

import React, { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useFetchAllClassSubjects,
  useAssignClassSubject,
  useUpdateClassSubject,
  useRemoveClassSubject,
  type ClassSubjectRow,
  type AssignClassSubjectPayload,
} from "../../../hooks/useClassSubject";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import { useFetchAllTeacher } from "../../../hooks/useTeacher";
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear";
import "./AssignSubject.scss";
import Can from "../../../components/permissions/Can";

const initialFormState = {
  class_id: "" as string | number,
  section_id: "" as string | number,
  subject_id: "" as string | number,
  teacher_id: "" as string | number,
  academic_year_id: "" as string | number,
};

interface FilterCriteria {
  class_id: string | number;
  section_id: string | number;
  subject_id: string | number;
  teacher_id: string | number;
  academic_year_id: string | number;
}

const initialFilterState: FilterCriteria = {
  class_id: "",
  section_id: "",
  subject_id: "",
  teacher_id: "",
  academic_year_id: "",
};

const ITEMS_PER_PAGE = 10;

const AssignSubject: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Filter criteria state
  const [filterData, setFilterData] = useState<FilterCriteria>(initialFilterState);
  const [appliedFilters, setAppliedFilters] = useState<FilterCriteria>(initialFilterState);

  // Queries & Mutations
  const {
    data: rawRows = [],
    isLoading,
    isFetching,
  } = useFetchAllClassSubjects({
    class_id: appliedFilters.class_id ? Number(appliedFilters.class_id) : undefined,
    section_id: appliedFilters.section_id ? Number(appliedFilters.section_id) : undefined,
    subject_id: appliedFilters.subject_id ? Number(appliedFilters.subject_id) : undefined,
    teacher_id: appliedFilters.teacher_id ? Number(appliedFilters.teacher_id) : undefined,
    academic_year_id: appliedFilters.academic_year_id
      ? Number(appliedFilters.academic_year_id)
      : undefined,
  });
  const { data: classesData } = useFetchAllStudentClasses();
  const { data: sectionsData } = useFetchAllSections();
  const { data: subjectsData } = useFetchAllSubjects();
  const { data: teachersData } = useFetchAllTeacher();
  const { data: academicYearsData } = useFetchAllAcademicYears();

  const assignMutation = useAssignClassSubject();
  const updateMutation = useUpdateClassSubject();
  const removeMutation = useRemoveClassSubject();

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassSubjectRow | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  console.log("formData: ", formData);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<ClassSubjectRow | null>(null);

  // Auto-select current academic year when available (for add mode)
  useEffect(() => {
    if (academicYearsData && Array.isArray(academicYearsData) && !editingItem) {
      const currentYear =
        academicYearsData.find((y: any) => y.is_current === 1) ||
        academicYearsData[0];
      if (currentYear && !formData.academic_year_id) {
        setFormData((prev) => ({
          ...prev,
          academic_year_id: currentYear.id,
        }));
      }
    }
  }, [academicYearsData, isModalOpen, editingItem]);

  // Table Columns
  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "class", title: "Class" },
    { key: "section", title: "Section" },
    { key: "subject", title: "Subject" },
    { key: "subject_type", title: "Subject Type" },
    { key: "teacher", title: "Teacher" },
  ];

  // Dropdown Options
  const classOptions = useMemo(() => {
    const arr = Array.isArray(classesData?.data)
      ? classesData.data
      : Array.isArray(classesData)
        ? classesData
        : [];
    return arr.map((c: any) => ({ label: c.name, value: c.id }));
  }, [classesData]);

  const sectionOptions = useMemo(() => {
    const arr = Array.isArray(sectionsData?.data)
      ? sectionsData.data
      : Array.isArray(sectionsData)
        ? sectionsData
        : [];
    const filtered = formData.class_id
      ? arr.filter(
        (s: any) =>
          !s.class_id || String(s.class_id) === String(formData.class_id)
      )
      : arr;
    return filtered.map((s: any) => ({ label: s.name, value: s.id }));
  }, [sectionsData, formData.class_id]);

  const filterSectionOptions = useMemo(() => {
    const arr = Array.isArray(sectionsData?.data)
      ? sectionsData.data
      : Array.isArray(sectionsData)
        ? sectionsData
        : [];
    if (!filterData.class_id) return [];
    const filtered = arr.filter(
      (s: any) =>
        !s.class_id || String(s.class_id) === String(filterData.class_id)
    );
    return filtered.map((s: any) => ({ label: s.name, value: s.id }));
  }, [sectionsData, filterData.class_id]);

  const subjectOptions = useMemo(() => {
    const arr = Array.isArray(subjectsData?.data)
      ? subjectsData.data
      : Array.isArray(subjectsData)
        ? subjectsData
        : [];
    return arr.map((s: any) => ({
      label: `${s.name}${s.code ? ` (${s.code})` : ""}${s.type ? ` - ${s.type}` : ""}`,
      value: s.id,
    }));
  }, [subjectsData]);

  const teacherOptions = useMemo(() => {
    const arr = Array.isArray(teachersData)
      ? teachersData
      : Array.isArray((teachersData as any)?.data)
        ? (teachersData as any).data
        : [];
    return arr.map((t: any) => {
      const name =
        t.user?.full_name ||
        t.user?.name ||
        t.full_name ||
        t.name ||
        `Teacher #${t.id}`;
      const code = t.staff_code ? ` (${t.staff_code})` : "";
      return {
        label: `${name}${code}`,
        value: t.id,
      };
    });
  }, [teachersData]);

  const academicYearOptions = useMemo(() => {
    const arr = Array.isArray(academicYearsData) ? academicYearsData : [];
    return arr.map((y: any) => ({
      label: `${y.name || y.title}${y.is_current ? " (Current)" : ""}`,
      value: y.id,
    }));
  }, [academicYearsData]);

  // Filtered & Paginated Rows
  const filteredRows = useMemo(() => {
    let rows = rawRows;

    if (appliedFilters.class_id) {
      rows = rows.filter(
        (r) => String(r.class_id) === String(appliedFilters.class_id)
      );
    }
    if (appliedFilters.section_id) {
      rows = rows.filter(
        (r) => String(r.section_id) === String(appliedFilters.section_id)
      );
    }
    if (appliedFilters.subject_id) {
      rows = rows.filter(
        (r) => String(r.subject_id) === String(appliedFilters.subject_id)
      );
    }
    if (appliedFilters.teacher_id) {
      rows = rows.filter(
        (r) => String(r.teacher_id) === String(appliedFilters.teacher_id)
      );
    }
    if (appliedFilters.academic_year_id) {
      rows = rows.filter(
        (r) =>
          String(r.academic_year_id) === String(appliedFilters.academic_year_id)
      );
    }

    if (!debouncedSearch.trim()) return rows;
    const q = debouncedSearch.toLowerCase();
    return rows.filter(
      (r) =>
        r.class_name.toLowerCase().includes(q) ||
        r.section_name.toLowerCase().includes(q) ||
        r.subject_name.toLowerCase().includes(q) ||
        (r.subject_code ?? "").toLowerCase().includes(q) ||
        (r.subject_type ?? "").toLowerCase().includes(q) ||
        r.teacher_name.toLowerCase().includes(q) ||
        (r.teacher_staff_code ?? "").toLowerCase().includes(q)
    );
  }, [rawRows, appliedFilters, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));

  const tableData = useMemo(() => {
    const slice = filteredRows.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
    const start = (page - 1) * ITEMS_PER_PAGE;
    return slice.map((r, i) => ({
      id: r.id,
      sl: start + i + 1,
      class: r.class_name,
      section: r.section_name,
      subject: r.subject_code
        ? `${r.subject_name} (${r.subject_code})`
        : r.subject_name,
      subject_type: r.subject_type || "-",
      teacher: r.teacher_staff_code
        ? `${r.teacher_name} (${r.teacher_staff_code})`
        : r.teacher_name,
      full_data: r,
    }));
  }, [filteredRows, page]);

  // Filter Handlers
  const handleFilterClassChange = (val: string | number) => {
    setFilterData((prev) => ({
      ...prev,
      class_id: val,
      section_id: "",
    }));
  };

  const handleSearchFilter = () => {
    setPage(1);
    setAppliedFilters({ ...filterData });
  };

  const handleResetFilter = () => {
    setFilterData(initialFilterState);
    setAppliedFilters(initialFilterState);
    setPage(1);
  };

  // Handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    const currentYear =
      academicYearsData?.find((y: any) => y.is_current === 1) ||
      academicYearsData?.[0];
    setFormData({
      ...initialFormState,
      academic_year_id: currentYear ? currentYear.id : "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ClassSubjectRow) => {
    setEditingItem(item);
    setFormData({
      class_id: item.class_id,
      section_id: item.section_id || "",
      subject_id: item.subject_id,
      teacher_id: item.teacher_id || "",
      academic_year_id: item.academic_year_id || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleClassChange = (val: string | number) => {
    setFormData((prev) => ({
      ...prev,
      class_id: val,
      section_id: "",
    }));
    if (errors.class_id) setErrors((prev) => ({ ...prev, class_id: "" }));
  };

  const handleSectionChange = (val: string | number) => {
    setFormData((prev) => ({ ...prev, section_id: val }));
    if (errors.section_id) setErrors((prev) => ({ ...prev, section_id: "" }));
  };

  const handleSubjectChange = (val: string | number) => {
    setFormData((prev) => ({ ...prev, subject_id: val }));
    if (errors.subject_id) setErrors((prev) => ({ ...prev, subject_id: "" }));
  };

  const handleTeacherChange = (val: string | number) => {
    setFormData((prev) => ({ ...prev, teacher_id: val }));
    if (errors.teacher_id) setErrors((prev) => ({ ...prev, teacher_id: "" }));
  };

  const handleAcademicYearChange = (val: string | number) => {
    setFormData((prev) => ({ ...prev, academic_year_id: val }));
  };

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!formData.class_id) e.class_id = "Please select a class";
    if (!formData.subject_id) e.subject_id = "Please select a subject";
    if (!formData.teacher_id) e.teacher_id = "Please select a teacher";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: AssignClassSubjectPayload = {
      class_id: Number(formData.class_id),
      section_id: formData.section_id ? Number(formData.section_id) : null,
      subject_id: Number(formData.subject_id),
      teacher_id: Number(formData.teacher_id),
      academic_year_id: formData.academic_year_id
        ? Number(formData.academic_year_id)
        : null,
    };
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          ...payload,
        });
        toast.success("Subject assignment updated successfully");
      } else {
        await assignMutation.mutateAsync(payload);
        toast.success("Subject assigned to class successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        (editingItem ? "Failed to update subject assignment" : "Failed to assign subject")
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMutation.mutateAsync(deleteTarget.id);
      toast.success("Subject assignment removed successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to remove subject assignment"
      );
    }
  };

  if (isLoading && rawRows.length === 0) return <LoadingOverlay isLoading />;

  const isSaving = assignMutation.isPending || updateMutation.isPending;

  return (
    <div className="page_wrapper">
      <div className="assign_subject_page">
        {/* ── Assign / Edit Subject Modal ─────────────────────────────────── */}
        {isModalOpen && (
          <PopupScreen
            title={editingItem ? "Edit Subject Assignment" : "Assign Subject"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    label="Class *"
                    placeholder="Select class"
                    value={formData.class_id}
                    options={classOptions}
                    error={errors.class_id}
                    onChange={handleClassChange}
                  />
                  <CustomSelect
                    label="Section"
                    placeholder={
                      formData.class_id
                        ? "Select section (optional)"
                        : "Select a class first"
                    }
                    value={formData.section_id}
                    options={sectionOptions}
                    error={errors.section_id}
                    onChange={handleSectionChange}
                  />
                </div>

                <div className="body_section">
                  <CustomSelect
                    label="Subject *"
                    placeholder="Select subject"
                    value={formData.subject_id}
                    options={subjectOptions}
                    error={errors.subject_id}
                    onChange={handleSubjectChange}
                  />
                  <CustomSelect
                    label="Teacher *"
                    placeholder="Select teacher"
                    value={formData.teacher_id}
                    options={teacherOptions}
                    error={errors.teacher_id}
                    onChange={handleTeacherChange}
                  />
                </div>

                {academicYearOptions.length > 0 && (
                  <div className="body_section">
                    <CustomSelect
                      label="Academic Year"
                      placeholder="Select academic year"
                      value={formData.academic_year_id}
                      options={academicYearOptions}
                      onChange={handleAcademicYearChange}
                    />
                  </div>
                )}
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingItem ? "Cancel" : "Reset"}
                  onClick={() => {
                    if (editingItem) {
                      handleCloseModal();
                    } else {
                      const currentYear =
                        academicYearsData?.find((y: any) => y.is_current === 1) ||
                        academicYearsData?.[0];
                      setFormData({
                        ...initialFormState,
                        academic_year_id: currentYear ? currentYear.id : "",
                      });
                      setErrors({});
                    }
                  }}
                />
                <PrimaryButton
                  title={
                    isSaving
                      ? "Saving..."
                      : editingItem
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

        {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
        {deleteTarget && (
          <PopupScreen
            title="Remove Subject Assignment"
            onClick={() => setDeleteTarget(null)}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to remove{" "}
                  <strong>{deleteTarget.subject_name}</strong> assigned to{" "}
                  <strong>{deleteTarget.class_name}</strong>
                  {deleteTarget.section_name &&
                    deleteTarget.section_name !== "-"
                    ? ` (${deleteTarget.section_name})`
                    : ""}?
                </p>
              </div>
              <div className="buttons">
                <SecondaryButton
                  title="Cancel"
                  onClick={() => setDeleteTarget(null)}
                  disable={removeMutation.isPending}
                />
                <PrimaryButton
                  title={removeMutation.isPending ? "Deleting..." : "Delete"}
                  onClick={handleConfirmDelete}
                  disabled={removeMutation.isPending}
                  isLoading={removeMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* ── Select Criteria Filter ────────────────────────────────────── */}
        <TableWrapper title="Select Criteria">
          <div className="search_screen">
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    label="Class"
                    placeholder="Select class"
                    value={filterData.class_id}
                    options={classOptions}
                    onChange={handleFilterClassChange}
                  />
                  <CustomSelect
                    label="Section"
                    placeholder={
                      filterData.class_id
                        ? "Select section"
                        : "Select a class first"
                    }
                    value={filterData.section_id}
                    options={filterSectionOptions}
                    onChange={(val) =>
                      setFilterData((prev) => ({ ...prev, section_id: val }))
                    }
                  />
                  <CustomSelect
                    label="Subject"
                    placeholder="Select subject"
                    value={filterData.subject_id}
                    options={subjectOptions}
                    onChange={(val) =>
                      setFilterData((prev) => ({ ...prev, subject_id: val }))
                    }
                  />
                </div>

                <div className="body_section">
                  <CustomSelect
                    label="Teacher"
                    placeholder="Select teacher"
                    value={filterData.teacher_id}
                    options={teacherOptions}
                    onChange={(val) =>
                      setFilterData((prev) => ({ ...prev, teacher_id: val }))
                    }
                  />
                  <CustomSelect
                    label="Academic Year"
                    placeholder="Select academic year"
                    value={filterData.academic_year_id}
                    options={academicYearOptions}
                    onChange={(val) =>
                      setFilterData((prev) => ({
                        ...prev,
                        academic_year_id: val,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Reset" onClick={handleResetFilter} />
                <PrimaryButton
                  title="Search"
                  isLoading={isFetching}
                  onClick={handleSearchFilter}
                />
              </div>
            </div>
          </div>
        </TableWrapper>

        {/* ── Table Wrapper ────────────────────────────────────────────────── */}
        <TableWrapper
          isAddButton
          isSearchBar
          permission="assign_subject"
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          title="Class Subjects List"
          onClick={handleOpenAddModal}
        >
          <DataTable
            columns={columns}
            data={tableData}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            actions={(row) => (
              <div className="actions" >
                <Can permission="edit_assign_subject" >
                  <button type="button" className="hvr_zm_out" title="Edit assignment" onClick={() => handleOpenEditModal(row.full_data)} >
                    <img src="/svgs/edit.svg" alt="Edit" />
                  </button>
                </Can>

                <Can permission="delete_assign_subject" >
                  <button type="button" className="hvr_zm_out" title="Remove assignment" onClick={() => setDeleteTarget(row.full_data)} >
                    <img src="/svgs/delete.svg" alt="Delete" />
                  </button>
                </Can>
              </div>
            )}
          />
        </TableWrapper>
      </div>
    </div>
  );
};

export default AssignSubject;
