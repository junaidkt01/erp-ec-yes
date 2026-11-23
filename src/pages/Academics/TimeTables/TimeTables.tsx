// src/pages/Academics/TimeTables/TimeTables.tsx

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
import { useFetchAllTimetables, useCreateTimetable, useUpdateTimetable, useDeleteTimetable, type TimetableRow, type CreateTimetablePayload } from "../../../hooks/useTimetable";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import { useFetchAllTeacher } from "../../../hooks/useTeacher";
import "./TimeTables.scss";
import Can from "../../../components/permissions/Can";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_OPTIONS = DAYS.map((d) => ({ label: d, value: d }));

const initialFormState = {
  class_id: "" as string | number,
  section_id: "" as string | number,
  subject_id: "" as string | number,
  teacher_id: "" as string | number,
  day: "" as string,
  start_time: "" as string,
  end_time: "" as string,
};

const initialFilterCriteria = {
  class_id: "" as string | number,
  section_id: "" as string | number,
};

const ITEMS_PER_PAGE = 10;

// Helper to format time into "HH:MM" for HTML input[type="time"]
const formatTimeToHHMM = (t?: string): string => {
  if (!t) return "";
  const parts = t.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return t;
};

const TimeTables: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Filter criteria state
  const [filterData, setFilterData] = useState(initialFilterCriteria);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterCriteria);

  // Queries & Mutations
  const { data: rawRows = [], isLoading } = useFetchAllTimetables({
    class_id: appliedFilters.class_id ? Number(appliedFilters.class_id) : undefined,
    section_id: appliedFilters.section_id ? Number(appliedFilters.section_id) : undefined,
  });
  console.log("rawRows: ", rawRows)
  const { data: classesData } = useFetchAllStudentClasses();
  const { data: sectionsData } = useFetchAllSections();
  const { data: subjectsData } = useFetchAllSubjects();
  const { data: teachersData } = useFetchAllTeacher();

  const createMutation = useCreateTimetable();
  const updateMutation = useUpdateTimetable();
  const deleteMutation = useDeleteTimetable();

  // Modal & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableRow | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<TimetableRow | null>(null);

  const handleSearch = () => {
    setPage(1);
    setAppliedFilters({ ...filterData });
  };

  const handleReset = () => {
    setFilterData(initialFilterCriteria);
    setAppliedFilters(initialFilterCriteria);
    setPage(1);
  };

  // ── Lookup maps for resolving IDs to names ───────────────────────────────

  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    const arr = Array.isArray(classesData?.data)
      ? classesData.data
      : Array.isArray(classesData)
        ? classesData
        : [];
    arr.forEach((c: any) => {
      if (c?.id != null && c?.name) {
        map.set(String(c.id), c.name);
      }
    });
    return map;
  }, [classesData]);

  const sectionMap = useMemo(() => {
    const map = new Map<string, string>();
    const secArr = Array.isArray(sectionsData?.data)
      ? sectionsData.data
      : Array.isArray(sectionsData)
        ? sectionsData
        : [];
    secArr.forEach((s: any) => {
      if (s?.id != null && s?.name) {
        map.set(String(s.id), s.name);
      }
    });

    const clsArr = Array.isArray(classesData?.data)
      ? classesData.data
      : Array.isArray(classesData)
        ? classesData
        : [];
    clsArr.forEach((c: any) => {
      if (Array.isArray(c.sections)) {
        c.sections.forEach((s: any) => {
          if (s?.id != null && s?.name && !map.has(String(s.id))) {
            map.set(String(s.id), s.name);
          }
        });
      }
    });
    return map;
  }, [sectionsData, classesData]);

  const subjectMap = useMemo(() => {
    const map = new Map<string, string>();
    const arr = Array.isArray(subjectsData?.data)
      ? subjectsData.data
      : Array.isArray(subjectsData)
        ? subjectsData
        : [];
    arr.forEach((s: any) => {
      if (s?.id != null && s?.name) {
        const label = s.code ? `${s.name} (${s.code})` : s.name;
        map.set(String(s.id), label);
      }
    });
    return map;
  }, [subjectsData]);

  const teacherMap = useMemo(() => {
    const map = new Map<string, string>();
    const arr = Array.isArray(teachersData)
      ? teachersData
      : Array.isArray((teachersData as any)?.data)
        ? (teachersData as any).data
        : [];
    arr.forEach((t: any) => {
      const name =
        t.user?.full_name ||
        t.user?.name ||
        t.full_name ||
        t.name ||
        (t.first_name ? `${t.first_name} ${t.last_name ?? ""}`.trim() : "") ||
        `Teacher #${t.id}`;
      const code = t.staff_code ? ` (${t.staff_code})` : "";
      if (t?.id != null) {
        map.set(String(t.id), `${name}${code}`);
      }
    });
    return map;
  }, [teachersData]);

  // ── Dropdown options ──────────────────────────────────────────────────────

  const classOptions = useMemo(() => {
    const arr = Array.isArray(classesData?.data)
      ? classesData.data
      : Array.isArray(classesData)
        ? classesData
        : [];
    return arr.map((c: any) => ({ label: c.name, value: c.id }));
  }, [classesData]);

  const formSectionOptions = useMemo(() => {
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
    const filtered = filterData.class_id
      ? arr.filter(
        (s: any) =>
          !s.class_id || String(s.class_id) === String(filterData.class_id)
      )
      : arr;
    return filtered.map((s: any) => ({ label: s.name, value: s.id }));
  }, [sectionsData, filterData.class_id]);

  const subjectOptions = useMemo(() => {
    const arr = Array.isArray(subjectsData?.data)
      ? subjectsData.data
      : Array.isArray(subjectsData)
        ? subjectsData
        : [];
    return arr.map((s: any) => ({
      label: `${s.name}${s.code ? ` (${s.code})` : ""}`,
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
      return { label: `${name}${code}`, value: t.id };
    });
  }, [teachersData]);

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "class", title: "Class" },
    { key: "section", title: "Section" },
    { key: "subject", title: "Subject" },
    { key: "teacher", title: "Teacher" },
    { key: "day", title: "Day" },
    { key: "start_time", title: "Start Time" },
    { key: "end_time", title: "End Time" },
  ];

  // ── Enriched rows with resolved names ─────────────────────────────────────

  const enrichedRows = useMemo(() => {
    return rawRows.map((r) => {
      // 1. Resolve Class
      const rawClass = r.raw?.class ?? r.raw?.student_class ?? r.raw?.classes;
      const resolvedClass =
        rawClass?.name ||
        (r.class_id ? classMap.get(String(r.class_id)) : undefined) ||
        (r.class_name && !r.class_name.startsWith("Class ")
          ? r.class_name
          : r.class_id
            ? classMap.get(String(r.class_id)) || r.class_name
            : r.class_name);

      // 2. Resolve Section
      const rawSection = r.raw?.section ?? r.raw?.sections;
      const resolvedSection =
        rawSection?.name ||
        (r.section_id ? sectionMap.get(String(r.section_id)) : undefined) ||
        (r.section_name && !r.section_name.startsWith("Section ") && r.section_name !== "-"
          ? r.section_name
          : (r.section_id ? sectionMap.get(String(r.section_id)) : undefined) || "-");

      // 3. Resolve Subject
      const rawSubject = r.raw?.subject ?? r.raw?.subjects;
      const resolvedSubject =
        rawSubject?.name ||
        (r.subject_id ? subjectMap.get(String(r.subject_id)) : undefined) ||
        (r.subject_name && !r.subject_name.startsWith("Subject #")
          ? r.subject_name
          : r.subject_id
            ? subjectMap.get(String(r.subject_id)) || r.subject_name
            : r.subject_name);

      // 4. Resolve Teacher
      const rawTeacher = r.raw?.teacher ?? r.raw?.staff;
      const rawUser = rawTeacher?.user ?? r.raw?.user;
      const rawTeacherName =
        rawUser?.full_name ||
        rawUser?.name ||
        rawTeacher?.full_name ||
        rawTeacher?.name;
      const resolvedTeacher =
        rawTeacherName ||
        (r.teacher_id ? teacherMap.get(String(r.teacher_id)) : undefined) ||
        (r.teacher_name && !r.teacher_name.startsWith("Teacher #")
          ? r.teacher_name
          : r.teacher_id
            ? teacherMap.get(String(r.teacher_id)) || r.teacher_name
            : r.teacher_name);

      return {
        ...r,
        class_name: resolvedClass || r.class_name || "-",
        section_name: resolvedSection || r.section_name || "-",
        subject_name: resolvedSubject || r.subject_name || "-",
        teacher_name: resolvedTeacher || r.teacher_name || "-",
      };
    });
  }, [rawRows, classMap, sectionMap, subjectMap, teacherMap]);

  // ── Filter & paginate ─────────────────────────────────────────────────────

  const filteredRows = useMemo(() => {
    let rows = enrichedRows;

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

    if (!debouncedSearch.trim()) return rows;
    const q = debouncedSearch.toLowerCase();
    return rows.filter(
      (r) =>
        r.class_name.toLowerCase().includes(q) ||
        r.section_name.toLowerCase().includes(q) ||
        r.subject_name.toLowerCase().includes(q) ||
        r.teacher_name.toLowerCase().includes(q) ||
        r.day.toLowerCase().includes(q) ||
        (r.start_time && r.start_time.toLowerCase().includes(q)) ||
        (r.end_time && r.end_time.toLowerCase().includes(q))
    );
  }, [enrichedRows, appliedFilters, debouncedSearch]);

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
      section: r.section_name || "-",
      subject: r.subject_name,
      teacher: r.teacher_name,
      day: r.day,
      start_time: formatTimeToHHMM(r.start_time) || r.start_time,
      end_time: formatTimeToHHMM(r.end_time) || r.end_time,
      full_data: r,
    }));
  }, [filteredRows, page]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TimetableRow) => {
    setEditingItem(item);
    setFormData({
      class_id: item.class_id,
      section_id: item.section_id || "",
      subject_id: item.subject_id,
      teacher_id: item.teacher_id || "",
      day: item.day,
      start_time: formatTimeToHHMM(item.start_time),
      end_time: formatTimeToHHMM(item.end_time),
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

  const setField = (key: keyof typeof initialFormState, value: string | number) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: "" }));

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!formData.class_id) e.class_id = "Please select a class";
    if (!formData.subject_id) e.subject_id = "Please select a subject";
    if (!formData.teacher_id) e.teacher_id = "Please select a teacher";
    if (!formData.day) e.day = "Please select a day";
    if (!formData.start_time) e.start_time = "Please enter start time";
    if (!formData.end_time) e.end_time = "Please enter end time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: CreateTimetablePayload = {
      class_id: Number(formData.class_id),
      section_id: formData.section_id ? Number(formData.section_id) : null,
      subject_id: Number(formData.subject_id),
      teacher_id: Number(formData.teacher_id),
      day: formData.day as string,
      start_time: formData.start_time as string,
      end_time: formData.end_time as string,
    };

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          ...payload,
        });
        toast.success("Timetable entry updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Timetable entry added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save timetable"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Timetable entry removed successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete timetable entry"
      );
    }
  };

  if (isLoading && rawRows.length === 0) return <LoadingOverlay isLoading />;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="page_wrapper">
      <div className="timetable_page">
        {/* ── Add / Edit Timetable Modal ────────────────────────────────────── */}
        {isModalOpen && (
          <PopupScreen
            title={editingItem ? "Edit Timetable" : "Add Timetable"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                {/* Row 1: Class | Section */}
                <div className="body_section">
                  <CustomSelect
                    label="Class *"
                    placeholder="Select class"
                    value={formData.class_id}
                    options={classOptions}
                    error={errors.class_id}
                    onChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        class_id: val,
                        section_id: "",
                      }));
                      clearError("class_id");
                    }}
                  />
                  <CustomSelect
                    label="Section"
                    placeholder={
                      formData.class_id
                        ? "Select section (optional)"
                        : "Select a class first"
                    }
                    value={formData.section_id}
                    options={formSectionOptions}
                    onChange={(val) => setField("section_id", val)}
                  />
                </div>

                {/* Row 2: Subject | Teacher */}
                <div className="body_section">
                  <CustomSelect
                    label="Subject *"
                    placeholder="Select subject"
                    value={formData.subject_id}
                    options={subjectOptions}
                    error={errors.subject_id}
                    onChange={(val) => {
                      setField("subject_id", val);
                      clearError("subject_id");
                    }}
                  />
                  <CustomSelect
                    label="Teacher *"
                    placeholder="Select teacher"
                    value={formData.teacher_id}
                    options={teacherOptions}
                    error={errors.teacher_id}
                    onChange={(val) => {
                      setField("teacher_id", val);
                      clearError("teacher_id");
                    }}
                  />
                </div>

                {/* Row 3: Day | Start Time | End Time */}
                <div className="body_section three_col">
                  <CustomSelect
                    label="Day *"
                    placeholder="Select day"
                    value={formData.day}
                    options={DAY_OPTIONS}
                    error={errors.day}
                    onChange={(val) => {
                      setField("day", val as string);
                      clearError("day");
                    }}
                  />
                  <InputField
                    type="time"
                    label="Start Time *"
                    placeHolder="HH:MM"
                    value={formData.start_time}
                    error={errors.start_time}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setField("start_time", val);
                      clearError("start_time");
                    }}
                  />
                  <InputField
                    type="time"
                    label="End Time *"
                    placeHolder="HH:MM"
                    value={formData.end_time}
                    error={errors.end_time}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setField("end_time", val);
                      clearError("end_time");
                    }}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingItem ? "Cancel" : "Reset"}
                  onClick={
                    editingItem
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
                      : editingItem
                        ? "Update Timetable"
                        : "Save Timetable"
                  }
                  onClick={handleSubmit}
                  disabled={isSaving}
                  isLoading={isSaving}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
        {deleteTarget && (
          <PopupScreen
            title="Remove Timetable Entry"
            onClick={() => setDeleteTarget(null)}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to remove the{" "}
                  <strong>{deleteTarget.day}</strong> timetable entry for{" "}
                  <strong>{deleteTarget.subject_name}</strong> in{" "}
                  <strong>{deleteTarget.class_name}</strong>
                  {deleteTarget.section_name && deleteTarget.section_name !== "-"
                    ? ` (${deleteTarget.section_name})`
                    : ""}
                  ?
                </p>
              </div>
              <div className="buttons">
                <SecondaryButton
                  title="Cancel"
                  onClick={() => setDeleteTarget(null)}
                  disable={deleteMutation.isPending}
                />
                <PrimaryButton
                  title={deleteMutation.isPending ? "Deleting..." : "Delete"}
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                  isLoading={deleteMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

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
                    onChange={(val) => {
                      setFilterData((prev) => ({
                        ...prev,
                        class_id: val,
                        section_id: "",
                      }));
                    }}
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
                    onChange={(val) => {
                      setFilterData((prev) => ({
                        ...prev,
                        section_id: val,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Reset" onClick={handleReset} />
                <PrimaryButton title="Search" onClick={handleSearch} />
              </div>
            </div>
          </div>
        </TableWrapper>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <TableWrapper
          isAddButton
          permission="add_timetable"
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          title="Timetable List"
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
                <Can permission="timetable_edit" >
                  <button type="button" className="hvr_zm_out" title="Edit timetable entry" onClick={() => handleOpenEditModal(row.full_data)} >
                    <img src="/svgs/edit.svg" alt="Edit" />
                  </button>
                </Can>
                <Can permission="timetable_delete" >
                  <button type="button" className="hvr_zm_out" title="Remove timetable entry" onClick={() => setDeleteTarget(row.full_data)} >
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

export default TimeTables;
