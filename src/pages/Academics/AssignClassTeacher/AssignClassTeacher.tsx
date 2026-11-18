// src/pages/Academics/AssignClassTeacher/AssignClassTeacher.tsx

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useFetchAllClassTeachers,
  useAssignClassTeacher,
  useRemoveClassTeacher,
  type ClassTeacherRow,
  type AssignClassTeacherPayload,
} from "../../../hooks/useClassTeacher";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllTeacher } from "../../../hooks/useTeacher";
import { BASE_URL } from "../../../api/endpoints";
import "./AssignClassTeacher.scss";

// ─── Helper: resolve photo URL ───────────────────────────────────────────────
const getPhotoUrl = (p?: string | null): string => {
  if (!p) return "";
  if (p.startsWith("http") || p.startsWith("blob:") || p.startsWith("data:")) return p;
  const clean = p.startsWith("/") ? p.slice(1) : p;
  return clean.startsWith("public/") ? `${BASE_URL}/${clean}` : `${BASE_URL}/public/${clean}`;
};

// ─── Teacher card in picker ──────────────────────────────────────────────────
interface TeacherCardProps {
  id: number;
  name: string;
  staffCode?: string | null;
  photo?: string | null;
  checked: boolean;
  onToggle: () => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ id, name, staffCode, photo, checked, onToggle }) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
  const photoUrl = getPhotoUrl(photo);

  return (
    <div
      onClick={onToggle}
      className={`teacher_card${checked ? " selected" : ""}`}
    >
      {/* Avatar */}
      <div className="teacher_avatar">
        {photoUrl ? (
          <img src={photoUrl} alt={name} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <span className="teacher_initials">{initials || "T"}</span>
        )}
      </div>

      {/* Info */}
      <div className="teacher_info">
        <p className="teacher_name">{name || `Teacher #${id}`}</p>
        {staffCode && <p className="teacher_staff_code">{staffCode}</p>}
      </div>

      {/* Checkmark badge */}
      {checked && (
        <div className="teacher_check">
          <svg viewBox="0 0 14 14" fill="none" width="10" height="10">
            <path d="M2 7l3.5 3.5L12 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────
const initialFormState = {
  class_id: "" as string | number,
  section_id: "" as string | number,
  teacher_ids: [] as number[],
};

const ITEMS_PER_PAGE = 10;

const AssignClassTeacher: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Data
  const { data: rawRows = [], isLoading } = useFetchAllClassTeachers();
  const { data: classesData } = useFetchAllStudentClasses();
  const { data: sectionsData } = useFetchAllSections();
  const { data: teachersData } = useFetchAllTeacher();

  const assignMutation = useAssignClassTeacher();
  const removeMutation = useRemoveClassTeacher();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<ClassTeacherRow | null>(null);

  // ─── Table columns ──────────────────────────────────────────────────────────
  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "class", title: "Class" },
    { key: "section", title: "Section" },
    { key: "teacher", title: "Teacher" },
  ];

  // ─── Dropdown options ───────────────────────────────────────────────────────
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
      ? arr.filter((s: any) => !s.class_id || String(s.class_id) === String(formData.class_id))
      : arr;
    return filtered.map((s: any) => ({ label: s.name, value: s.id }));
  }, [sectionsData, formData.class_id]);

  // Rich teacher list (for the card picker)
  interface TeacherOption {
    id: number;
    name: string;
    staffCode: string | null;
    photo: string | null;
  }

  const teacherList: TeacherOption[] = useMemo(() => {
    const arr = Array.isArray(teachersData) ? teachersData : [];
    return arr.map((t: any) => ({
      id: t.id,
      name: t.user?.full_name || t.user?.name || t.full_name || `Teacher #${t.id}`,
      staffCode: t.staff_code ?? null,
      photo: t.photo ?? t.user?.photo ?? null,
    }));
  }, [teachersData]);

  // ─── Table data (filtered + paginated) ─────────────────────────────────────
  const filteredRows = useMemo(() => {
    if (!debouncedSearch.trim()) return rawRows;
    const q = debouncedSearch.toLowerCase();
    return rawRows.filter(
      (r) =>
        r.class_name.toLowerCase().includes(q) ||
        r.section_name.toLowerCase().includes(q) ||
        r.teacher_name.toLowerCase().includes(q) ||
        (r.teacher_staff_code ?? "").toLowerCase().includes(q)
    );
  }, [rawRows, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));

  const tableData = useMemo(() => {
    const slice = filteredRows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    return slice.map((r, i) => ({
      id: r.id,
      sl: start + i + 1,
      class: r.class_name,
      section: r.section_name,
      teacher: r.teacher_staff_code
        ? `${r.teacher_name} (${r.teacher_staff_code})`
        : r.teacher_name,
      full_data: r,
    }));
  }, [filteredRows, page]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleClassChange = (val: string | number) => {
    setFormData((prev) => ({ ...prev, class_id: val, section_id: "" }));
    if (errors.class_id) setErrors((prev) => ({ ...prev, class_id: "" }));
  };

  const handleSectionChange = (val: string | number) => {
    setFormData((prev) => ({ ...prev, section_id: val }));
    if (errors.section_id) setErrors((prev) => ({ ...prev, section_id: "" }));
  };

  const handleToggleTeacher = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      teacher_ids: prev.teacher_ids.includes(id)
        ? prev.teacher_ids.filter((tid) => tid !== id)
        : [...prev.teacher_ids, id],
    }));
    if (errors.teacher_ids) setErrors((prev) => ({ ...prev, teacher_ids: "" }));
  };

  const handleSelectAll = () => {
    const all = teacherList.map((t) => t.id);
    const isAll = all.length > 0 && all.every((id) => formData.teacher_ids.includes(id));
    setFormData((prev) => ({ ...prev, teacher_ids: isAll ? [] : all }));
  };

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!formData.class_id) e.class_id = "Please select a class";
    if (!formData.section_id) e.section_id = "Please select a section";
    if (formData.teacher_ids.length === 0) e.teacher_ids = "Please select at least one teacher";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: AssignClassTeacherPayload = {
      class_id: Number(formData.class_id),
      section_id: Number(formData.section_id),
      teacher_ids: formData.teacher_ids,
    };
    try {
      await assignMutation.mutateAsync(payload);
      toast.success("Class teacher(s) assigned successfully");
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to assign");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMutation.mutateAsync(deleteTarget.id);
      toast.success("Assignment removed");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to remove");
    }
  };

  if (isLoading) return <LoadingOverlay isLoading />;

  const isAllSelected =
    teacherList.length > 0 && teacherList.every((t) => formData.teacher_ids.includes(t.id));

  return (
    <div className="page_wrapper">
      <div className="assign_class_teacher_page">

        {/* ── Assign Modal ─────────────────────────────────────────────────── */}
        {isModalOpen && (
          <PopupScreen title="Assign Class Teacher" onClick={handleCloseModal}>
            <div className="popup_body">
              <div className="fields_wrapper">

                {/* Class & Section selects */}
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
                    label="Section *"
                    placeholder={formData.class_id ? "Select section" : "Select a class first"}
                    value={formData.section_id}
                    options={sectionOptions}
                    error={errors.section_id}
                    onChange={handleSectionChange}
                  />
                </div>

                {/* Teacher picker */}
                <div className="teacher_picker_section">
                  <div className="teacher_picker_header">
                    <label className="picker_label">Select Teachers *</label>
                    {teacherList.length > 0 && (
                      <button type="button" className="select_all_btn" onClick={handleSelectAll}>
                        {isAllSelected ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>

                  {teacherList.length === 0 ? (
                    <p className="picker_empty">No teachers available.</p>
                  ) : (
                    <div className={`teacher_cards_grid${errors.teacher_ids ? " has_error" : ""}`}>
                      {teacherList.map((t) => (
                        <TeacherCard
                          key={t.id}
                          id={t.id}
                          name={t.name}
                          staffCode={t.staffCode}
                          photo={t.photo}
                          checked={formData.teacher_ids.includes(t.id)}
                          onToggle={() => handleToggleTeacher(t.id)}
                        />
                      ))}
                    </div>
                  )}

                  {errors.teacher_ids && (
                    <p className="picker_error">{errors.teacher_ids}</p>
                  )}
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title="Reset"
                  onClick={() => { setFormData(initialFormState); setErrors({}); }}
                />
                <PrimaryButton
                  title={assignMutation.isPending ? "Assigning..." : "Assign Teacher"}
                  onClick={handleSubmit}
                  disabled={assignMutation.isPending}
                  isLoading={assignMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* ── Delete Modal ─────────────────────────────────────────────────── */}
        {deleteTarget && (
          <PopupScreen title="Remove Assignment" onClick={() => setDeleteTarget(null)}>
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Remove <strong>{deleteTarget.teacher_name}</strong> from{" "}
                  <strong>{deleteTarget.class_name} – {deleteTarget.section_name}</strong>?
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

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <TableWrapper
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => { setSearchTerm(val); setPage(1); }}
          title="Class Teachers List"
          onClick={handleOpenAddModal}
        >
          <DataTable
            columns={columns}
            data={tableData}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            actions={(row) => (
              <div className="actions">
                <button
                  type="button"
                  className="hvr_zm_out"
                  title="Remove assignment"
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

export default AssignClassTeacher;
