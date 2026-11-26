import React, { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Save, ChevronDown, ChevronUp } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import { useFetchAllStaff } from "../../../hooks/useStaff";
import {
  useFetchAllExamTypes,
  useFetchAllExamSetups,
  useAddExamSetup,
  useUpdateExamSetup,
  useDeleteExamSetup,
  useAddExamSchedule,
} from "../../../hooks/useExamination";
import "./ExamSetup.scss";

interface MarkDistributionRow {
  id: number | string;
  title: string;
  mark: string | number;
}

interface ExamListItem {
  id: number | string;
  exam_title: string;
  class_and_section: string;
  subject: string;
  total_marks: number | string;
  mark_distribution: string;
  full_data?: any;
}

const defaultExamList: ExamListItem[] = [
  { id: 1, exam_title: "First Term Physics", class_and_section: "5 B", subject: "Physics", total_marks: 100, mark_distribution: "Written: 50\nPractical: 50" },
  { id: 2, exam_title: "First Term Chemistry", class_and_section: "5 B", subject: "Chemistry", total_marks: 100, mark_distribution: "Written: 60\nPractical: 40" },
  { id: 3, exam_title: "First Term Biology", class_and_section: "5 B", subject: "Biology", total_marks: 100, mark_distribution: "Written: 70\nPractical: 30" },
];

const defaultDistributions: MarkDistributionRow[] = [
  { id: 1, title: "Written", mark: 50 },
  { id: 2, title: "Practical", mark: 50 },
];

const ITEMS_PER_PAGE = 10;

const ExamSetup: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Queries
  const { data: apiData } = useFetchAllExamSetups({ page, per_page: ITEMS_PER_PAGE, search: searchTerm });
  const { data: classesData } = useFetchAllStudentClasses();
  const { data: sectionsData } = useFetchAllSections();
  const { data: subjectsData } = useFetchAllSubjects();
  const { data: examTypesData } = useFetchAllExamTypes();
  const { data: staffData } = useFetchAllStaff(1);

  const addSetupMutation = useAddExamSetup();
  const updateSetupMutation = useUpdateExamSetup();
  const deleteSetupMutation = useDeleteExamSetup();
  const addScheduleMutation = useAddExamSchedule();

  // Form states
  const [examSystem, setExamSystem] = useState<"Single Exam" | "Multi Exam">("Single Exam");
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string | number>("1");
  const [selectedMultiExamTypes, setSelectedMultiExamTypes] = useState<string[]>(["First Term"]);
  const [isExamTypeDropdownOpen, setIsExamTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedClass, setSelectedClass] = useState("5");
  const [selectedSection, setSelectedSection] = useState("2");
  const [selectedSubject, setSelectedSubject] = useState("3");
  const [examMark, setExamMark] = useState("100");
  const [passMark] = useState("33");

  // Mark distributions
  const [markDistributions, setMarkDistributions] = useState<MarkDistributionRow[]>(defaultDistributions);

  // Schedule create fields
  const [scheduleTeacher, setScheduleTeacher] = useState("10");
  const [scheduleDate, setScheduleDate] = useState("2026-11-20");
  const [scheduleStartTime, setScheduleStartTime] = useState("09:00");
  const [scheduleEndTime, setScheduleEndTime] = useState("09:45");
  const [scheduleRoom, setScheduleRoom] = useState("235432");

  // Close multi-select on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsExamTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Options
  const classOptions = useMemo(() => {
    const raw = Array.isArray(classesData?.data) ? classesData.data : Array.isArray(classesData) ? classesData : [];
    if (raw.length === 0) return [{ label: "5", value: "5" }, { label: "6", value: "6" }, { label: "7", value: "7" }];
    return raw.map((c: any) => ({ label: c.name || `Class ${c.id}`, value: String(c.id) }));
  }, [classesData]);

  const sectionOptions = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data) ? sectionsData.data : Array.isArray(sectionsData) ? sectionsData : [];
    if (raw.length === 0) return [{ label: "A", value: "1" }, { label: "B", value: "2" }];
    return raw.map((s: any) => ({ label: s.name || `Section ${s.id}`, value: String(s.id) }));
  }, [sectionsData]);

  const subjectOptions = useMemo(() => {
    const raw = Array.isArray(subjectsData?.data) ? subjectsData.data : Array.isArray(subjectsData) ? subjectsData : [];
    if (raw.length === 0) return [{ label: "Physics", value: "3" }, { label: "Chemistry", value: "4" }, { label: "Biology", value: "5" }];
    return raw.map((sub: any) => ({ label: sub.name || `Subject ${sub.id}`, value: String(sub.id) }));
  }, [subjectsData]);

  const examTypeOptions = useMemo(() => {
    const raw = Array.isArray(examTypesData?.data) ? examTypesData.data : Array.isArray(examTypesData) ? examTypesData : [];
    if (raw.length === 0) return [
      { label: "First Term", value: "1" },
      { label: "Second Term", value: "2" },
      { label: "Third Term", value: "3" }
    ];
    return raw.map((t: any) => ({ label: t.name, value: String(t.id) }));
  }, [examTypesData]);

  const teacherOptions = useMemo(() => {
    const raw = Array.isArray(staffData?.data) ? staffData.data : Array.isArray(staffData) ? staffData : [];
    if (raw.length === 0) return [
      { label: "Jhon Martin", value: "10" },
      { label: "Robert Smith", value: "11" },
      { label: "Sarah Connor", value: "12" }
    ];
    return raw.map((s: any) => ({
      label: s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || `Staff #${s.id}`,
      value: String(s.id)
    }));
  }, [staffData]);

  // Total marks calculation
  const calculatedDistributionTotal = useMemo(() => {
    return markDistributions.reduce((acc, row) => acc + (Number(row.mark) || 0), 0);
  }, [markDistributions]);

  // List data formatting
  const rawList: ExamListItem[] = useMemo(() => {
    if (apiData?.data && Array.isArray(apiData.data)) {
      return apiData.data.map((item: any) => ({
        id: item.id,
        exam_title: item.exam_title || item.title || "Exam",
        class_and_section: `${item.class?.name || item.class_id || ""} ${item.section?.name || item.section_id || ""}`.trim() || "-",
        subject: item.subject?.name || item.subject_id || "-",
        total_marks: item.total_mark || item.total_marks || 100,
        mark_distribution: Array.isArray(item.mark_distributions)
          ? item.mark_distributions.map((d: any) => `${d.title}: ${d.mark}`).join("\n")
          : "-",
        full_data: item,
      }));
    }
    return defaultExamList;
  }, [apiData]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter(
      (item) =>
        item.exam_title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.class_and_section.toLowerCase().includes(q)
    );
  }, [rawList, searchTerm]);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "exam_title", title: "Exam Title" },
    { key: "class_and_section", title: "Class & Section" },
    { key: "subject", title: "Subject" },
    { key: "total_marks", title: "Total Marks" },
    { key: "mark_distribution", title: "Mark Distribution" },
  ];

  const tableData = useMemo(() => {
    const paginated = filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return paginated.map((item, index) => ({
      id: item.id,
      sl: (page - 1) * ITEMS_PER_PAGE + index + 1,
      exam_title: item.exam_title,
      class_and_section: item.class_and_section,
      subject: item.subject,
      total_marks: item.total_marks,
      mark_distribution: (
        <div style={{ whiteSpace: "pre-line", fontSize: "13px", color: "#475569" }}>
          {item.mark_distribution}
        </div>
      ),
      full_data: item,
    }));
  }, [filteredList, page]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setExamSystem("Single Exam");
    setSelectedExamTypeId("1");
    setSelectedMultiExamTypes(["First Term"]);
    setSelectedClass("5");
    setSelectedSection("2");
    setSelectedSubject("3");
    setExamMark("100");
    setMarkDistributions([
      { id: 1, title: "Written", mark: 50 },
      { id: 2, title: "Practical", mark: 50 },
    ]);
    setScheduleTeacher("10");
    setScheduleDate("2026-11-20");
    setScheduleStartTime("09:00");
    setScheduleEndTime("09:45");
    setScheduleRoom("235432");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingId(item.id);
    setExamSystem("Single Exam");
    setSelectedExamTypeId(String(item.exam_type_id || "1"));
    setSelectedClass(String(item.class_id || "5"));
    setSelectedSection(String(item.section_id || "2"));
    setSelectedSubject(String(item.subject_id || "3"));
    setExamMark(String(item.total_mark || item.total_marks || "100"));
    if (Array.isArray(item.mark_distributions) && item.mark_distributions.length > 0) {
      setMarkDistributions(
        item.mark_distributions.map((d: any, idx: number) => ({
          id: idx + 1,
          title: d.title || "",
          mark: d.mark || 0,
        }))
      );
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleResetForm = () => {
    setSelectedClass("5");
    setSelectedSection("2");
    setSelectedSubject("3");
    setExamMark("100");
    setMarkDistributions([
      { id: 1, title: "Written", mark: 50 },
      { id: 2, title: "Practical", mark: 50 },
    ]);
    setScheduleTeacher("10");
    setScheduleDate("2026-11-20");
    setScheduleStartTime("09:00");
    setScheduleEndTime("09:45");
    setScheduleRoom("235432");
  };

  const handleAddDistributionRow = () => {
    setMarkDistributions((prev) => [
      ...prev,
      { id: Date.now(), title: "", mark: "" },
    ]);
  };

  const handleRemoveDistributionRow = (id: number | string) => {
    if (markDistributions.length <= 1) {
      toast.info("At least one mark distribution is required");
      return;
    }
    setMarkDistributions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveExam = async () => {
    const selectedTypeName = examTypeOptions.find((t: any) => t.value === String(selectedExamTypeId))?.label || "First Term";
    const selectedSubName = subjectOptions.find((s: any) => s.value === String(selectedSubject))?.label || "Physics";
    const generatedTitle = `${selectedTypeName} ${selectedSubName}`;

    const payload = {
      exam_title: generatedTitle,
      exam_type_id: Number(selectedExamTypeId) || 1,
      class_id: Number(selectedClass) || 5,
      section_id: Number(selectedSection) || 2,
      subject_id: Number(selectedSubject) || 3,
      teacher_id: Number(scheduleTeacher) || 10,
      pass_mark: Number(passMark) || 33,
      total_mark: Number(examMark) || calculatedDistributionTotal || 100,
      mark_distributions: markDistributions.map((m) => ({
        title: m.title.trim() || "Written",
        mark: Number(m.mark) || 0,
      })),
    };

    try {
      let createdExamId: number | string = editingId || 1;
      if (editingId) {
        await updateSetupMutation.mutateAsync({ id: editingId, ...payload });
        toast.success("Exam setup updated successfully");
      } else {
        const res = await addSetupMutation.mutateAsync(payload);
        createdExamId = res?.data?.id || res?.id || 1;
        toast.success("Exam setup created successfully");

        // If in Single Exam mode and schedule details are provided, automatically link exam schedule
        if (examSystem === "Single Exam" && scheduleDate && scheduleStartTime && scheduleEndTime) {
          try {
            await addScheduleMutation.mutateAsync({
              exam_id: createdExamId,
              class_id: Number(selectedClass) || 5,
              section_id: Number(selectedSection) || 2,
              subject_id: Number(selectedSubject) || 3,
              teacher_id: Number(scheduleTeacher) || 10,
              exam_date: scheduleDate,
              start_time: scheduleStartTime.includes(":") && scheduleStartTime.length === 5 ? `${scheduleStartTime}:00` : scheduleStartTime,
              end_time: scheduleEndTime.includes(":") && scheduleEndTime.length === 5 ? `${scheduleEndTime}:00` : scheduleEndTime,
              duration: "45 Minutes",
              room: scheduleRoom || "235432",
            });
          } catch {
            // Schedule link failure is non-blocking for exam setup
          }
        }
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save exam setup");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSetupMutation.mutateAsync(deleteTarget.id);
      toast.success("Exam setup deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete exam setup");
    }
  };

  return (
    <div className="page_wrapper">
      <div className="exam_setup_page">
        {/* Exam Setup Popup Modal */}
        {isModalOpen && (
          <PopupScreen
            className="exam_setup_popup_modal"
            title={editingId ? "Edit Exam" : "Add Exam"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                {/* Single Exam Mode */}
                {examSystem === "Single Exam" ? (
                  <>
                    {/* Row 1: Exam System, Exam Type, Class */}
                    <div className="body_section">
                      <CustomSelect
                        label="Exam System"
                        placeholder="Select exam system"
                        options={[
                          { label: "Single Exam", value: "Single Exam" },
                          { label: "Multi Exam", value: "Multi Exam" },
                        ]}
                        value={examSystem}
                        onChange={(val: any) => setExamSystem(val)}
                      />
                      <CustomSelect
                        label="Exam Type"
                        placeholder="Select exam type"
                        options={examTypeOptions}
                        value={selectedExamTypeId}
                        onChange={(val: any) => setSelectedExamTypeId(val)}
                      />
                      <CustomSelect
                        label="Class"
                        placeholder="Select class"
                        options={classOptions}
                        value={selectedClass}
                        onChange={(val: any) => setSelectedClass(val)}
                      />
                    </div>

                    {/* Row 2: Section, Subject, Mark */}
                    <div className="body_section">
                      <CustomSelect
                        label="Section"
                        placeholder="Select section"
                        options={sectionOptions}
                        value={selectedSection}
                        onChange={(val: any) => setSelectedSection(val)}
                      />
                      <CustomSelect
                        label="Subject"
                        placeholder="Select subject"
                        options={subjectOptions}
                        value={selectedSubject}
                        onChange={(val: any) => setSelectedSubject(val)}
                      />
                      <InputField
                        type="number"
                        label="Mark"
                        placeHolder="Enter mark"
                        value={examMark}
                        onChange={(e: any) => setExamMark(e?.target?.value || e)}
                      />
                    </div>
                  </>
                ) : (
                  /* Multi Exam Mode */
                  <div className="body_section" style={{ gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr" }}>
                    <CustomSelect
                      label="Exam System"
                      placeholder="Select exam system"
                      options={[
                        { label: "Single Exam", value: "Single Exam" },
                        { label: "Multi Exam", value: "Multi Exam" },
                      ]}
                      value={examSystem}
                      onChange={(val: any) => setExamSystem(val)}
                    />

                    {/* Custom Multi-Select Dropdown with checkboxes */}
                    <div className="custom_multi_select" ref={dropdownRef}>
                      <label className="multi_select_label">Exam Type</label>
                      <div
                        className="multi_select_trigger"
                        onClick={() => setIsExamTypeDropdownOpen((prev) => !prev)}
                      >
                        {selectedMultiExamTypes.length === 0 ? (
                          <span className="placeholder">Select exam type</span>
                        ) : (
                          <div className="selected_tags">
                            {selectedMultiExamTypes.map((type) => (
                              <span key={type} className="tag">{type}</span>
                            ))}
                          </div>
                        )}
                        {isExamTypeDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>

                      {isExamTypeDropdownOpen && (
                        <div className="multi_select_menu">
                          {["First Term", "Second Term", "Third Term"].map((term) => (
                            <label key={term} className="multi_select_item">
                              <input
                                type="checkbox"
                                checked={selectedMultiExamTypes.includes(term)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMultiExamTypes((prev) => [...prev, term]);
                                  } else {
                                    setSelectedMultiExamTypes((prev) => prev.filter((t) => t !== term));
                                  }
                                }}
                              />
                              <span>{term}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <CustomSelect
                      label="Class"
                      placeholder="Select class"
                      options={classOptions}
                      value={selectedClass}
                      onChange={(val: any) => setSelectedClass(val)}
                    />
                    <InputField
                      type="number"
                      label="Exam Mark"
                      placeHolder="Enter mark"
                      value={examMark}
                      onChange={(e: any) => setExamMark(e?.target?.value || e)}
                    />
                  </div>
                )}
              </div>

              {/* Sub-section: Add Mark Distributions */}
              <div className="sub_section_wrapper">
                <div className="sub_section_header">
                  <h3 className="sub_title">Add Mark Distributions</h3>
                  <button
                    type="button"
                    className="add_row_btn"
                    onClick={handleAddDistributionRow}
                  >
                    Add <Plus size={14} />
                  </button>
                </div>

                <div className="distribution_table_card">
                  <div className="dist_header_row">
                    <span>Exam Title</span>
                    <span>Exam Mark</span>
                    <span style={{ textAlign: "center" }}>Actions</span>
                  </div>

                  {markDistributions.map((row) => (
                    <div key={row.id} className="dist_data_row">
                      <InputField
                        type="text"
                        placeHolder="Enter title (e.g. Written)"
                        value={row.title}
                        onChange={(e: any) => {
                          const val = e?.target ? e.target.value : e;
                          setMarkDistributions((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, title: val } : r))
                          );
                        }}
                      />
                      <InputField
                        type="number"
                        placeHolder="Enter mark"
                        value={row.mark}
                        onChange={(e: any) => {
                          const val = e?.target ? e.target.value : e;
                          setMarkDistributions((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, mark: val } : r))
                          );
                        }}
                      />
                      <button
                        type="button"
                        className="delete_row_btn"
                        title="Delete"
                        onClick={() => handleRemoveDistributionRow(row.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <div className="dist_total_footer">
                    <span className="total_label">
                      Total: {calculatedDistributionTotal || examMark || 40}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-section: Exam Schedule Create (Shown in Single Exam Mode) */}
              {examSystem === "Single Exam" && (
                <div className="sub_section_wrapper">
                  <div className="sub_section_header">
                    <h3 className="sub_title">Exam Schedule Create</h3>
                  </div>

                  <div className="schedule_card">
                    <div className="body_section five_cols">
                      <CustomSelect
                        label="Teacher"
                        placeholder="Select teacher"
                        options={teacherOptions}
                        value={scheduleTeacher}
                        onChange={(val: any) => setScheduleTeacher(val)}
                      />
                      <InputField
                        type="date"
                        label="Date"
                        placeHolder="Select date"
                        value={scheduleDate}
                        onChange={(e: any) => setScheduleDate(e?.target?.value || e)}
                      />
                      <InputField
                        type="time"
                        label="Start Time"
                        placeHolder="Select time"
                        value={scheduleStartTime}
                        onChange={(e: any) => setScheduleStartTime(e?.target?.value || e)}
                      />
                      <InputField
                        type="time"
                        label="End Time"
                        placeHolder="Select time"
                        value={scheduleEndTime}
                        onChange={(e: any) => setScheduleEndTime(e?.target?.value || e)}
                      />
                      <InputField
                        type="text"
                        label="Room"
                        placeHolder="Select room"
                        value={scheduleRoom}
                        onChange={(e: any) => setScheduleRoom(e?.target?.value || e)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="modal_actions">
                <SecondaryButton
                  title="Reset"
                  onClick={handleResetForm}
                />
                <PrimaryButton
                  title={
                    addSetupMutation.isPending || updateSetupMutation.isPending
                      ? "Saving..."
                      : "Save Exam"
                  }
                  icon={<Save size={16} />}
                  onClick={handleSaveExam}
                  disabled={addSetupMutation.isPending || updateSetupMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <PopupScreen
            className="delete_confirm_modal"
            title="Delete Exam Setup"
            onClick={() => setDeleteTarget(null)}
          >
            <div className="popup_body" style={{ padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "15px", color: "#475569", marginBottom: "24px" }}>
                Are you sure you want to delete exam setup <strong>"{deleteTarget.exam_title || deleteTarget.title}"</strong>?
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <SecondaryButton
                  title="Cancel"
                  onClick={() => setDeleteTarget(null)}
                />
                <PrimaryButton
                  title={deleteSetupMutation.isPending ? "Deleting..." : "Confirm Delete"}
                  onClick={handleConfirmDelete}
                  disabled={deleteSetupMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Exam List Table View */}
        <TableWrapper
          title="Exam List"
          addButtonTitle="Add Exam"
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
            totalPages={Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE))}
            onPageChange={(p) => setPage(p)}
            actions={(row) => (
              <div className="actions">
                <button
                  type="button"
                  className="edit_btn hvr_zm_out"
                  title="Edit"
                  onClick={() => handleOpenEditModal(row.full_data || row)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete"
                  onClick={() => setDeleteTarget(row.full_data || row)}
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

export default ExamSetup;
