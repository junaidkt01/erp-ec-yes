import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass";
import { useFetchAllSections } from "../../../hooks/useSections";
import { useFetchAllSubjects } from "../../../hooks/useSubject";
import {
  useFetchExamMarks,
  useStoreExamMarks,
} from "../../../hooks/useExamination";

interface MarkEntryRow {
  id: number | string;
  student_id: number | string;
  admission_no: string;
  roll_no: string;
  student_name: string;
  written: number | string;
  practical: number | string;
  viva: number | string;
  total: number;
  grade: string;
  gpa: number;
  is_absent: boolean;
  remarks: string;
  full_data?: any;
}

const defaultStudents: MarkEntryRow[] = [
  { id: 101, student_id: 101, admission_no: "ADM-1001", roll_no: "01", student_name: "Ahmad Farooq", written: 45, practical: 20, viva: 22, total: 87, grade: "A+", gpa: 5, is_absent: false, remarks: "Good performance" },
  { id: 102, student_id: 102, admission_no: "ADM-1002", roll_no: "02", student_name: "Fatima Noor", written: 40, practical: 18, viva: 20, total: 78, grade: "A", gpa: 4, is_absent: false, remarks: "Very Good" },
  { id: 103, student_id: 103, admission_no: "ADM-1003", roll_no: "03", student_name: "Zainab Ali", written: 35, practical: 15, viva: 15, total: 65, grade: "B", gpa: 3.5, is_absent: false, remarks: "Satisfactory" },
  { id: 104, student_id: 104, admission_no: "ADM-1004", roll_no: "04", student_name: "Bilal Tariq", written: 30, practical: 12, viva: 14, total: 56, grade: "C", gpa: 3, is_absent: false, remarks: "Needs improvement" },
  { id: 105, student_id: 105, admission_no: "ADM-1005", roll_no: "05", student_name: "Hamza Sheikh", written: 48, practical: 20, viva: 24, total: 92, grade: "A+", gpa: 5, is_absent: false, remarks: "Outstanding" },
];

const calculateGradeAndGpa = (total: number) => {
  if (total >= 80) return { grade: "A+", gpa: 5 };
  if (total >= 70) return { grade: "A", gpa: 4 };
  if (total >= 60) return { grade: "B", gpa: 3.5 };
  if (total >= 50) return { grade: "C", gpa: 3 };
  if (total >= 40) return { grade: "D", gpa: 2 };
  return { grade: "F", gpa: 0 };
};

const ITEMS_PER_PAGE = 10;

const MarkRegister: React.FC = () => {
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

  const { data: apiData } = useFetchExamMarks({
    exam_id: committedExam,
    class_id: committedClass,
    section_id: committedSection,
    subject_id: committedSubject,
  });

  const storeMarksMutation = useStoreExamMarks();

  const [entries, setEntries] = useState<MarkEntryRow[]>(defaultStudents);

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

  // Sync API data if available
  React.useEffect(() => {
    if (apiData?.data && Array.isArray(apiData.data) && apiData.data.length > 0) {
      setEntries(
        apiData.data.map((item: any) => {
          const written = Number(item.marks_distribution?.Written || item.written || 0);
          const practical = Number(item.marks_distribution?.Practical || item.practical || 0);
          const viva = Number(item.marks_distribution?.Viva || item.viva || 0);
          const total = item.total_marks !== undefined ? Number(item.total_marks) : written + practical + viva;
          const { grade, gpa } = calculateGradeAndGpa(total);

          return {
            id: item.student_id || item.id,
            student_id: item.student_id || item.id,
            admission_no: item.student?.admission_no || item.admission_no || `ADM-${item.student_id || item.id}`,
            roll_no: item.student?.roll_no || item.roll_no || "-",
            student_name: item.student?.full_name || item.student_name || "Student",
            written,
            practical,
            viva,
            total,
            grade: item.grade || grade,
            gpa: item.gpa !== undefined ? Number(item.gpa) : gpa,
            is_absent: Boolean(item.is_absent),
            remarks: item.remarks || "",
            full_data: item,
          };
        })
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
    toast.success("Mark register criteria applied");
  };

  const handleReset = () => {
    setFilterExam("1");
    setFilterClass("5");
    setFilterSection("2");
    setFilterSubject("3");
    toast.info("Criteria reset");
  };

  const handleMarkChange = (id: number | string, field: "written" | "practical" | "viva", value: string) => {
    setEntries((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          const w = Number(updated.written) || 0;
          const p = Number(updated.practical) || 0;
          const v = Number(updated.viva) || 0;
          const total = w + p + v;
          const { grade, gpa } = calculateGradeAndGpa(total);
          updated.total = total;
          updated.grade = grade;
          updated.gpa = gpa;
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveMarks = async () => {
    try {
      const payload = {
        exam_id: Number(committedExam) || 1,
        class_id: Number(committedClass) || 5,
        section_id: Number(committedSection) || 2,
        subject_id: Number(committedSubject) || 3,
        exam_setup_id: 1,
        marks: entries.map((e) => ({
          student_id: Number(e.student_id || e.id),
          marks_distribution: {
            Written: Number(e.written) || 0,
            Practical: Number(e.practical) || 0,
            Viva: Number(e.viva) || 0,
          },
          total_marks: e.total,
          grade: e.grade,
          gpa: e.gpa,
          is_absent: e.is_absent,
          remarks: e.remarks || "Performance recorded",
        })),
      };

      await storeMarksMutation.mutateAsync(payload);
      toast.success("Exam marks saved successfully via /api/exam-marks");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save marks");
    }
  };

  const columns: Column[] = [
    { key: "admission_no", title: "Admission No" },
    { key: "roll_no", title: "Roll No" },
    { key: "student_name", title: "Student Name" },
    { key: "written", title: "Written (50)" },
    { key: "practical", title: "Practical (25)" },
    { key: "viva", title: "Viva (25)" },
    { key: "total", title: "Total (100)" },
    { key: "grade_gpa", title: "Grade / GPA" },
  ];

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;
    const q = searchTerm.trim().toLowerCase();
    return entries.filter(
      (e) =>
        e.student_name.toLowerCase().includes(q) ||
        e.admission_no.toLowerCase().includes(q) ||
        e.roll_no.toLowerCase().includes(q)
    );
  }, [entries, searchTerm]);

  const tableData = useMemo(() => {
    const paginated = filteredEntries.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return paginated.map((item) => ({
      id: item.id,
      admission_no: item.admission_no,
      roll_no: item.roll_no,
      student_name: item.student_name,
      written: (
        <div style={{ maxWidth: "100px" }}>
          <InputField
            type="number"
            placeHolder="Written"
            value={item.written}
            onChange={(e: any) => handleMarkChange(item.id, "written", e?.target?.value || e)}
          />
        </div>
      ),
      practical: (
        <div style={{ maxWidth: "100px" }}>
          <InputField
            type="number"
            placeHolder="Practical"
            value={item.practical}
            onChange={(e: any) => handleMarkChange(item.id, "practical", e?.target?.value || e)}
          />
        </div>
      ),
      viva: (
        <div style={{ maxWidth: "100px" }}>
          <InputField
            type="number"
            placeHolder="Viva"
            value={item.viva}
            onChange={(e: any) => handleMarkChange(item.id, "viva", e?.target?.value || e)}
          />
        </div>
      ),
      total: (
        <span style={{ fontWeight: 600, color: "#605dec" }}>
          {item.total}
        </span>
      ),
      grade_gpa: (
        <span style={{ fontWeight: 500, color: "#1e293b" }}>
          {item.grade} ({item.gpa})
        </span>
      ),
      full_data: item,
    }));
  }, [filteredEntries, page]);

  return (
    <div className="page_wrapper">
      <div className="mark_register_page">
        {/* 1. Select Criteria TableWrapper */}
        <TableWrapper
          title="Select Criteria"
          isAddButton
          addButtonTitle="Add Marks"
          onClick={() => {
            setHasSearched(true);
            toast.info("Ready to enter marks");
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

        {/* 2. Marks Entry TableWrapper & DataTable */}
        {hasSearched && (
          <TableWrapper
            title={`Mark Register | Exam ${committedExam} - Class ${committedClass} (${committedSection})`}
            isSearchBar
            searchValue={searchTerm}
            searchOnchange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <PrimaryButton
                title={storeMarksMutation.isPending ? "Saving..." : "Save Marks"}
                icon={<Save size={16} />}
                onClick={handleSaveMarks}
                disabled={storeMarksMutation.isPending}
              />
            </div>

            <DataTable
              columns={columns}
              data={tableData}
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE))}
              onPageChange={(p) => setPage(p)}
            />
          </TableWrapper>
        )}
      </div>
    </div>
  );
};

export default MarkRegister;
