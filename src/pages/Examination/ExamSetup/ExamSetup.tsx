import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import {
  useFetchAllExamTypes,
  useFetchAllExamSetups,
  useAddExamSetup,
  useUpdateExamSetup,
  useDeleteExamSetup,
} from "../../../hooks/useExamination";

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
];

const ITEMS_PER_PAGE = 10;

const ExamSetup: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"initial" | "configure">("initial");
  const [editingId, setEditingId] = useState<number | string | null>(null);

  // Data queries
  const { data: apiData } = useFetchAllExamSetups({ page, per_page: ITEMS_PER_PAGE, search: searchTerm });
  const { data: classesData } = useFetchAllStudentClasses();
  const { data: sectionsData } = useFetchAllSections();
  const { data: subjectsData } = useFetchAllSubjects();
  const { data: examTypesData } = useFetchAllExamTypes();

  const addSetupMutation = useAddExamSetup();
  const updateSetupMutation = useUpdateExamSetup();
  const deleteSetupMutation = useDeleteExamSetup();

  // Form states
  const [examSystem, setExamSystem] = useState<"Single Exam" | "Multi Exam">("Single Exam");
  const [examTitle, setExamTitle] = useState("");
  const [examMark, setExamMark] = useState("100");
  const [passMark, setPassMark] = useState("33");
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string | number>("");
  const [multiExamTypes, setMultiExamTypes] = useState<string[]>(["First Term"]);
  const [selectedClass, setSelectedClass] = useState("5");
  const [selectedSection, setSelectedSection] = useState("2");
  const [selectedSubject, setSelectedSubject] = useState("3");
  const [selectedTeacherId] = useState<string | number>("10");

  // Mark distributions
  const [markDistributions, setMarkDistributions] = useState<MarkDistributionRow[]>([
    { id: 1, title: "Written", mark: 50 },
    { id: 2, title: "Practical", mark: 50 },
  ]);

  // Options formatting
  const classOptions = useMemo(() => {
    const raw = Array.isArray(classesData?.data) ? classesData.data : Array.isArray(classesData) ? classesData : [];
    if (raw.length === 0) return [{ label: "Class 5", value: "5" }, { label: "Class 6", value: "6" }];
    return raw.map((c: any) => ({ label: c.name || `Class ${c.id}`, value: String(c.id) }));
  }, [classesData]);

  const sectionOptions = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data) ? sectionsData.data : Array.isArray(sectionsData) ? sectionsData : [];
    if (raw.length === 0) return [{ label: "Section A", value: "1" }, { label: "Section B", value: "2" }];
    return raw.map((s: any) => ({ label: s.name || `Section ${s.id}`, value: String(s.id) }));
  }, [sectionsData]);

  const subjectOptions = useMemo(() => {
    const raw = Array.isArray(subjectsData?.data) ? subjectsData.data : Array.isArray(subjectsData) ? subjectsData : [];
    if (raw.length === 0) return [{ label: "Physics", value: "3" }, { label: "Chemistry", value: "4" }];
    return raw.map((sub: any) => ({ label: sub.name || `Subject ${sub.id}`, value: String(sub.id) }));
  }, [subjectsData]);

  const examTypeOptions = useMemo(() => {
    const raw = Array.isArray(examTypesData?.data) ? examTypesData.data : Array.isArray(examTypesData) ? examTypesData : [];
    if (raw.length === 0) return [{ label: "First Term", value: "1" }, { label: "Second Term", value: "2" }];
    return raw.map((t: any) => ({ label: t.name, value: String(t.id) }));
  }, [examTypesData]);

  const rawList: ExamListItem[] = useMemo(() => {
    if (apiData?.data && Array.isArray(apiData.data)) {
      return apiData.data.map((item: any) => ({
        id: item.id,
        exam_title: item.exam_title || item.title || "Exam",
        class_and_section: `${item.class?.name || item.class_id || ""} ${item.section?.name || item.section_id || ""}`,
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
    setExamTitle("");
    setExamSystem("Single Exam");
    setExamMark("100");
    setPassMark("33");
    setModalStep("initial");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingId(item.id);
    setExamTitle(item.exam_title || item.title || "");
    setExamMark(String(item.total_marks || item.total_mark || "100"));
    setModalStep("configure");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setModalStep("initial");
  };

  const handleAddDistributionRow = () => {
    setMarkDistributions((prev) => [...prev, { id: Date.now(), title: "", mark: "" }]);
  };

  const handleRemoveDistributionRow = (id: number | string) => {
    setMarkDistributions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleInitialContinue = () => {
    setModalStep("configure");
  };

  const handleSaveExam = async () => {
    const payload = {
      exam_title: examTitle.trim() || "Exam Setup",
      exam_type_id: Number(selectedExamTypeId) || 1,
      class_id: Number(selectedClass) || 5,
      section_id: Number(selectedSection) || 2,
      subject_id: Number(selectedSubject) || 3,
      teacher_id: Number(selectedTeacherId) || 10,
      pass_mark: Number(passMark) || 33,
      total_mark: Number(examMark) || 100,
      mark_distributions: markDistributions.map((m) => ({
        title: m.title.trim() || "Written",
        mark: Number(m.mark) || 0,
      })),
    };

    try {
      if (editingId) {
        await updateSetupMutation.mutateAsync({ id: editingId, ...payload });
        toast.success("Exam setup updated successfully");
      } else {
        await addSetupMutation.mutateAsync(payload);
        toast.success("Exam setup created successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save exam setup");
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteSetupMutation.mutateAsync(id);
      toast.success("Exam setup deleted successfully");
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
            <div className="popup_body" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              {/* Step 1: Initial Choice (Exam System & Mark) */}
              {modalStep === "initial" && (
                <div>
                  <div className="fields_wrapper" style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
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
                    <InputField
                      type="number"
                      label="Exam Mark"
                      placeHolder="Enter exam mark"
                      value={examMark}
                      onChange={(e: any) => setExamMark(e?.target?.value || e)}
                    />
                  </div>

                  <div className="buttons">
                    <SecondaryButton
                      title="Reset"
                      onClick={() => {
                        setExamSystem("Single Exam");
                        setExamMark("100");
                      }}
                    />
                    <PrimaryButton title="Continue" onClick={handleInitialContinue} />
                  </div>
                </div>
              )}

              {/* Step 2: Configure Single or Multi Exam */}
              {modalStep === "configure" && (
                <div>
                  <div className="fields_wrapper" style={{ display: "grid", gap: "16px" }}>
                    <div className="body_section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <InputField
                        type="text"
                        label="Exam Title"
                        placeHolder="e.g. First Term Physics"
                        value={examTitle}
                        onChange={(e: any) => setExamTitle(e?.target?.value || e)}
                      />
                      <CustomSelect
                        label="Exam System"
                        options={[
                          { label: "Single Exam", value: "Single Exam" },
                          { label: "Multi Exam", value: "Multi Exam" },
                        ]}
                        value={examSystem}
                        onChange={(val: any) => setExamSystem(val)}
                      />
                    </div>

                    {examSystem === "Single Exam" ? (
                      <div className="body_section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
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
                        <CustomSelect
                          label="Section"
                          placeholder="Select section"
                          options={sectionOptions}
                          value={selectedSection}
                          onChange={(val: any) => setSelectedSection(val)}
                        />
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Exam Types</label>
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px", background: "#f8fafc", display: "flex", gap: "16px" }}>
                          {["First Term", "Second Term", "Third Term"].map((term) => (
                            <label key={term} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "#334155" }}>
                              <input
                                type="checkbox"
                                checked={multiExamTypes.includes(term)}
                                onChange={(e) => {
                                  if (e.target.checked) setMultiExamTypes((prev) => [...prev, term]);
                                  else setMultiExamTypes((prev) => prev.filter((t) => t !== term));
                                }}
                              />
                              <span>{term}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="body_section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                      <CustomSelect
                        label="Subject"
                        placeholder="Select subject"
                        options={subjectOptions}
                        value={selectedSubject}
                        onChange={(val: any) => setSelectedSubject(val)}
                      />
                      <InputField
                        type="number"
                        label="Total Mark"
                        placeHolder="Enter total mark"
                        value={examMark}
                        onChange={(e: any) => setExamMark(e?.target?.value || e)}
                      />
                      <InputField
                        type="number"
                        label="Pass Mark"
                        placeHolder="Enter pass mark"
                        value={passMark}
                        onChange={(e: any) => setPassMark(e?.target?.value || e)}
                      />
                    </div>
                  </div>

                  {/* Mark Distributions */}
                  <div style={{ marginTop: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>Mark Distributions</h3>
                      <button
                        type="button"
                        onClick={handleAddDistributionRow}
                        style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#605dec", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        Add <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: "12px", marginBottom: "8px", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                        <span>Title</span>
                        <span>Mark</span>
                        <span>Action</span>
                      </div>

                      {markDistributions.map((row) => (
                        <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: "12px", marginBottom: "10px", alignItems: "center" }}>
                          <InputField
                            type="text"
                            placeHolder="Enter title (e.g. Written)"
                            value={row.title}
                            onChange={(e: any) => {
                              const val = e?.target ? e.target.value : e;
                              setMarkDistributions((prev) => prev.map((r) => r.id === row.id ? { ...r, title: val } : r));
                            }}
                          />
                          <InputField
                            type="number"
                            placeHolder="Enter mark"
                            value={row.mark}
                            onChange={(e: any) => {
                              const val = e?.target ? e.target.value : e;
                              setMarkDistributions((prev) => prev.map((r) => r.id === row.id ? { ...r, mark: val } : r));
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveDistributionRow(row.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", justifyContent: "center" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <div style={{ marginTop: "12px", fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Total: {examMark}</div>
                    </div>
                  </div>

                  <div className="buttons">
                    <SecondaryButton title="Back" onClick={() => setModalStep("initial")} />
                    <PrimaryButton
                      title={addSetupMutation.isPending || updateSetupMutation.isPending ? "Saving..." : "Save Exam"}
                      icon={<Save size={16} />}
                      onClick={handleSaveExam}
                      disabled={addSetupMutation.isPending || updateSetupMutation.isPending}
                    />
                  </div>
                </div>
              )}
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
                  onClick={() => handleDelete(row.full_data?.id || row.id)}
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
