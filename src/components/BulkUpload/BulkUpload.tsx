import { useState } from "react";
import * as XLSX from "xlsx";
import "./BulkUpload.scss";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import InputFiles from "../InputFields/InputFiles";
import { useBulkAddStudents } from "../../hooks/useStudent";
import { CustomSelect } from "../InputFields/CustomSelect";
import DataTable, { type Column } from "../DataTable/DataTable";
import { useFetchAllAcademicYears } from "../../hooks/useAcademicYear";
import { useFetchAllStudentClasses } from "../../hooks/useStudentClass";
import { useFetchAllSections } from "../../hooks/useSections";
import InputCheckbox from "../InputCheckbox/InputCheckbox";
import { toast } from "sonner";
import { BLOOD_GROUP_OPTIONS, formatOptionInstruction, GENDER_OPTIONS, GUARDIAN_RELATION_OPTIONS, RELIGION_OPTIONS } from "../../utils/studentOptions";
import { useTranslation } from "../../i18n/LanguageContext";

const systemFields = [
    "sl",
    "student_code",
    "admission_no",
    "admission_date",
    "roll_no",
    "full_name",
    "dob",
    "gender",
    "religion",
    "caste",
    "blood_group",
    "nationality",
    "class_id",
    "section_id",
    "category_id",
    "address",
    "current_address",
    "permanent_address",
    "national_id_no",
    "birth_certificate_no",
    "apaar_id",
    "aadharshila_no",
    "pen_no",
    "previous_school_name",
    "note",
    "father_name",
    "father_phone",
    "father_email",
    "father_occupation",
    "mother_name",
    "mother_phone",
    "mother_email",
    "mother_occupation",
    "guardian_name",
    "guardian_phone",
    "guardian_email",
    "guardian_occupation",
    "guardian_relation",
    "guardian_address"
];

const importInstructions = [
    "Your CSV/Excel data should be in the format of the downloaded file. The first line should be column headers as in the example table. Ensure the file is UTF-8 encoded to avoid encoding issues.",
    "If any column is a date field, format it as Y-m-d (e.g., 2018-06-06).",
    'Duplicate "Roll Number" (must be unique within a section) rows will not be imported. You can verify usage from the student report by searching Class & Section.',
    'Duplicate "Guardian Email & Guardian Phone" rows will not be imported. You can verify usage from the student report by searching Class & Section.',
    `For student "Gender", use values: ${formatOptionInstruction(GENDER_OPTIONS, true)}.`,
    `For student "Blood Group", use values: ${formatOptionInstruction(BLOOD_GROUP_OPTIONS, false)}.`,
    `For student "Religion", use values: ${formatOptionInstruction(RELIGION_OPTIONS, false)}.`,
    `For guardian relation, use: ${formatOptionInstruction(GUARDIAN_RELATION_OPTIONS, true)}.`,
    "Please follow the date format (e.g., 2020-06-15) for both Date of Birth and Admission Date."
];

const normalize = (str: string) =>
    str.toLowerCase().replace(/[\s_\-()]/g, "");

const synonyms: Record<string, string[]> = {
    first_name: ["fname", "first", "givenname", "firstname", "first name"],
    last_name: ["lname", "surname", "lastname", "last name"],
    full_name: ["fullname", "name", "student name"],
    father_name: ["fathername", "father's name", "father"],
    mother_name: ["mothername", "mother's name", "mother"],
    guardian_name: ["guardianname", "guardian's name"],
    dob: ["dateofbirth", "birthdate", "date of birth"],
    admission_no: ["admissionnumber", "admno", "admission no", "adm_no", "admission #"],
    roll_no: ["rollnumber", "rollno", "roll no", "roll #"],
    national_id_no: ["adhaarno", "aadhar_number", "aadhaar", "national id"],
    father_phone: ["fatherphone", "father mobile", "father contact"],
    mother_phone: ["motherphone", "mother mobile"],
    gender: ["sex"],
    email: ["mail"],
};

const similarity = (a: string, b: string) => {
    let matches = 0;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
        if (a[i] === b[i]) matches++;
    }
    return matches / len;
};

const smartAutoMap = (headers: string[], fields: string[]) => {
    const result: any = {};

    fields.forEach((field) => {
        const normField = normalize(field);

        let bestMatch = "";
        let bestScore = 0;

        headers.forEach((header) => {
            const normHeader = normalize(header);

            if (normHeader === normField) {
                bestMatch = header;
                bestScore = 1;
                return;
            }

            if (synonyms[field]?.some((s) => normalize(s) === normHeader)) {
                bestMatch = header;
                bestScore = 0.95;
            }

            const score = similarity(normField, normHeader);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = header;
            }
        });

        if (bestScore > 0.6) {
            result[field] = { column: bestMatch, confidence: bestScore };
        }
    });

    return result;
};

const BulkUpload = ({ onClick }: { onClick: () => void }) => {
    const { t } = useTranslation();
    const steps = [t("bulk.step_upload", "Upload"), t("bulk.step_map", "Map Data"), t("bulk.step_import", "Import")];

    const [step, setStep] = useState(1);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawData, setRawData] = useState<any[]>([]);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [mapping, setMapping] = useState<any>({});
    const [finalData, setFinalData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const [academicYear, setAcademicYear] = useState<any>(null);
    const [classId, setClassId] = useState<any>(null);
    const [sectionId, setSectionId] = useState<any>(null);

    const { mutate, isPending } = useBulkAddStudents();

    const { data: academicYears } = useFetchAllAcademicYears();
    const formattedData = academicYears?.map((item) => ({
        label: `${item.name} (${new Date(item.start_date).toLocaleString("default", { month: "short" })} - ${new Date(item.end_date).toLocaleString("default", { month: "short" })})`,
        value: item.id,
    }));

    const { data: studentClasses } = useFetchAllStudentClasses();
    const classOptions = studentClasses?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    const { data: sections } = useFetchAllSections();
    const sectionOptions = sections?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    const handleDownloadSampleExcel = () => {
        const headers = systemFields;
        const sampleRow: Record<string, string> = {
            sl: "1",
            student_code: "STU001",
            admission_no: "ADM2026001",
            admission_date: "2026-06-01",
            roll_no: "1",
            full_name: "John Doe",
            dob: "2015-05-20",
            gender: "Male",
            religion: "Christian",
            caste: "General",
            blood_group: "O+",
            nationality: "American",
            father_name: "Michael Doe",
            father_phone: "9876543210",
            father_email: "michael@example.com",
            father_occupation: "Engineer",
            mother_name: "Sarah Doe",
            mother_phone: "9876543211",
            mother_email: "sarah@example.com",
            mother_occupation: "Teacher",
            current_address: "123 Main Street",
            permanent_address: "123 Main Street",
            national_id_no: "123456789012",
        };

        const worksheet = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students_Template");
        XLSX.writeFile(workbook, "Sample_Student_Import_Template.xlsx");
    };

    const handleFile = (file: File) => {
        if (!file) return;

        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];
        const allowedExtensions = [".xlsx", ".xls"];
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

        if (
            !allowedTypes.includes(file.type) &&
            !allowedExtensions.includes(extension)
        ) {
            toast.error("Please upload a valid Excel file (.xls or .xlsx).");
            return;
        }

        setUploadedFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: "array" });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json(sheet);

                if (!json.length) {
                    toast.error("The uploaded Excel file contains no data.");
                    return;
                }

                const hdrs = Object.keys(json[0]);

                setHeaders(hdrs);
                setRawData(json);

                const auto = smartAutoMap(hdrs, systemFields);
                setMapping(auto);
                toast.success(`Loaded ${json.length} records from ${file.name}`);
            } catch (err) {
                console.error("Error reading Excel file:", err);
                toast.error("Failed to parse the Excel file.");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const excelDate = (val: any) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "number") {
            return new Date((val - 25569) * 86400 * 1000)
                .toISOString()
                .split("T")[0];
        }
        return String(val);
    };

    const genderMap = (g: any) => {
        if (!g) return "male";
        const v = String(g).toLowerCase();
        if (v === "1" || v === "male" || v === "m") return "male";
        if (v === "2" || v === "female" || v === "f") return "female";
        return "other";
    };

    const generateData = () => {
        const mapped = rawData.map((row, i) => {
            const get = (f: string) => row[mapping[f]?.column];

            return {
                _index: i,
                sl: i + 1,

                student_code: get("student_code"),
                admission_no: String(get("admission_no") ?? ""),
                admission_date: excelDate(get("admission_date")),
                roll_no: String(get("roll_no") ?? ""),

                full_name: get("full_name") || `Student ${i + 1}`,
                dob: excelDate(get("dob")),
                gender: genderMap(get("gender")),
                religion: get("religion"),
                caste: get("caste"),
                blood_group: get("blood_group"),

                nationality: get("nationality"),
                category_id: get("category_id"),
                class_id: classId || get("class_id"),
                section_id: sectionId || get("section_id"),
                academic_year_id: academicYear,

                address: get("address"),
                current_address: get("current_address"),
                permanent_address: get("permanent_address"),

                national_id_no: String(get("national_id_no") ?? ""),
                birth_certificate_no: String(get("birth_certificate_no") ?? ""),
                apaar_id: String(get("apaar_id") ?? ""),
                aadharshila_no: String(get("aadharshila_no") ?? ""),
                pen_no: String(get("pen_no") ?? ""),

                previous_school_name: get("previous_school_name"),
                note: get("note"),

                father_name: get("father_name"),
                father_phone: String(get("father_phone") ?? ""),
                father_email: get("father_email"),
                father_occupation: get("father_occupation"),

                mother_name: get("mother_name"),
                mother_phone: String(get("mother_phone") ?? ""),
                mother_email: get("mother_email"),
                mother_occupation: get("mother_occupation"),

                guardian_name: get("guardian_name"),
                guardian_phone: String(get("guardian_phone") ?? ""),
                guardian_email: get("guardian_email"),
                guardian_occupation: get("guardian_occupation"),
                guardian_relation: get("guardian_relation"),
                guardian_address: get("guardian_address"),
            };
        });

        setFinalData(mapped);
        setSelectedRows(mapped.map((_, i) => i));
    };

    const handleStep1Next = () => {
        if (!academicYear) {
            toast.error("Please select an Academic Year.");
            return;
        }
        if (!classId) {
            toast.error("Please select a Class.");
            return;
        }
        if (!sectionId) {
            toast.error("Please select a Section.");
            return;
        }
        if (!uploadedFileName || rawData.length === 0) {
            toast.error("Please upload an Excel file with student data.");
            return;
        }
        setStep(2);
    };

    const handleSubmit = () => {
        const selected = finalData
            .filter((r) => selectedRows.includes(r._index))
            .map((item) => ({
                ...item,
                academic_year_id: academicYear,
                class_id: classId,
                section_id: sectionId,
            }));

        if (selected.length === 0) {
            toast.error("Please select at least one student row to import.");
            return;
        }

        mutate({ students: selected }, {
            onSuccess: () => {
                toast.success(`${selected.length} students uploaded successfully`);
                onClick();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Error uploading students");
            }
        });
    };

    const columns: Column[] = [
        { key: "roll_no", title: t("field.roll_no", "Roll No") },
        { key: "admission_no", title: t("field.admission_no", "Admission No") },
        { key: "full_name", title: t("field.full_name", "Full Name") },
        { key: "student_code", title: t("field.student_code", "Student ID") },
        { key: "gender", title: t("field.gender", "Gender") },
        { key: "dob", title: t("field.dob", "Date of Birth") },
        { key: "admission_date", title: t("field.admission_date", "Admission Date") },
        { key: "father_name", title: t("field.father_name", "Father Name") },
        { key: "father_phone", title: t("field.father_phone", "Father Phone") },
        { key: "mother_name", title: t("field.mother_name", "Mother Name") },
        { key: "mother_phone", title: t("field.mother_phone", "Mother Phone") },
        { key: "national_id_no", title: t("field.adhaar_no", "Adhaar No") },
        { key: "aadharshila_no", title: t("field.aadharshila_no", "Aadharshila No") },
        { key: "pen_no", title: t("field.pen_no", "PEN No") },
        { key: "apaar_id", title: t("field.apaar_id", "APAAR ID") },
        { key: "religion", title: t("field.religion", "Religion") },
        { key: "caste", title: t("field.caste", "Caste") },
        { key: "blood_group", title: t("field.blood_group", "Blood Group") },
        { key: "current_address", title: t("field.current_address", "Current Address") },
        { key: "permanent_address", title: t("field.permanent_address", "Permanent Address") },
    ];

    const toggleSelectAll = () => {
        if (selectedRows.length === finalData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(finalData.map((r) => r._index));
        }
    };

    return (
        <div className="bulk_upload">
            <div className="stepper">
                {steps.map((label, i) => {
                    const stepNum = i + 1;
                    const isDone = stepNum < step;
                    const isActive = stepNum === step;

                    return (
                        <div key={i} className="step-wrap">
                            <div className={`step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                                <span className="num">
                                    {isDone ? "✓" : stepNum}
                                </span>
                                {label}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`connector ${isDone ? "done" : ""}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
                <div className="step1_container">
                    <div className="instructions_card">
                        <h3 className="instruction_title">{t("bulk.import_instruction", "Import Instruction")}</h3>
                        <ul className="instruction_list">
                            {importInstructions.map((text, idx) => (
                                <li key={idx}>{text}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="fields_grid">
                        <CustomSelect
                            value={academicYear}
                            name="academic_year_id"
                            label={t("field.academic_year", "Academic Year")}
                            placeholder="Select academic year"
                            options={formattedData || []}
                            onChange={setAcademicYear}
                        />
                        <CustomSelect
                            value={classId}
                            label={t("field.class", "Class")}
                            placeholder="Select class"
                            options={classOptions || []}
                            onChange={setClassId}
                        />
                        <CustomSelect
                            value={sectionId}
                            name="section_id"
                            label={t("field.section", "Section")}
                            placeholder="Select section"
                            options={sectionOptions || []}
                            onChange={setSectionId}
                        />
                    </div>

                    <div className="upload_drop_zone">
                        <InputFiles
                            accept=".xlsx,.xls"
                            onChange={(e: any) => handleFile(e.target.files[0])}
                        />
                    </div>

                    <div className="buttons">
                        <SecondaryButton title={t("bulk.download_sample", "Download Sample Student Excel")} onClick={handleDownloadSampleExcel} />
                        <SecondaryButton title={t("action.cancel", "Cancel")} onClick={() => onClick()} />
                        <PrimaryButton disabled={!academicYear || !classId || !sectionId || !uploadedFileName} title={t("action.next", "Next")} onClick={handleStep1Next} />
                    </div>
                </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <div className="mapping_container">
                    <div className="mapping_header">
                        <h3>{t("bulk.map_columns", "Map Columns")}</h3>
                        <p>Match the Excel file columns with system fields before importing.</p>
                    </div>

                    {systemFields.map((field) => {
                        const mapped = mapping[field];

                        return (
                            <div className="mapping_row" key={field}>
                                <div className="left">{field}</div>

                                <div className="right">
                                    <select
                                        value={mapped?.column || ""}
                                        onChange={(e) =>
                                            setMapping((prev: any) => ({
                                                ...prev,
                                                [field]: {
                                                    column: e.target.value,
                                                    confidence: 1,
                                                },
                                            }))
                                        }
                                    >
                                        <option value="">Select</option>
                                        {headers.map((h) => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>

                                    {mapped && (
                                        <span
                                            className={`confidence ${mapped.confidence > 0.9
                                                ? "high"
                                                : mapped.confidence > 0.75
                                                    ? "medium"
                                                    : "low"
                                                }`}
                                        >
                                            {Math.round(mapped.confidence * 100)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <div className="buttons">
                        <SecondaryButton title={t("action.previous", "Previous")} onClick={() => setStep(1)} />
                        <PrimaryButton
                            title={t("action.next", "Next")}
                            onClick={() => {
                                generateData();
                                setStep(3);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <div className="step3_container">
                    <div className="preview_toolbar">
                        <div className="selection_info">
                            <span className="badge">
                                Selected {selectedRows.length} of {finalData.length} students
                            </span>
                        </div>
                        <button
                            type="button"
                            className="select_all_btn"
                            onClick={toggleSelectAll}
                        >
                            {selectedRows.length === finalData.length ? t("action.deselect_all", "Deselect All") : t("action.select_all", "Select All")}
                        </button>
                    </div>

                    <div className="preview">
                        <DataTable
                            columns={columns}
                            data={finalData}
                            currentPage={0}
                            totalPages={0}
                            onPageChange={(p) => console.log(p)}
                            actions={(row) => (
                                <div className="actions">
                                    <InputCheckbox
                                        key={row._index}
                                        checked={selectedRows.includes(row._index)}
                                        onChange={() => setSelectedRows((prev) => {
                                            const exists = prev.includes(row._index);
                                            if (exists) {
                                                return prev.filter((i) => i !== row._index);
                                            }
                                            return [...prev, row._index];
                                        })}
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <div className="buttons">
                        <SecondaryButton title={t("action.previous", "Previous")} onClick={() => setStep(2)} />
                        <PrimaryButton
                            title={isPending ? t("action.importing", "Importing...") : t("action.import", "Import")}
                            disabled={isPending || selectedRows.length === 0}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkUpload;