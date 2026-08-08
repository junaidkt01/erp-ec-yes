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
    "sl",
    "student_code",
    "admission_no",
    "admission_date",
    "roll_no",
    "first_name",
    "last_name",
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

const BulkUpload = ({ onClick }: { onClick: () => void }) => {
    const [step, setStep] = useState(1);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawData, setRawData] = useState<any[]>([]);
    const [mapping, setMapping] = useState<any>({});
    const [finalData, setFinalData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    console.log("finalData: ", finalData);

    const { mutate, isPending } = useBulkAddStudents();


    // sample student data excel start

    // const handleDownloadSampleExcel = () => {
    //     const sampleData = [
    //         {
    //             student_code: "STU001",
    //             admission_no: "ADM2026001",
    //             admission_date: "2026-06-01",
    //             roll_no: "1",

    //             first_name: "John",
    //             last_name: "Doe",
    //             dob: "2015-05-20",
    //             gender: "Male",
    //             religion: "Christian",
    //             caste: "General",
    //             blood_group: "O+",

    //             nationality: "American",
    //             category_id: "1",
    //             class_id: "6",
    //             section_id: "4",

    //             address: "123 Main Street",
    //             current_address: "456 Test Ave",
    //             permanent_address: "456 Test Ave",

    //             national_id_no: "123456789012",
    //             birth_certificate_no: "BC123456",
    //             apaar_id: "APAAR123456",
    //             aadharshila_no: "AADH123456",
    //             pen_no: "PEN123456",

    //             previous_school_name: "ABC Public School",
    //             note: "Sample student",

    //             father_name: "Michael Doe",
    //             father_phone: "9876543210",
    //             father_email: "michael@example.com",
    //             father_occupation: "Engineer",

    //             mother_name: "Sarah Doe",
    //             mother_phone: "9876543211",
    //             mother_email: "sarah@example.com",
    //             mother_occupation: "Teacher",

    //             guardian_name: "Robert Doe",
    //             guardian_phone: "9876543212",
    //             guardian_email: "robert@example.com",
    //             guardian_occupation: "Business",
    //             guardian_relation: "Uncle",
    //             guardian_address: "789 Guardian Street",
    //         },
    //     ];

    //     const worksheet = XLSX.utils.json_to_sheet(sampleData);
    //     const workbook = XLSX.utils.book_new();

    //     XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    //     XLSX.writeFile(workbook, "Sample_Student_Import.xlsx");
    // };

    // sample student data excel end

    // Upload + Parse
    const handleFile = (file: File) => {
        if (!file) return;

        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
        ];

        const allowedExtensions = [".xlsx", ".xls"];
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

        if (
            !allowedTypes.includes(file.type) &&
            !allowedExtensions.includes(extension)
        ) {
            alert("Please upload a valid Excel file (.xls or .xlsx).");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const wb = XLSX.read(data, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const json: any[] = XLSX.utils.sheet_to_json(sheet);

            if (!json.length) return;

            const hdrs = Object.keys(json[0]);

            setHeaders(hdrs);
            setRawData(json);

            const auto = smartAutoMap(hdrs, systemFields);
            setMapping(auto);
        };

        reader.readAsArrayBuffer(file);
    };
    // const handleFile = (file: File) => {
    //     const reader = new FileReader();

    //     reader.onload = (e: any) => {
    //         const data = new Uint8Array(e.target.result);
    //         const wb = XLSX.read(data, { type: "array" });
    //         const sheet = wb.Sheets[wb.SheetNames[0]];
    //         const json: any = XLSX.utils.sheet_to_json(sheet);

    //         if (!json.length) return;

    //         const hdrs = Object.keys(json[0]);

    //         setHeaders(hdrs);
    //         setRawData(json);

    //         const auto = smartAutoMap(hdrs, systemFields);
    //         setMapping(auto);
    //     };

    //     reader.readAsArrayBuffer(file);
    // };

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
                sl: i + 1,

                student_code: get("student_code"),
                admission_no: String(get("admission_no") ?? ""),
                admission_date: excelDate(get("admission_date")),
                roll_no: String(get("roll_no") ?? ""),

                first_name: get("first_name"),
                last_name: get("last_name"),
                dob: excelDate(get("dob")),
                gender: genderMap(get("gender")),
                religion: get("religion"),
                caste: get("caste"),
                blood_group: get("blood_group"),

                nationality: get("nationality"),
                category_id: get("category_id"),
                class_id: get("class_id"),
                section_id: get("section_id"),

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

    // const generateData = () => {
    //     const mapped = rawData.map((row, i) => {
    //         const get = (f: string) => row[mapping[f]?.column];

    //         return {
    //             sl: i + 1, // Usually 1-indexed for UI display
    //             session: get("session"),
    //             admission_no: String(get("admission_number") ?? ""),
    //             roll_no: String(get("roll_no") ?? ""),
    //             first_name: get("first_name"),
    //             last_name: get("last_name"),
    //             dob: excelDate(get("date_of_birth")),
    //             gender: genderMap(get("gender")),
    //             caste: get("caste"),
    //             mobile: String(get("mobile") ?? ""),
    //             email: get("email"),
    //             admission_date: excelDate(get("addmission_date")), // Matching your 'addmission' typo
    //             blood_group: get("blood_group"),
    //             height: get("height"),
    //             weight: get("weight"),
    //             father_name: get("father_name"),
    //             father_phone: String(get("father_phone") ?? ""),
    //             father_occupation: get("father_occupation"),
    //             mother_name: get("mother_name"),
    //             mother_phone: String(get("mother_phone") ?? ""),
    //             mother_occupation: get("mother_occupation"),
    //             guardian_name: get("guardian_name"),
    //             guardian_relation: get("guardian_relation"),
    //             guardian_email: get("guardian_email"),
    //             guardian_phone: String(get("guardian_phone") ?? ""),
    //             guardian_occupation: get("guardian_occupation"),
    //             current_address: get("current_address"),
    //             bank_account_no: String(get("bank_account_no") ?? ""),
    //             bank_name: get("bank_name"),
    //             national_identification_no: String(get("national_identification_no") ?? ""),
    //             previous_school_details: get("previous_school_details"),
    //             note: get("note"),
    //             religion: get("religion")
    //         };
    //     });

    //     setFinalData(mapped);
    //     setSelectedRows(mapped.map((_, i) => i));
    // };

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
                // email: item.email,
                // admission_no: item.admission_no,
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
        { key: "student_code", title: "Student Code" },
        { key: "admission_no", title: "Admission No" },
        { key: "admission_date", title: "Admission Date" },
        { key: "roll_no", title: "Roll No" },

        { key: "first_name", title: "First Name" },
        { key: "last_name", title: "Last Name" },
        { key: "dob", title: "Date of Birth" },
        { key: "gender", title: "Gender" },
        { key: "religion", title: "Religion" },
        { key: "caste", title: "Caste" },
        { key: "blood_group", title: "Blood Group" },

        { key: "nationality", title: "Nationality" },
        { key: "class_id", title: "Class" },
        { key: "section_id", title: "Section" },
        { key: "category_id", title: "Category" },

        { key: "address", title: "Address" },
        { key: "current_address", title: "Current Address" },
        { key: "permanent_address", title: "Permanent Address" },

        { key: "national_id_no", title: "Adhaar No" },
        { key: "birth_certificate_no", title: "Birth Certificate No" },
        { key: "apaar_id", title: "APAAR ID" },
        { key: "aadharshila_no", title: "Aadharshila No" },
        { key: "pen_no", title: "PEN No" },

        { key: "previous_school_name", title: "Previous School Name" },
        { key: "note", title: "Note" },

        { key: "father_name", title: "Father Name" },
        { key: "father_phone", title: "Father Phone" },
        { key: "father_email", title: "Father Email" },
        { key: "father_occupation", title: "Father Occupation" },

        { key: "mother_name", title: "Mother Name" },
        { key: "mother_phone", title: "Mother Phone" },
        { key: "mother_email", title: "Mother Email" },
        { key: "mother_occupation", title: "Mother Occupation" },

        { key: "guardian_name", title: "Guardian Name" },
        { key: "guardian_phone", title: "Guardian Phone" },
        { key: "guardian_email", title: "Guardian Email" },
        { key: "guardian_occupation", title: "Guardian Occupation" },
        { key: "guardian_relation", title: "Guardian Relation" },
        { key: "guardian_address", title: "Guardian Address" },
    ];

    // sample student data excel start
    const handleDownloadSampleExcel = () => {
        // Excel header row (titles)
        const headers = columns.map((col) => col.title);

        // Optional sample row using keys
        const sampleRow = columns.map((col) => {
            switch (col.key) {
                case "student_code":
                    return "STU001";
                case "admission_no":
                    return "ADM2026001";
                case "first_name":
                    return "John";
                case "last_name":
                    return "Doe";
                case "gender":
                    return "Male";
                case "father_name":
                    return "Michael Doe";
                case "mother_name":
                    return "Sarah Doe";
                default:
                    return "";
            }
        });

        const worksheet = XLSX.utils.aoa_to_sheet([
            headers,
            sampleRow, // Remove this line if you want only headers
        ]);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

        XLSX.writeFile(workbook, "Student_Import_Template.xlsx");
    };
    // sample student data excel end


    return (
        <div className="bulk_upload" >
            <div className="stepper" >
                {steps.map((label, i) => {
                    const stepNum = i + 1;
                    const isDone = stepNum < step;
                    const isActive = stepNum === step;

                    return (
                        <div key={i} className="step-wrap">
                            <div className={`step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`} >
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
                                {/* <InputFiles accept="" onChange={(e: any) => handleFile(e.target.files[0])} /> */}
                                <InputFiles accept=".xlsx,.xls" onChange={(e: any) => handleFile(e.target.files[0])} />
                            </div>
                        </div>
                    </div>

                    <div className="buttons">
                        <SecondaryButton title="Download Sample Student Excel" onClick={handleDownloadSampleExcel} />
                        <SecondaryButton title="Cancel" onClick={() => onClick()} />
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
                <>
                    <div className="popup_body" >
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
                            <SecondaryButton title="Previous" onClick={() => setStep(2)} />
                            <PrimaryButton
                                title={isPending ? "Importing..." : "Import"}
                                onClick={handleSubmit}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BulkUpload;

const student = {
    "student_code": null,
    "admission_no": "ADM2026001",
    "admission_date": null,
    "roll_no": null,

    "first_name": "John",
    "last_name": "Doe",
    "dob": null,
    "religion": null,
    "caste": null,
    "blood_group": null,

    "gender": "male",
    "category_id": null,
    "class_id": 6,
    "section_id": 4,
    "address": null,
    "nationality": "American",
    "current_address": "456 Test Ave",
    "permanent_address": "456 Test Ave",
    "national_id_no": null, // adhaar_number
    "birth_certificate_no": null,
    "apaar_id": null,
    "aadharshila_no": null,
    "pen_no": null,
    "previous_school_name": null,
    "note": null,

    "father_name": "Michael Doe",
    "father_phone": "1122334455",
    "father_email": null,
    "father_occupation": null,
    "mother_name": "Sarah Doe",
    "mother_phone": "5544332211",
    "mother_email": null,
    "mother_occupation": null,
    "guardian_name": null,
    "guardian_phone": null,
    "guardian_occupation": null,
    "guardian_email": null,
    "guardian_relation": null,
    "guardian_address": null,
}

// const student = {
//     "student_code": null,
//     "admission_no": "ADM2026001",
//     "admission_date": null,
//     "roll_no": null,

//     "first_name": "John",
//     "last_name": "Doe",
//     "dob": null,
//     "religion": null,
//     "caste": null,
//     "blood_group": null,

//     "gender": "male",
//     "category_id": null,
//     "class_id": 6,
//     "section_id": 4,
//     "address": null,
//     "nationality": "American",
//     "current_address": "456 Test Ave",
//     "permanent_address": "456 Test Ave",
//     "national_id_no": null, // adhaar_number
//     "birth_certificate_no": null,
//     "apaar_id": null,
//     "aadharshila_no": null,
//     "pen_no": null,
//     "previous_school_name": null,
//     "note": null,

//     "parents": {
//         "father_name": "Michael Doe",
//         "father_phone": "1122334455",
//         "father_email": null,
//         "father_occupation": null,
//         "mother_name": "Sarah Doe",
//         "mother_phone": "5544332211",
//         "mother_email": null,
//         "mother_occupation": null,
//         "guardian_name": null,
//         "guardian_phone": null,
//         "guardian_occupation": null,
//         "guardian_email": null,
//         "guardian_relation": null,
//         "guardian_address": null,
//     },
// }