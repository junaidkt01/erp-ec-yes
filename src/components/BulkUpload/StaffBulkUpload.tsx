import { useState } from "react";
import * as XLSX from "xlsx";
import "./BulkUpload.scss";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import InputFiles from "../InputFields/InputFiles";
import DataTable, { type Column } from "../DataTable/DataTable";
import InputCheckbox from "../InputCheckbox/InputCheckbox";
import { toast } from "sonner";
import { useBulkAddStaff } from "../../hooks/useStaff";
import { formatOptionInstruction, GENDER_OPTIONS, STAFF_CATEGORY_OPTIONS } from "../../utils/studentOptions";
import { useTranslation } from "../../i18n/LanguageContext";

const systemFields = [
    "sl",
    "staff_code",
    "full_name",
    "category",
    "role",
    "designation",
    "email",
    "phone",
    "gender",
    "dob",
    "date_of_joining",
    "father_name",
    "mother_name",
    "emergency_mobile",
    "current_address",
    "permanent_address",
    "qualifications",
    "experience",
    "basic_salary",
    "contract_type",
    "location",
];

const importInstructions = [
    "Your CSV/Excel data should match the format of the downloaded sample template file. The first line should contain column headers.",
    "For 'Staff ID', provide a unique code (e.g. STF001).",
    `For 'Category', use one of: ${formatOptionInstruction(STAFF_CATEGORY_OPTIONS, false)} (Teacher / Parent / Others).`,
    `For 'Gender', use values: ${formatOptionInstruction(GENDER_OPTIONS, true)}.`,
    "For date fields (Date of Birth, Date of Joining), format as YYYY-MM-DD (e.g., 2020-06-15).",
    "Duplicate staff email/phone rows may be rejected by the system."
];

const normalize = (str: string) =>
    str.toLowerCase().replace(/[\s_\-()]/g, "");

const synonyms: Record<string, string[]> = {
    staff_code: ["staffid", "staff_code", "staff code", "staff_id", "staff id", "code"],
    full_name: ["fname", "full", "givenname", "fullname", "full name", "name"],
    category: ["staffcategory", "category", "staff category", "type"],
    role: ["staffrole", "role"],
    designation: ["staffdesignation", "designation", "title", "post"],
    dob: ["dateofbirth", "birthdate", "date of birth", "dob"],
    date_of_joining: ["doj", "dateofjoining", "joiningdate", "date of joining"],
    father_name: ["fathername", "father's name", "father"],
    mother_name: ["mothername", "mother's name", "mother"],
    emergency_mobile: ["emergencymobile", "emergencycontact", "emergency phone"],
    gender: ["sex"],
    email: ["mail", "emailaddress", "email address"],
    phone: ["mobile", "contact", "phonenumber", "phone number"],
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

const StaffBulkUpload = ({ onClick }: { onClick: () => void }) => {
    const { t } = useTranslation();
    const steps = [t("bulk.step_upload", "Upload"), t("bulk.step_map", "Map Data"), t("bulk.step_import", "Import")];

    const [step, setStep] = useState(1);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawData, setRawData] = useState<any[]>([]);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [mapping, setMapping] = useState<any>({});
    const [finalData, setFinalData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const { mutate: bulkAddStaff, isPending } = useBulkAddStaff();

    const handleDownloadSampleExcel = () => {
        const headers = systemFields;
        const sampleRow: Record<string, string> = {
            sl: "1",
            staff_code: "STF001",
            full_name: "Jane Smith",
            category: "Teacher",
            role: "Teacher",
            designation: "Senior Mathematics Teacher",
            email: "jane.smith@example.com",
            phone: "9876543210",
            gender: "Female",
            dob: "1990-05-15",
            date_of_joining: "2022-06-01",
            father_name: "Robert Smith",
            mother_name: "Mary Smith",
            emergency_mobile: "9876543211",
            current_address: "456 Oak Avenue",
            permanent_address: "456 Oak Avenue",
            qualifications: "M.Sc. Mathematics, B.Ed.",
            experience: "5 Years",
            basic_salary: "45000",
            contract_type: "Permanent",
            location: "Main Campus",
        };

        const worksheet = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Staff_Template");
        XLSX.writeFile(workbook, "Sample_Staff_Import_Template.xlsx");
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

                staff_code: String(get("staff_code") ?? `STF${i + 1}`),
                full_name: get("full_name") || `Staff`,
                category: get("category") || "Teacher",
                role: get("role") || "Teacher",
                designation: get("designation") || "",
                email: String(get("email") ?? ""),
                phone: String(get("phone") ?? ""),

                gender: genderMap(get("gender")),
                dob: excelDate(get("dob")),
                date_of_joining: excelDate(get("date_of_joining")),

                father_name: get("father_name"),
                mother_name: get("mother_name"),
                emergency_mobile: String(get("emergency_mobile") ?? ""),

                current_address: get("current_address"),
                permanent_address: get("permanent_address"),
                qualifications: get("qualifications"),
                experience: get("experience"),
                basic_salary: Number(get("basic_salary") ?? ""),
                contract_type: get("contract_type"),
                location: get("location"),
            };
        });

        setFinalData(mapped);
        setSelectedRows(mapped.map((_, i) => i));
    };

    const handleStep1Next = () => {
        if (!uploadedFileName || rawData.length === 0) {
            toast.error("Please upload an Excel file with staff data.");
            return;
        }
        setStep(2);
    };

    const handleSubmit = () => {
        const selected = finalData
            .filter((r) => selectedRows.includes(r._index))
            .map(({ _index, sl, ...rest }) => rest);

        if (selected.length === 0) {
            toast.error("Please select at least one staff row to import.");
            return;
        }
        console.log("selected: ", selected)

        bulkAddStaff({ staffs: selected }, {
            onSuccess: () => {
                toast.success(`${selected.length} staff records uploaded successfully`);
                onClick();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Error uploading staff data");
            }
        });
    };

    const columns: Column[] = [
        { key: "staff_code", title: t("field.staff_code", "Staff ID") },
        { key: "full_name", title: t("field.full_name", "Full Name") },
        { key: "category", title: t("field.category", "Category") },
        { key: "role", title: t("field.role", "Role") },
        { key: "designation", title: t("field.designation", "Designation") },
        { key: "email", title: t("field.email", "Email") },
        { key: "phone", title: t("field.phone", "Phone") },
        { key: "gender", title: t("field.gender", "Gender") },
        { key: "date_of_joining", title: t("field.date_of_joining", "Date of Joining") },
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

                    <div className="upload_drop_zone">
                        <InputFiles
                            accept=".xlsx,.xls"
                            onChange={(e: any) => handleFile(e.target.files[0])}
                        />
                    </div>

                    <div className="buttons">
                        <SecondaryButton title={t("bulk.download_sample_staff", "Download Sample Staff Excel")} onClick={handleDownloadSampleExcel} />
                        <SecondaryButton title={t("action.cancel", "Cancel")} onClick={() => onClick()} />
                        <PrimaryButton disabled={!uploadedFileName} title={t("action.next", "Next")} onClick={handleStep1Next} />
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
                                <div className="left">{field === "staff_code" ? "Staff ID (staff_code)" : field}</div>

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
                                Selected {selectedRows.length} of {finalData.length} staff records
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

export default StaffBulkUpload;
