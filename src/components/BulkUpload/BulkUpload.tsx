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

const steps = ["Upload", "Map Data", "Import"];

const systemFields = [
    "session",
    "admission_number",
    "roll_no",
    "first_name",
    "last_name",
    "date_of_birth",
    "gender",
    "caste",
    "mobile",
    "email",
    "addmission_date",
    "blood_group",
    "height",
    "weight",
    "father_name",
    "father_phone",
    "father_occupation",
    "mother_name",
    "mother_phone",
    "mother_occupation",
    "guardian_name",
    "guardian_relation",
    "guardian_email",
    "guardian_phone",
    "guardian_occupation",
    "current_address",
    "bank_account_no",
    "bank_name",
    "national_identification_no",
    "previous_school_details",
    "note",
    "religion"
];

const normalize = (str: string) =>
    str.toLowerCase().replace(/[\s_\-()]/g, "");

const synonyms: Record<string, string[]> = {
    first_name: ["fname", "first", "givenname"],
    last_name: ["lname", "surname"],
    email: ["mail"],
    mobile: ["phone", "contact"],
    gender: ["sex"],
    date_of_birth: ["dob", "birthdate"],
    admission_number: ["admissionno", "admno"],
    bank_name: ["bank_name"]
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

const BulkUpload = () => {
    const [step, setStep] = useState(1);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawData, setRawData] = useState<any[]>([]);
    const [mapping, setMapping] = useState<any>({});
    const [finalData, setFinalData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    console.log("finalData: ", finalData)

    const { mutate, isPending } = useBulkAddStudents();

    // Upload + Parse
    const handleFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e: any) => {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const json: any = XLSX.utils.sheet_to_json(sheet);

            if (!json.length) return;

            const hdrs = Object.keys(json[0]);

            setHeaders(hdrs);
            setRawData(json);

            const auto = smartAutoMap(hdrs, systemFields);
            setMapping(auto);
        };

        reader.readAsArrayBuffer(file);
    };

    const excelDate = (val: any) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        return new Date((val - 25569) * 86400 * 1000)
            .toISOString()
            .split("T")[0];
    };

    const genderMap = (g: any) => {
        const v = String(g).toLowerCase();
        if (v === "1" || v === "male") return "male";
        if (v === "2" || v === "female") return "female";
        return "other";
    };

    const generateData = () => {
        const mapped = rawData.map((row, i) => {
            const get = (f: string) => row[mapping[f]?.column];

            return {
                sl: i + 1, // Usually 1-indexed for UI display
                session: get("session"),
                admission_no: String(get("admission_number") ?? ""),
                roll_no: String(get("roll_no") ?? ""),
                first_name: get("first_name"),
                last_name: get("last_name"),
                dob: excelDate(get("date_of_birth")),
                gender: genderMap(get("gender")),
                caste: get("caste"),
                mobile: String(get("mobile") ?? ""),
                email: get("email"),
                admission_date: excelDate(get("addmission_date")), // Matching your 'addmission' typo
                blood_group: get("blood_group"),
                height: get("height"),
                weight: get("weight"),
                father_name: get("father_name"),
                father_phone: String(get("father_phone") ?? ""),
                father_occupation: get("father_occupation"),
                mother_name: get("mother_name"),
                mother_phone: String(get("mother_phone") ?? ""),
                mother_occupation: get("mother_occupation"),
                guardian_name: get("guardian_name"),
                guardian_relation: get("guardian_relation"),
                guardian_email: get("guardian_email"),
                guardian_phone: String(get("guardian_phone") ?? ""),
                guardian_occupation: get("guardian_occupation"),
                current_address: get("current_address"),
                bank_account_no: String(get("bank_account_no") ?? ""),
                bank_name: get("bank_name"),
                national_identification_no: String(get("national_identification_no") ?? ""),
                previous_school_details: get("previous_school_details"),
                note: get("note"),
                religion: get("religion")
            };
        });

        setFinalData(mapped);
        setSelectedRows(mapped.map((_, i) => i));
    };

    const [academicYear, setAcademicYear] = useState<any>(null);
    const [classId, setClassId] = useState<any>(null);
    const [sectionId, setSectionId] = useState<any>(null);

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

    const handleSubmit = () => {
        const selected = finalData
            .filter((r) => selectedRows.includes(r._index))
            .map((item) => ({
                ...item,
                // email: `${item.first_name.toLowerCase()}.${i + 111}@example.com`,
                // admission_no: i + 111,
                email: item.email,
                admission_no: item.admission_no,
                academic_year_id: academicYear,
                class_id: classId,
                section_id: sectionId,
            }));

        console.log("selected: ", selected);

        mutate({ students: selected }, {
            onSuccess: () => {
                toast('Students upload successfully')
            }, onError: () => {
                toast('Error uploading students')
            }
        });
    };

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "session", title: "Session" },
        { key: "admission_number", title: "Admission Number" },
        { key: "roll_no", title: "Roll No" },
        { key: "first_name", title: "First Name" },
        { key: "last_name", title: "Last Name" },
        { key: "date_of_birth", title: "Date Of Birth" },
        { key: "gender", title: "Gender" },
        { key: "caste", title: "Caste" },
        { key: "religion", title: "Religion" },
        { key: "mobile", title: "Mobile" },
        { key: "email", title: "Email" },
        { key: "addmission_date", title: "Admission Date" },
        { key: "blood_group", title: "Blood Group" },
        { key: "height", title: "Height" },
        { key: "weight", title: "Weight" },
        { key: "father_name", title: "Father Name" },
        { key: "father_phone", title: "Father Phone" },
        { key: "father_occupation", title: "Father Occupation" },
        { key: "mother_name", title: "Mother Name" },
        { key: "mother_phone", title: "Mother Phone" },
        { key: "mother_occupation", title: "Mother Occupation" },
        { key: "guardian_name", title: "Guardian Name" },
        { key: "guardian_relation", title: "Guardian Relation" },
        { key: "guardian_email", title: "Guardian Email" },
        { key: "guardian_phone", title: "Guardian Phone" },
        { key: "guardian_occupation", title: "Guardian Occupation" },
        { key: "current_address", title: "Current Address" },
        { key: "bank_account_no", title: "Bank Account No" },
        { key: "bank_name", title: "Bank Name" },
        { key: "national_identification_no", title: "National Identification No" },
        { key: "previous_school_details", title: "Previous School Details" },
        { key: "note", title: "Note" }
    ];

    return (
        <div className="bulk_upload" >
            <div className="stepper" >
                {steps.map((label, i) => {
                    const stepNum = i + 1;
                    const isDone = stepNum < step;
                    const isActive = stepNum === step;

                    return (
                        <div key={i} className="step-wrap">
                            <div
                                className={`step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                            >
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
                <>
                    <div className="popup_body" >
                        <div className="fields_wrapper" >

                            <div className="body_section">
                                <CustomSelect value={academicYear} name="academic_year_id" label="Academic year" placeholder="Select year" options={formattedData || []} onChange={setAcademicYear} />
                                <CustomSelect value={classId} label="Class" placeholder="Select class" options={classOptions || []} onChange={setClassId} />
                                <CustomSelect value={sectionId} name="section_id" label="Section" placeholder="Select section" options={sectionOptions || []} onChange={setSectionId} />
                            </div>

                            <div className="body_section">
                                <InputFiles onChange={(e: any) => handleFile(e.target.files[0])} />
                            </div>
                        </div>
                    </div>

                    <div className="buttons">
                        <PrimaryButton title="Next" onClick={() => setStep(2)} />
                    </div>
                </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <div className="mapping_container">
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
                                            <option key={h}>{h}</option>
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
                        <SecondaryButton title="Previous" onClick={() => setStep(1)} />
                        <PrimaryButton
                            title="Next"
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

                    <div className="buttons">
                        <SecondaryButton title="Previous" onClick={() => setStep(2)} />
                        <PrimaryButton
                            title={isPending ? "Importing..." : "Import"}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkUpload;


// import { useState } from "react";
// import * as XLSX from "xlsx";
// import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
// import { CustomSelect } from "../InputFields/CustomSelect";
// import InputFiles from "../InputFields/InputFiles";
// import "./BulkUpload.scss";
// import { useBulkAddStudents } from "../../hooks/useStudent";
// import DataTable, { type Column } from "../DataTable/DataTable";

// interface StudentRow {
//     admission_no?: string;
//     roll_no?: string;
//     first_name?: string;
//     last_name?: string;
//     email?: string;
//     class_id?: number;
//     section_id?: number;
//     academic_year_id?: number;
//     dob?: string;
//     gender?: string;
//     phone?: string;
// }

// const BulkUpload = () => {
//     const [file, setFile] = useState<File | null>(null);
//     const [parsedData, setParsedData] = useState<StudentRow[]>([]);
//     const [academicYear, setAcademicYear] = useState<any>(null);
//     const [classId, setClassId] = useState<any>(null);
//     const [sectionId, setSectionId] = useState<any>(null);

//     console.log("file: ", file)

//     const { mutate, isPending } = useBulkAddStudents();

//     const options = [
//         { label: "1", value: 1 },
//         { label: "2", value: 2 },
//     ];



//     const mapGender = (val: any) => {
//         if (val === 1 || val === "1") return "male";
//         if (val === 2 || val === "2") return "female";
//         return "other";
//     };
//     const excelDateToJSDate = (serial: number) => {
//         const utc_days = Math.floor(serial - 25569);
//         const utc_value = utc_days * 86400;
//         const date = new Date(utc_value * 1000);

//         return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
//     };

//     const handleFileChange = (file: File) => {
//         setFile(file);

//         const reader = new FileReader();

//         reader.onload = (e: any) => {
//             const data = new Uint8Array(e.target.result);
//             const workbook = XLSX.read(data, { type: "array" });

//             const sheet = workbook.Sheets[workbook.SheetNames[0]];
//             const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

//             console.log("Parsed Excel:", jsonData);

//             const mapped = jsonData.map((row) => ({
//                 session: String(row["session"]),
//                 admission_no: String(row["admission_number"]),
//                 roll_no: String(row["roll_no"]),
//                 first_name: row["first_name"],
//                 last_name: row["last_name"],

//                 dob: excelDateToJSDate(row["date_of_birth"]),
//                 admission_date: excelDateToJSDate(row["admission_date"]),

//                 caste: row["caste"],
//                 mobile: row["mobile"],

//                 gender: mapGender(row["gender"]),
//                 phone: String(row["mobile"]),
//                 email: row["email"],

//                 // class_and_section_id: `${classId?.value} ${sectionId?.value}`,
//                 academic_year_id: academicYear?.value,

//                 father_name: row["father_name"],
//                 father_phone: String(row["father_phone"]),

//                 mother_name: row["mother_name"],
//                 mother_phone: String(row["mother_phone"]),

//                 guardian_name: row["guardian_name"],
//                 guardian_phone: String(row["guardian_phone"]),

//                 current_address: row["current_address"],

//                 previous_school_name: row["previous_school_details"],
//                 medical_history: row["note"],
//             }));

//             setParsedData(mapped);
//         };

//         reader.readAsArrayBuffer(file);
//     };

//     const handleSubmit = () => {
//         if (!parsedData.length) return;

//         mutate({ students: parsedData as any[] });
//     };


//     const columns: Column[] = [
//         { key: "session", title: "Session" },
//         { key: "admission_no", title: "Admission No" },
//         { key: "roll_no", title: "Roll No" },
//         { key: "first_name", title: "First Name" },
//         { key: "last_name", title: "Last Name" },
//         { key: "dob", title: "Date of birth" },
//         { key: "gender", title: "Gender" },
//         { key: "caste", title: "Caste" },
//         { key: "mobile", title: "Mobile" },
//         { key: "email", title: "Email" },
//         { key: "admission_date", title: "Admission Date" },
//         { key: "blood_group", title: "Blood Group" },
//         { key: "height", title: "Height" },
//         { key: "weight", title: "Weight" },
//         { key: "father_name", title: "Father Name" },
//         { key: "father_phone", title: "Father Phone" },
//         { key: "father_occupation", title: "Father Occupation" },
//         { key: "mother_name", title: "Mother Name" },
//         { key: "mother_phone", title: "Mother Phone" },
//         { key: "mother_occupation", title: "Mother Occupation" },
//         { key: "guardian_name", title: "Guardian Name" },
//         { key: "guardian_relation", title: "Guardian Relation" },
//         { key: "guardian_email", title: "Guardian Email" },
//         { key: "guardian_phone", title: "Guardian Phone" },
//         { key: "guardian_occupation", title: "Guardian Occupation" },
//         { key: "current_address", title: "Current Address" },
//         { key: "bank_account_no", title: "Bank Account No" },
//         { key: "bank_name", title: "Bank Name" },
//         { key: "national_identification_no", title: "National Identification No" },
//         { key: "previous_school_details", title: "Previous School Details" },
//         { key: "note", title: "Note" },
//         { key: "religion", title: "Religion" },
//     ];

//     return (
//         <>
//             {/* 🔹 Top Selects */}
//             <div className="body_section">
//                 <CustomSelect
//                     label="Academic Year"
//                     options={options}
//                     value={academicYear}
//                     onChange={setAcademicYear}
//                 />

//                 <CustomSelect
//                     label="Class"
//                     options={options}
//                     value={classId}
//                     onChange={setClassId}
//                 />

//                 <CustomSelect
//                     label="Section"
//                     options={options}
//                     value={sectionId}
//                     onChange={setSectionId}
//                 />
//             </div>

//             {/* 🔹 File Upload */}
//             <div className="body_section">
//                 <InputFiles
//                     name="bulk_students"
//                     onChange={(e: any) => handleFileChange(e.target.files[0])}
//                 />
//             </div>

//             <div style={{ width: "100%", backgroundColor: "", overflow: "scroll" }} >
//                 <DataTable
//                     columns={columns}
//                     data={parsedData}
//                     currentPage={0}
//                     totalPages={0}
//                     onPageChange={(p) => console.log(p)}
//                 />
//             </div>

//             {/* 🔹 Buttons */}
//             <div className="buttons">
//                 <SecondaryButton />
//                 <PrimaryButton
//                     title={isPending ? "Saving..." : "Import Students"}
//                     onClick={handleSubmit}
//                 />
//             </div>
//         </>
//     );
// };

// export default BulkUpload;