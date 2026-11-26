import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import {
  useFetchExamAttendances,
  useStoreExamAttendance,
} from "../../../hooks/useExamination";

interface AttendanceStudentRow {
  id: number | string;
  student_id: number | string;
  admission_no: string;
  roll_no: string;
  student_name: string;
  attendance: "P" | "A";
  note?: string;
  full_data?: any;
}

const defaultStudents: AttendanceStudentRow[] = [
  { id: 101, student_id: 101, admission_no: "ADM-1001", roll_no: "01", student_name: "Ahmad Farooq", attendance: "P" },
  { id: 102, student_id: 102, admission_no: "ADM-1002", roll_no: "02", student_name: "Fatima Noor", attendance: "P" },
  { id: 103, student_id: 103, admission_no: "ADM-1003", roll_no: "03", student_name: "Zainab Ali", attendance: "A" },
  { id: 104, student_id: 104, admission_no: "ADM-1004", roll_no: "04", student_name: "Bilal Tariq", attendance: "P" },
  { id: 105, student_id: 105, admission_no: "ADM-1005", roll_no: "05", student_name: "Hamza Sheikh", attendance: "P" },
];

const ITEMS_PER_PAGE = 10;

const ExamAttendance: React.FC = () => {
  const [filterExam, setFilterExam] = useState("1");
  const [filterClass, setFilterClass] = useState("5");
  const [filterSection, setFilterSection] = useState("2");
  const [filterSubject, setFilterSubject] = useState("3");

  const [committedExam, setCommittedExam] = useState("1");
  const [committedClass, setCommittedClass] = useState("5");
  const [committedSection, setCommittedSection] = useState("2");
  const [committedSubject, setCommittedSubject] = useState("3");

  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: apiData } = useFetchExamAttendances({
    exam_id: committedExam,
    class_id: committedClass,
    section_id: committedSection,
    subject_id: committedSubject,
  });

  const storeAttendanceMutation = useStoreExamAttendance();

  const [students, setStudents] = useState<AttendanceStudentRow[]>(defaultStudents);

  const { data: studentClasses } = useFetchAllStudentClasses();
  const { data: sectionsData } = useFetchAllSections();
  const { data: subjectsData } = useFetchAllSubjects();

  const classOptions = useMemo(() => {
    const raw = Array.isArray(studentClasses?.data) ? studentClasses.data : Array.isArray(studentClasses) ? studentClasses : [];
    if (raw.length === 0) return [{ label: "Class 5", value: "5" }, { label: "Class 6", value: "6" }];
    return raw.map((c: any) => ({ label: c.name || `Class ${c.id}`, value: String(c.id) }));
  }, [studentClasses]);

  const sectionOptions = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data) ? sectionsData.data : Array.isArray(sectionsData) ? sectionsData : [];
    if (raw.length === 0) return [{ label: "Section A", value: "1" }, { label: "Section B", value: "2" }];
    return raw.map((s: any) => ({ label: s.name || `Section ${s.id}`, value: String(s.id) }));
  }, [sectionsData]);

  const subjectOptions = useMemo(() => {
    const raw = Array.isArray(subjectsData?.data) ? subjectsData.data : Array.isArray(subjectsData) ? subjectsData : [];
    if (raw.length === 0) return [{ label: "Physics", value: "3" }, { label: "Chemistry", value: "4" }];
    return raw.map((s: any) => ({ label: s.name || `Subject ${s.id}`, value: String(s.id) }));
  }, [subjectsData]);

  // Sync loaded students from API if available
  React.useEffect(() => {
    if (apiData?.data && Array.isArray(apiData.data) && apiData.data.length > 0) {
      setStudents(
        apiData.data.map((item: any) => ({
          id: item.student_id || item.id,
          student_id: item.student_id || item.id,
          admission_no: item.student?.admission_no || item.admission_no || `ADM-${item.student_id || item.id}`,
          roll_no: item.student?.roll_no || item.roll_no || "-",
          student_name: item.student?.full_name || item.student_name || "Student",
          attendance: item.status === "A" ? "A" : "P",
          note: item.note || "",
          full_data: item,
        }))
      );
    }
  }, [apiData]);

  const handleSearch = () => {
    setCommittedExam(filterExam);
    setCommittedClass(filterClass);
    setCommittedSection(filterSection);
    setCommittedSubject(filterSubject);
    setHasSearched(true);
    setPage(1);
    toast.success("Exam attendance criteria applied");
  };

  const handleReset = () => {
    setFilterExam("1");
    setFilterClass("5");
    setFilterSection("2");
    setFilterSubject("3");
    toast.info("Criteria reset");
  };

  const handleToggleAttendance = (id: number | string, status: "P" | "A") => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendance: status } : s))
    );
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendance: "P" })));
    toast.info("Marked all students as Present");
  };

  const handleSaveAttendance = async () => {
    try {
      const payload = {
        exam_id: Number(committedExam) || 1,
        class_id: Number(committedClass) || 5,
        section_id: Number(committedSection) || 2,
        subject_id: Number(committedSubject) || 3,
        date: new Date().toISOString().split("T")[0],
        attendances: students.map((s) => ({
          student_id: Number(s.student_id || s.id),
          status: s.attendance,
          note: s.note || "",
        })),
      };

      await storeAttendanceMutation.mutateAsync(payload);
      toast.success("Exam attendance saved successfully via /api/exam-attendances");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save exam attendance");
    }
  };

  const columns: Column[] = [
    { key: "admission_no", title: "Admission No" },
    { key: "roll_no", title: "Roll No" },
    { key: "student_name", title: "Student Name" },
    { key: "attendance_status", title: "Attendance Status" },
  ];

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const q = searchTerm.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.admission_no.toLowerCase().includes(q) ||
        s.roll_no.toLowerCase().includes(q)
    );
  }, [students, searchTerm]);

  const tableData = useMemo(() => {
    const paginated = filteredStudents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return paginated.map((s) => ({
      id: s.id,
      admission_no: s.admission_no,
      roll_no: s.roll_no,
      student_name: s.student_name,
      attendance_status: (
        <div style={{ display: "inline-flex", gap: "14px", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: s.attendance === "P" ? "#16a34a" : "#64748b", fontWeight: 500 }}>
            <input
              type="radio"
              name={`att_${s.id}`}
              checked={s.attendance === "P"}
              onChange={() => handleToggleAttendance(s.id, "P")}
            />
            Present
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: s.attendance === "A" ? "#ef4444" : "#64748b", fontWeight: 500 }}>
            <input
              type="radio"
              name={`att_${s.id}`}
              checked={s.attendance === "A"}
              onChange={() => handleToggleAttendance(s.id, "A")}
            />
            Absent
          </label>
        </div>
      ),
      full_data: s,
    }));
  }, [filteredStudents, page]);

  return (
    <div className="page_wrapper">
      <div className="exam_attendance_page">
        {/* 1. Select Criteria TableWrapper */}
        <TableWrapper
          title="Select Criteria"
          isAddButton
          addButtonTitle="Attendance Create"
          onClick={() => {
            setHasSearched(true);
            toast.info("Ready to record attendance");
          }}
        >
          <div className="search_screen">
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    label="Exam"
                    options={[
                      { label: "First Term", value: "1" },
                      { label: "Second Term", value: "2" },
                      { label: "Third Term", value: "3" },
                    ]}
                    value={filterExam}
                    onChange={(v: any) => setFilterExam(v)}
                  />
                  <CustomSelect
                    label="Class"
                    options={classOptions}
                    value={filterClass}
                    onChange={(v: any) => setFilterClass(v)}
                  />
                </div>
                <div className="body_section">
                  <CustomSelect
                    label="Section"
                    options={sectionOptions}
                    value={filterSection}
                    onChange={(v: any) => setFilterSection(v)}
                  />
                  <CustomSelect
                    label="Subject"
                    options={subjectOptions}
                    value={filterSubject}
                    onChange={(v: any) => setFilterSubject(v)}
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

        {/* 2. Attendance List TableWrapper & DataTable */}
        {hasSearched && (
          <TableWrapper
            title={`Exam Attendance | Exam ${committedExam} - Class ${committedClass} (${committedSection})`}
            isSearchBar
            searchValue={searchTerm}
            searchOnchange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          >
            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <SecondaryButton
                title="Mark All Present"
                onClick={handleMarkAllPresent}
              />
              <PrimaryButton
                title={storeAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
                icon={<Save size={16} />}
                onClick={handleSaveAttendance}
                disabled={storeAttendanceMutation.isPending}
              />
            </div>

            <DataTable
              columns={columns}
              data={tableData}
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE))}
              onPageChange={(p) => setPage(p)}
            />
          </TableWrapper>
        )}
      </div>
    </div>
  );
};

export default ExamAttendance;
