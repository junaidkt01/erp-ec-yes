import { useEffect, useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import InputTitleTabs, { addStudentsTabs } from "../../../components/InputTitleTabs/InputTitleTabs.tsx"
import TableWrapper from "../../../components/TableWrapper"
import { CustomSelect } from "../../../components/InputFields/CustomSelect.tsx"
import InputFiles from "../../../components/InputFields/InputFiles.tsx"
import InputRadioButtons from "../../../components/InputRadioButtons/InputRadioButtons.tsx"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear.ts"
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass.ts"
import { useFetchAllSections } from "../../../hooks/useSections.ts"
import { useAddStudent, useFetchAllStudents, useFetchOneStudent, useUpdateStudent } from "../../../hooks/useStudent.ts"

import "./AddStudent.scss"
import { useAuth } from "../../../auth/useAuth.ts"
import { useParams } from "react-router-dom"
import LoadingOverlay from "../../../components/Loadingoverlay.tsx"
import { toast } from "sonner"
import BulkUpload from "../../../components/BulkUpload/BulkUpload.tsx"
import { validate } from "../../../utils/validate.ts"
import { studentFamilyDetailsSchema, studentPersonalDetailsSchema } from "../../../validations/studentsSchema.ts"
import { useDebounce } from "../../../hooks/useDebounce.ts"
import { BASE_URL } from "../../../api/endpoints.ts"
import {
    GENDER_OPTIONS,
    RELIGION_OPTIONS,
    BLOOD_GROUP_OPTIONS,
    GUARDIAN_RELATION_OPTIONS,
    // SIBLING_STAFF_OPTIONS,
    // ROUTE_OPTIONS,
    // HOSTEL_ROOM_OPTIONS
} from "../../../utils/studentOptions.ts"

const AddStudent = () => {
    const { student_id } = useParams();
    const { data: student, isLoading: studentLoading } = useFetchOneStudent(student_id || "")
    console.log("student: ", student)

    // find students starts
    const [searchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const initialFilter = {
        academic_year_id: "",
        class_id: "",
        section_id: "",
        name: "",
        roll_no: "",
    };

    const [isFindParent, setIsFindParent] = useState(false)
    const [filterData, setFilterData] = useState(initialFilter);
    const [selecteSibling, setSelecteSibling] = useState<any>(null);
    const [selectedSibling, setSelectedSibling] = useState<any>(null);
    const handleSelectSibling = () => {
        setSelectedSibling(students?.data?.find((student: any) => student.id === selecteSibling));
        setIsFindParent(!isFindParent)
    }

    console.log("abccc", selectedSibling?.parents?.father_name)

    const handleFindParent = () => {
        setIsFindParent(!isFindParent)
    }

    console.log("selectedSibling: ", selectedSibling)
    // const [filteredData, setFilteredData] = useState(initialFilter);

    const { data: students } = useFetchAllStudents(1, {
        class_id: filterData.class_id,
        section_id: filterData.section_id,
        search: debouncedSearch || filterData.name,
    });

    console.log("students: ", students?.data?.[0])

    const studentsAsSiblings = students?.data?.map((student) => ({
        label: student.full_name,
        // label: `${student.first_name} ${student.last_name}`,
        value: student.id,
    }));

    console.log("studentsAsSiblings: ", studentsAsSiblings)

    const handleResetFilterData = () => {
        setFilterData(initialFilter);
    };

    // find students end

    const [selectedInputTitleTab, setSelectedInputTitleTab] = useState(addStudentsTabs[0]);
    const [readyToSubmit, setReadyToSubmit] = useState(false);

    const handleSelecteInputTitleTab = (title: string) => {
        setSelectedInputTitleTab(title);
    }

    const [isImportStudents, setIsImportStudents] = useState(false)
    const handleImportStudents = () => {
        setIsImportStudents(!isImportStudents);
    }


    const [relation, setRelation] = useState("father");
    const options = GUARDIAN_RELATION_OPTIONS;

    const [siblingStaff, _] = useState("from_sibling");
    // const siblingStaffOptions = SIBLING_STAFF_OPTIONS;

    // upload inputs start

    // 1.
    type PhotoType = | "photo" | "father_photo" | "mother_photo" | "guardian_photo";

    interface PhotoState { file: File | null; preview: string | null }

    const initialPhotosState: Record<PhotoType, PhotoState> = {
        photo: { file: null, preview: null },
        father_photo: { file: null, preview: null },
        mother_photo: { file: null, preview: null },
        guardian_photo: { file: null, preview: null },
    };

    const [photos, setPhotos] = useState<Record<PhotoType, PhotoState>>(initialPhotosState);

    console.log("photos.photo.preview: ", photos.photo.preview)

    const handlePhotoUpload = (type: PhotoType) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhotos((prev) => ({
            ...prev,
            [type]: {
                file,
                preview: URL.createObjectURL(file),
            },
        }));

        setFormData((prev: any) => ({
            ...prev,
            [type]: file
        }));
    };

    const handleDocumentUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only PDF and image files are allowed.");
            e.target.value = "";
            return;
        }

        const index = parseInt(key.replace("document_", "")) - 1;
        const targetIndex = index >= 0 ? index : 0;

        setFormData((prev) => {
            const currentDocs = [...(prev.documents || [])];
            while (currentDocs.length <= targetIndex) {
                currentDocs.push({ id: currentDocs.length + 1, title: "", file: "" });
            }

            currentDocs[targetIndex] = {
                ...currentDocs[targetIndex],
                id: targetIndex + 1,
                file: file as any,
                preview: URL.createObjectURL(file),
            };

            return {
                ...prev,
                documents: currentDocs,
            };
        });
    };

    const handleDocumentTitleChange = (key: string, value: string) => {
        const index = parseInt(key.replace("document_title_", "")) - 1;
        const targetIndex = index >= 0 ? index : 0;

        setFormData((prev) => {
            const currentDocs = [...(prev.documents || [])];
            while (currentDocs.length <= targetIndex) {
                currentDocs.push({ id: currentDocs.length + 1, title: "", file: "" });
            }

            currentDocs[targetIndex] = {
                ...currentDocs[targetIndex],
                id: targetIndex + 1,
                title: value,
            };

            return {
                ...prev,
                documents: currentDocs,
            };
        });
    };
    // upload inputs end

    const { mutateAsync: addStudent } = useAddStudent();
    const { mutateAsync: updateStudent } = useUpdateStudent(student_id || "");

    const [errors, setErrors] = useState<any>({});
    console.log("errors11: ", errors)

    useEffect(() => {
        if (!errors || typeof errors !== "object") return;

        Object.values(errors).forEach((error) => {
            if (typeof error === "string" && error.trim()) {
                toast.error(error);
            }
        });
    }, [errors]);

    const studentForm = {
        full_name: "",
        // first_name: "",
        // last_name: "",
        phone: "",
        email: "",
        class_id: 0,
        section_id: 0,
        academic_year_id: 0,

        student_code: "",
        apaar_id: "",
        pen_no: "",
        aadharshila_no: "",

        photo: null as File | string | null,
        father_photo: null as File | string | null,
        mother_photo: null as File | string | null,
        guardian_photo: null as File | string | null,
        blood_group: "",
        religion: "",
        admission_date: "",
        admission_no: "",
        // dob: "",
        dob: null as Date | null,
        gender: "",
        emergencyContacts: [{
            name: "",
            relation: "",
            phone: ""
        }],
        documents: [
            { id: 1, title: "", file: "" as any, preview: "" },
            { id: 2, title: "", file: "" as any, preview: "" },
            { id: 3, title: "", file: "" as any, preview: "" },
            { id: 4, title: "", file: "" as any, preview: "" },
        ] as { id: number; title: string; file: any; preview?: string }[],

        caste: "",
        roll_no: "",

        current_address: "",
        permanent_address: "",

        father_name: "",
        father_phone: "",
        father_email: "",
        father_occupation: "",
        mother_name: "",
        mother_phone: "",
        mother_email: "",
        mother_occupation: "",
        guardian_name: "",
        guardian_phone: "",
        guardian_occupation: "",
        guardian_email: "",
        guardian_relation: "",
        guardian_address: "",
        guardian_is: "",

        national_id_no: "",
        birth_certificate_no: "",
        note: "",

        previous_school_name: "",
        previous_qualification: "",
        previous_school_details: "",
    }
    const [formData, setFormData] = useState(studentForm);

    console.log("formData: ", formData)

    useEffect(() => {
        if (!student || !student_id) return;

        const data = student.data || {};
        const parents = data.parents || {};

        setPhotos({
            photo: { file: null, preview: `${BASE_URL}/public/${data.photo}` || null },
            father_photo: { file: null, preview: `${BASE_URL}/public/${parents.father_photo}` || null },
            mother_photo: { file: null, preview: `${BASE_URL}/public/${parents.mother_photo}` || null },
            guardian_photo: { file: null, preview: `${BASE_URL}/public/${parents.guardian_photo}` || null },
        });

        setFormData((prev) => ({
            ...prev,

            academic_year_id: Number(data.academic_year_id || ""),
            admission_date: String(data.admission_date || ""),
            admission_no: String(data.admission_no || ""),
            birth_certificate_no: String(data.birth_certificate_no || ""),
            blood_group: String(data.blood_group || ""),
            caste: String(data.caste || ""),
            current_address: String(data.current_address || ""),
            dob: data.dob ? new Date(data.dob) : null,
            email: String(data.email || ""),
            full_name: String(data.full_name || ""),
            gender: String(data.gender || ""),
            national_id_no: String(data.national_id_no || ""),
            note: String(data.note || ""),
            permanent_address: String(data.permanent_address || ""),
            phone: String(data.phone || ""),
            previous_qualification: String(data.previous_qualification || ""),
            previous_school_details: String(data.previous_school_details || ""),
            previous_school_name: String(data.previous_school_name || ""),

            student_code: String(data.student_code || ""),
            apaar_id: String(data.apaar_id || ""),
            pen_no: String(data.pen_no || ""),
            aadharshila_no: String(data.aadharshila_no || ""),

            photo: data.photo || null,

            class_id: Number(data.class_id || ""),
            section_id: Number(data.section_id || ""),

            religion: String(data.religion || ""),
            roll_no: String(data.roll_no || ""),

            // parents
            father_name: String(parents.father_name || ""),
            father_phone: String(parents.father_phone || ""),
            father_email: String(parents.father_email || ""),
            father_occupation: String(parents.father_occupation || ""),
            father_photo: parents.father_photo || null,

            mother_name: String(parents.mother_name || ""),
            mother_phone: String(parents.mother_phone || ""),
            mother_email: String(parents.mother_email || ""),
            mother_occupation: String(parents.mother_occupation || ""),
            mother_photo: parents.mother_photo || null,

            guardian_name: String(parents.guardian_name || ""),
            guardian_phone: String(parents.guardian_phone || ""),
            guardian_email: String(parents.guardian_email || ""),
            guardian_occupation: String(parents.guardian_occupation || ""),
            guardian_relation: String(parents.guardian_relation || ""),
            guardian_address: String(parents.guardian_address || ""),
            guardian_is: String(parents.guardian_is || ""),
            guardian_photo: parents.guardian_photo || null,

            // arrays
            documents: data.documents || [],
            emergencyContacts: data.emergencyContacts || [],
        }));

    }, [student, student_id]);

    // Find guardian start
    useEffect(() => {
        if (!selectedSibling) return;
        // if (!student || !student_id) return;

        const parents = selectedSibling?.parents || {};

        setFormData((prev) => ({
            ...prev,

            // parents
            father_name: String(parents.father_name || ""),
            father_phone: String(parents.father_phone || ""),
            father_email: String(parents.father_email || ""),
            father_occupation: String(parents.father_occupation || ""),

            mother_name: String(parents.mother_name || ""),
            mother_phone: String(parents.mother_phone || ""),
            mother_email: String(parents.mother_email || ""),
            mother_occupation: String(parents.mother_occupation || ""),

            guardian_name: String(parents.guardian_name || ""),
            guardian_phone: String(parents.guardian_phone || ""),
            guardian_email: String(parents.guardian_email || ""),
            guardian_occupation: String(parents.guardian_occupation || ""),
            guardian_relation: String(parents.guardian_relation || ""),
            guardian_address: String(parents.guardian_address || ""),
            guardian_is: String(parents.guardian_is || ""),
        }));

    }, [student, student_id, selectedSibling]);
    // Find guardian end


    const handleChange = (value: any, name?: string) => {
        setErrors((prev: any) => ({ ...prev, [name || value.target.name]: undefined }))
        if (name) {
            // for DatePicker or custom inputs
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            const e = value;

            const fieldName = e.target.name;

            let fieldValue;

            console.log("fieldValue: ", fieldValue);

            if (e.target.files) {
                // file input
                fieldValue = e.target.files[0]; // or full FileList if needed
            } else {
                // normal input
                fieldValue = e.target.value.toUpperCase();
            }

            setFormData((prev) => ({
                ...prev,
                [fieldName]: fieldValue,
            }));
        }
    };

    const { data } = useAuth();
    console.log("dsds: ", data?.user?.id)

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        const payload = new FormData();

        payload.append("user_id", data?.user?.id || "1");

        payload.append("admission_no", formData?.admission_no);

        // payload.append("first_name", formData?.first_name);
        // payload.append("last_name", formData?.last_name);
        payload.append("full_name", formData?.full_name);

        // payload.append("email", formData?.email);
        payload.append("class_id", String(formData?.class_id));
        payload.append("section_id", String(formData?.section_id));
        payload.append("academic_year_id", String(formData?.academic_year_id));
        payload.append("gender", formData?.gender);

        payload.append("student_code", String(formData?.student_code));
        payload.append("apaar_id", String(formData?.apaar_id));
        payload.append("pen_no", String(formData?.pen_no));
        payload.append("aadharshila_no", String(formData?.aadharshila_no));

        payload.append("roll_no", formData?.roll_no);

        // payload.append("dob", formData?.dob);
        payload.append("dob", formData.dob ? formData.dob.toISOString() : "");
        payload.append("phone", formData?.phone);

        payload.append("blood_group", formData?.blood_group);
        payload.append("religion", formData?.religion);
        payload.append("caste", formData?.caste);

        payload.append("admission_date", formData.admission_date);

        payload.append("current_address", formData?.current_address);
        payload.append("permanent_address", formData?.permanent_address);

        payload.append("father_name", formData?.father_name);
        payload.append("father_phone", formData?.father_phone);
        payload.append("father_email", formData?.father_email);
        payload.append("father_occupation", formData?.father_occupation);

        payload.append("mother_name", formData?.mother_name);
        payload.append("mother_phone", formData?.mother_phone);
        payload.append("mother_email", formData?.mother_email);
        payload.append("mother_occupation", formData?.mother_occupation);

        payload.append("guardian_name", formData?.guardian_name);
        payload.append("guardian_phone", formData?.guardian_phone);
        payload.append("guardian_email", formData?.guardian_email);
        payload.append("guardian_occupation", formData?.guardian_occupation);
        payload.append("guardian_relation", formData?.guardian_relation);
        payload.append("guardian_address", formData?.guardian_address);
        payload.append("guardian_is", formData?.guardian_is);

        payload.append("national_id_no", formData?.national_id_no);
        payload.append("birth_certificate_no", formData?.birth_certificate_no);
        payload.append("note", formData?.note);

        payload.append("previous_school_name", formData?.previous_school_name);
        payload.append("previous_qualification", formData?.previous_qualification);
        payload.append("previous_school_details", formData?.previous_school_details);

        // Append photo files if present
        if (photos.photo.file) {
            payload.append("photo", photos.photo.file);
        } else if (formData?.photo instanceof File) {
            payload.append("photo", formData.photo);
        }

        if (photos.father_photo.file) {
            payload.append("father_photo", photos.father_photo.file);
        } else if (formData?.father_photo instanceof File) {
            payload.append("father_photo", formData.father_photo);
        }

        if (photos.mother_photo.file) {
            payload.append("mother_photo", photos.mother_photo.file);
        } else if (formData?.mother_photo instanceof File) {
            payload.append("mother_photo", formData.mother_photo);
        }

        if (photos.guardian_photo.file) {
            payload.append("guardian_photo", photos.guardian_photo.file);
        } else if (formData?.guardian_photo instanceof File) {
            payload.append("guardian_photo", formData.guardian_photo);
        }

        // Arrays → stringify
        payload.append("emergencyContacts", JSON.stringify(formData?.emergencyContacts));
        payload.append("documents", JSON.stringify(formData?.documents));

        const formDataObject = Object.fromEntries(payload.entries());
        console.log("formDataObject: ", formDataObject);

        try {
            if (student && student_id) {
                const res = await updateStudent(payload as any);
                console.log("updated: res:", res);
                if (res.success) {
                    toast('Student updated successfully')
                    setFormData(studentForm);
                    setPhotos(initialPhotosState);
                    setReadyToSubmit(false);
                } else {
                    toast('Student updation failed')
                }
            } else {
                const res = await addStudent(payload as any);
                console.log("aa: res:", res);
                toast('Student added successfully')
                setFormData(studentForm);
                setPhotos(initialPhotosState);
                setReadyToSubmit(false);
            }
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            toast('Student added failed')
            setReadyToSubmit(false);
            console.log("aa: error:", err);
        }
    };

    const handleNextInputsTab = (index: number, submit?: string) => {
        window.scrollTo({ top: 0, left: 0 })
        if (submit && readyToSubmit) {
            handleSubmit()
        } else if (submit) {
            setReadyToSubmit(true)
            setSelectedInputTitleTab(addStudentsTabs[0])
        } else {
            setSelectedInputTitleTab(addStudentsTabs[index])
        }
    }
    /////////////////////

    const { data: academicYears} = useFetchAllAcademicYears();
    const formattedData = academicYears?.map((item) => ({
        label: `${item.name} (${new Date(item.start_date).toLocaleString("default", { month: "short" })} - ${new Date(item.end_date).toLocaleString("default", { month: "short" })})`,
        value: item.id,
    }));

    const { data: studentClasses } = useFetchAllStudentClasses();
    const classOptions = studentClasses?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));
    console.log("studentClasses: ", studentClasses)

    const { data: sections } = useFetchAllSections();
    const sectionOptions = sections?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    const genderOptions = GENDER_OPTIONS;

    /////////////////////


    if (isLoading || studentLoading) {
        return <LoadingOverlay isLoading={true} />
    }

    return (
        <div className="page_wrapper">
            <div className="add_student" >
                {isFindParent && <PopupScreen title="Find Parent" onClick={handleFindParent} >
                    <div className="popup_body" >
                        <div className="fields_wrapper">
                            {/* <div className="body_section" >
                                <InputRadioButtons
                                    options={siblingStaffOptions}
                                    selectedValue={siblingStaff}
                                    onChange={setSiblingStaff}
                                    name="sibling_staff"
                                />
                            </div> */}
                            <div className="body_section" >
                                {siblingStaff === "from_sibling" && <CustomSelect value={filterData?.class_id} label="Class" placeholder="Select class" options={classOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, class_id: value }))} />}
                                {siblingStaff === "from_sibling" && <CustomSelect value={filterData?.section_id} name="section_id" label="Section" placeholder="Select section" options={sectionOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, section_id: value }))} />}
                                {siblingStaff === "from_staff" && <CustomSelect value={filterData?.section_id} name="staff_id" label="Staff" placeholder="Select section" options={sectionOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, section_id: value }))} />}
                            </div>
                            {siblingStaff === "from_sibling" && <div className="body_section" >
                                <CustomSelect label="Sibling" placeholder="Select sibling" value={selecteSibling} options={studentsAsSiblings} onChange={(val) => setSelecteSibling(val)} />
                            </div>}

                            <div className="buttons">
                                <SecondaryButton onClick={handleResetFilterData} title="Reset" />
                                <PrimaryButton onClick={handleSelectSibling} title="Save" />
                            </div>
                        </div>
                    </div>
                </PopupScreen>}

                {/* {isImportStudents && <PopupScreen title="Import students" onClick={handleImportStudents} > */}
                {isImportStudents && <PopupScreen title="Bulk Upload" onClick={handleImportStudents} >
                    <div className="popup_body" >
                        <div className="fields_wrapper" >
                            <BulkUpload onClick={handleImportStudents} />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton title={readyToSubmit ? "Details Preview" : "Add Student"} onClick={handleImportStudents} >
                    <InputTitleTabs tabsTitles={addStudentsTabs} onSetSelectedInputTitleTab={handleSelecteInputTitleTab} selected={selectedInputTitleTab} />

                    {/* List inputs */}
                    {(selectedInputTitleTab === "Personal Details" && readyToSubmit) && <div className="search_screen">
                        <>
                            <p className="search_screen_title need_margin" >Academic Information</p>
                            <div className="popup_body" >
                                <div className="student_content_to_submit_wrapper" style={{ display: "grid", gap: "24px" }} >
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >Academic Year</p>
                                            <p className="value" >{formData?.academic_year_id || "N/A"}</p>
                                            {/* <p className="value" >{academicYears?.find((item) => String(item.id) === formData.academic_year_id)?.name}</p> */}
                                        </div>
                                        <div>
                                            <p className="title" >Class</p>
                                            <p className="value" >{formData?.class_id || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Section</p>
                                            <p className="value" >{formData?.section_id || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >Admission Number</p>
                                            <p className="value" >{formData?.admission_no || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Admission Date</p>
                                            <p className="value" >{formData?.admission_date ? new Date(formData?.admission_date).toLocaleDateString() : "N/A"}</p>
                                            {/* <p className="value" >{formData?.admission_date ? formData?.admission_date?.toLocaleDateString() : "N/A"}</p> */}
                                        </div>
                                        <div>
                                            <p className="title" >Roll Number</p>
                                            <p className="value" >{formData?.roll_no || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="search_screen_title need_margin" >Personal Info</p>
                            <div className="popup_body" >
                                <div className="student_content_to_submit_wrapper" style={{ display: "grid", gap: "24px" }} >
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >Full Name</p>
                                            <p className="value" >{formData?.full_name || "N/A"}</p>
                                        </div>
                                        {/* <div>
                                            <p className="title" >First Name</p>
                                            <p className="value" >{formData?.first_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Last Name</p>
                                            <p className="value" >{formData?.last_name || "N/A"}</p>
                                        </div> */}
                                        <div>
                                            <p className="title" >Gender</p>
                                            <p className="value" >{formData?.gender || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >Date of Birth</p>
                                            {/* <p className="value" >{formData?.dob || "N/A"}</p> */}
                                        </div>
                                        <div>
                                            <p className="title" >Religion</p>
                                            <p className="value" >{formData?.religion || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Caste</p>
                                            <p className="value" >{formData?.caste || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Edit" onClick={() => setReadyToSubmit(false)} />
                                    <PrimaryButton title={isLoading ? "Submiting" : "Submit"} onClick={() => {
                                        const { success, errors } = validate(studentPersonalDetailsSchema, formData);
                                        if (success) {
                                            handleNextInputsTab(0, "submit")
                                        } else {
                                            setErrors(errors);
                                            return;
                                        }
                                    }} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {(selectedInputTitleTab === "Personal Details" && !readyToSubmit) && <div className="search_screen">
                        <>
                            {/* 1 */}
                            <p className="search_screen_title need_margin" >Academic Information</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <CustomSelect error={errors.academic_year_id} value={formData?.academic_year_id} name="academic_year_id" label="Academic year" placeholder="Select year" options={formattedData || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, academic_year_id: value }))} />
                                        <CustomSelect error={errors.class_id} value={formData?.class_id} label="Class" placeholder="Select class" options={classOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, class_id: value }))} />
                                        <CustomSelect error={errors.section_id} value={formData?.section_id} name="section_id" label="Section" placeholder="Select section" options={sectionOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, section_id: value }))} />
                                    </div>
                                    <div className="body_section" >
                                        <InputField error={errors.admission_no} type="text" label="Admission Number" placeHolder="Enter admission number" name="admission_no" value={formData?.admission_no} onChange={handleChange} />
                                        <InputField error={errors.admission_date} name="admission_date" type="date" label="Admission Date" value={formData.admission_date} placeHolder="Select date" onChange={handleChange} />
                                        {/* <InputField name="email" value={formData?.email} onChange={handleChange} type="text" label="Email" placeHolder="Enter mail address" /> */}
                                        <InputField error={errors.roll_no} name="roll_no" value={formData?.roll_no} onChange={handleChange} type="text" label="Roll Number" placeHolder="Enter roll number" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField error={errors.apaar_id} type="text" label="Apaar ID" placeHolder="Enter Apaar ID number" name="apaar_id" value={formData?.apaar_id} onChange={handleChange} />
                                        <InputField error={errors.aadharshila_no} type="text" label="Aadharshila Number" placeHolder="Enter Aadharshila ID number" name="aadharshila_no" value={formData?.aadharshila_no} onChange={handleChange} />
                                    </div>
                                    <div className="body_section" >
                                        <InputField error={errors.pen_no} type="text" label="Pen Number" placeHolder="Enter Pen number" name="pen_no" value={formData?.pen_no} onChange={handleChange} />
                                        <InputField error={errors.student_code} type="text" label="Student ID" placeHolder="Enter student ID" name="student_code" value={formData?.student_code} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Personal Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField error={errors.full_name} type="text" label="Full Name" placeHolder="Enter name" name="full_name" value={formData?.full_name} onChange={handleChange} />
                                        {/* <InputField error={errors.first_name} type="text" label="First Name" placeHolder="Enter name" name="first_name" value={formData?.first_name} onChange={handleChange} /> */}
                                        {/* <InputField error={errors.last_name} type="text" label="Last Name" placeHolder="Enter name" name="last_name" value={formData?.last_name} onChange={handleChange} /> */}
                                        <CustomSelect value={formData?.gender} name="gender" label="Gender" placeholder="Select gender" options={genderOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, gender: value }))} />
                                    </div>
                                    <div className="body_section" >
                                        <InputField error={errors.dob} name="dob" type="date" label="Date Of Birth" value={formData.dob} placeHolder="Select date" onChange={handleChange} />

                                        {/* <InputField name="dob" type="date" label="Date Of Birth" value={formData.dob} placeHolder="Select date" onChange={handleChange} /> */}
                                        <CustomSelect error={errors.religion} value={formData?.religion} name="religion" label="Religion" placeholder="Select religion" options={RELIGION_OPTIONS} onChange={(value) => setFormData((prev: any) => ({ ...prev, religion: value }))} />
                                        <InputField error={errors.caste} name="caste" value={formData?.caste} onChange={handleChange} type="text" label="Cast" placeHolder="Enter cast" />
                                    </div>
                                    <div className="body_section" >
                                        {/* <InputFiles image={photos.photo.preview || data?.data?.photo} accept="image/*" name="photo" title="Student Photo" onChange={handlePhotoUpload("photo")} /> */}

                                        <InputFiles
                                            image={photos.photo.preview || data?.data?.photo}
                                            accept="image/*" name="photo"
                                            title="Student Photo" cropSize={{ width: 350, height: 450 }}
                                            onChange={handlePhotoUpload("photo")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4 */}
                            <p className="search_screen_title need_margin" >Student Address</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField error={errors.current_address} name="current_address" value={formData?.current_address} onChange={handleChange} type="text" label="Current Address" placeHolder="Enter current address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField error={errors.permanent_address} name="permanent_address" value={formData?.permanent_address} onChange={handleChange} type="text" label="Permenant Address" placeHolder="Enter permenant address" />
                                    </div>
                                </div>
                            </div>

                            {/* 5 */}
                            <p className="search_screen_title need_margin" >Medical Record</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        {/* <CustomSelect name="blood_group" label="Blood Group" placeholder="Select blood group" options={["A+", "O+", "B+", "AB+", "A-", "O-", "B-", "AB-"]} onChange={(value) => setFormData((prev) => ({ ...prev, blood_group: value }))} /> */}
                                        <CustomSelect error={errors.blood_group} value={formData?.blood_group} name="blood_group" label="Blood Group" placeholder="Select blood group" options={BLOOD_GROUP_OPTIONS} onChange={(value) => setFormData((prev: any) => ({ ...prev, blood_group: value }))} />
                                        {/* <CustomSelect label="Category" placeholder="Select category" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} /> */}
                                    </div>
                                </div>

                                <div className="buttons">
                                    {/* <SecondaryButton title="Save" /> */}
                                    <PrimaryButton title="Next"
                                        onClick={() => {
                                            const { success, errors } = validate(studentPersonalDetailsSchema, formData);
                                            if (success) {
                                                handleNextInputsTab(1)
                                            } else {
                                                setErrors(errors);
                                                return;
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Family / Contact" && <div className="search_screen">
                        <>
                            <div className="need_margin add_parent_button_wrapper" >
                                <PrimaryButton onClick={handleFindParent} title="Find Parent" />
                            </div>

                            {/* 1 */}
                            <p className="search_screen_title" >Father Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField error={errors.father_name} name="father_name" type="text" label="Father Name" placeHolder="Enter father name" value={formData?.father_name} onChange={handleChange} />
                                        <InputField error={errors.father_phone} name="father_phone" type="text" label="Father Phone Number" placeHolder="Enter phone number" value={formData?.father_phone} onChange={handleChange} />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles cropSize={{ width: 350, height: 450 }} image={photos.father_photo.preview || data?.data?.father_photo} accept="image/*" name="father_photo" title="Father's Photo" onChange={handlePhotoUpload("father_photo")} />
                                        {/* <InputFiles image={previewFatherPhoto || data?.data?.father_photo} accept="image/*" name="father_photo" onChange={handleFatherPhotoUpload} title="Father’s Photo" /> */}
                                    </div>
                                </div>
                            </div>

                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Mother Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField error={errors.mother_name} name="mother_name" type="text" label="Mother Name" placeHolder="Enter Mother name" value={formData?.mother_name} onChange={handleChange} />
                                        <InputField error={errors.mother_phone} name="mother_phone" type="text" label="Mother Phone Number" placeHolder="Enter phone number" value={formData?.mother_phone} onChange={handleChange} />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles cropSize={{ width: 350, height: 450 }} image={photos.mother_photo.preview || data?.data?.mother_photo} accept="image/*" name="mother_photo" title="Mother's Photo" onChange={handlePhotoUpload("mother_photo")} />
                                        {/* <InputFiles image={previewMotherPhoto || data?.data?.mother_photo} accept="image/*" name="mother_photo" onChange={handleMotherPhotoUpload} title="Mother’s Photo" /> */}
                                    </div>
                                    {/* <div className="body_section" >
                                        <div className="add_additional_contact" onClick={handleAddAdmissionQuery} >
                                            <p>Add Additional Contact</p>
                                            <img src="/svgs/+.svg" alt="" />
                                        </div>
                                    </div> */}
                                </div>
                            </div>

                            {/* 3 */}
                            <p className="search_screen_title need_margin" >Guardian Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputRadioButtons
                                            title="Relation with Student"
                                            options={options}
                                            selectedValue={relation}
                                            onChange={setRelation}
                                            name="guardian"
                                        />
                                    </div>
                                    <div className="body_section" >
                                        <InputField error={errors.guardian_name} name="guardian_name" value={relation === "father" ? formData?.father_name : relation === "mother" ? formData?.mother_name : formData?.guardian_name} onChange={handleChange} type="text" label={`${relation.charAt(0).toUpperCase() + relation.slice(1)} Name`} placeHolder={`Enter ${relation} name`} />
                                        <InputField error={errors.guardian_phone} name="guardian_phone" value={relation === "father" ? formData?.father_phone : relation === "mother" ? formData?.mother_phone : formData?.guardian_phone} onChange={handleChange} type="text" label="Phone Number" placeHolder="Enter phone number" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField error={errors.guardian_relation} name="guardian_relation" value={relation === "father" ? formData?.father_name : relation === "mother" ? formData?.mother_name : formData?.guardian_relation} onChange={handleChange} type="text" label="Relation With Guardian" placeHolder="Enter relation with guardian" />
                                        <InputField error={errors.guardian_email} name="guardian_email" value={formData?.guardian_email} onChange={handleChange} type="text" label="Guardian Email" placeHolder="Enter guardian's email address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField error={errors.guardian_address} name="guardian_address" value={formData?.guardian_address} onChange={handleChange} type="text" label="Guardian Address" placeHolder="Enter guardian's address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles cropSize={{ width: 350, height: 450 }} image={photos.guardian_photo.preview || data?.data?.guardian_photo} accept="image/*" name="guardian_photo" title="Guardian Photo" onChange={handlePhotoUpload("guardian_photo")} />
                                        {/* <InputFiles image={previewGuardianPhoto || data?.data?.guardian_photo} accept="image/*" name="guardian_photo" onChange={handleGuardianPhotoUpload} title="Guardian Photo" /> */}
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next"
                                        onClick={() => {
                                            const { success, errors } = validate(studentFamilyDetailsSchema, formData);
                                            if (success) {
                                                handleNextInputsTab(2)
                                            } else {
                                                setErrors(errors);
                                                return;
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Documents" && <div className="search_screen">
                        <>
                            {/* 1 */}
                            <p className="search_screen_title need_margin" >Document Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField name="national_id_no" value={formData?.national_id_no} onChange={handleChange} type="text" label="Adhaar Number" placeHolder="Enter national id card" />
                                        <InputField name="birth_certificate_no" value={formData?.birth_certificate_no} onChange={handleChange} type="text" label="Birth cerifiate number" placeHolder="Enter brith certificate number" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="note" value={formData?.note} onChange={handleChange} type="text" label="Additional Notes" placeHolder="Enter additional notes" />
                                    </div>
                                </div>
                            </div>

                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Document Attachment</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField type="text" label="Document 1" name="document_title_1" placeHolder="Enter document 1 title" value={formData.documents?.[0]?.title || ""} onChange={(e: any) => handleDocumentTitleChange("document_title_1", e.target ? e.target.value : e)} />
                                        <InputField type="text" label="Document 2" name="document_title_2" placeHolder="Enter document 2 title" value={formData.documents?.[1]?.title || ""} onChange={(e: any) => handleDocumentTitleChange("document_title_2", e.target ? e.target.value : e)} />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles name="document_1" accept="image/*,.pdf" image={formData.documents?.[0]?.preview || (typeof formData.documents?.[0]?.file === "string" ? formData.documents?.[0]?.file : undefined)} onChange={(e) => handleDocumentUpload("document_1", e)} />
                                        <InputFiles name="document_2" accept="image/*,.pdf" image={formData.documents?.[1]?.preview || (typeof formData.documents?.[1]?.file === "string" ? formData.documents?.[1]?.file : undefined)} onChange={(e) => handleDocumentUpload("document_2", e)} />
                                    </div>

                                    <div className="body_section" >
                                        <InputField type="text" label="Document 3" name="document_title_3" placeHolder="Enter document 3 title" value={formData.documents?.[2]?.title || ""} onChange={(e: any) => handleDocumentTitleChange("document_title_3", e.target ? e.target.value : e)} />
                                        <InputField type="text" label="Document 4" name="document_title_4" placeHolder="Enter document 4 title" value={formData.documents?.[3]?.title || ""} onChange={(e: any) => handleDocumentTitleChange("document_title_4", e.target ? e.target.value : e)} />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles name="document_3" accept="image/*,.pdf" image={formData.documents?.[2]?.preview || (typeof formData.documents?.[2]?.file === "string" ? formData.documents?.[2]?.file : undefined)} onChange={(e) => handleDocumentUpload("document_3", e)} />
                                        <InputFiles name="document_4" accept="image/*,.pdf" image={formData.documents?.[3]?.preview || (typeof formData.documents?.[3]?.file === "string" ? formData.documents?.[3]?.file : undefined)} onChange={(e) => handleDocumentUpload("document_4", e)} />
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(3)} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Previous School" && <div className="search_screen">
                        <>
                            <div className="popup_body" >
                                {/* 2 */}
                                <p className="search_screen_title need_margin" >Previous School</p>
                                <div className="popup_body" >
                                    <div className="fields_wrapper" >
                                        <div className="body_section" >
                                            <InputField name="previous_school_name" type="text" label="Previous School Name" placeHolder="Enter previous school name" value={formData?.previous_school_name} onChange={handleChange} />
                                            <InputField name="previous_qualification" type="text" label="Previous Qualification" placeHolder="Enter previous qualification" value={formData?.previous_qualification} onChange={handleChange} />
                                        </div>
                                        <div className="body_section" >
                                            <InputField name="previous_school_details" type="text" label="Previous School Details" placeHolder="Enter previous school details" value={formData?.previous_school_details} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(4)} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Other Info" && <div className="search_screen">
                        <>
                            {/* 1 */}
                            <p className="search_screen_title need_margin" >Transport</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        {/* <CustomSelect label="Route List" placeholder="Select route list" options={[{ label: "Pending", value: "Pending" }, "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} /> */}
                                        <CustomSelect label="Route List" placeholder="Select route list" options={[{ label: "Pending", value: "Pending" }, { label: "Solved", value: "Solved" }, { label: "In Progress", value: "In Progress" }, { label: "Closed", value: "Closed" }]} onChange={(val) => console.log("Selected:", val)} />
                                        <CustomSelect label="Vehicle Number" placeholder="Select vehicle number" options={[{ label: "Pending", value: "Pending" }, { label: "Solved", value: "Solved" }, { label: "In Progress", value: "In Progress" }, { label: "Closed", value: "Closed" }]} onChange={(val) => console.log("Selected:", val)} />
                                    </div>
                                </div>
                            </div>

                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Hostel Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <CustomSelect label="Hostel List" placeholder="Select hostel list" options={[{ label: "Pending", value: "Pending" }, { label: "Solved", value: "Solved" }, { label: "In Progress", value: "In Progress" }, { label: "Closed", value: "Closed" }]} onChange={(val) => console.log("Selected:", val)} />
                                        <CustomSelect label="Room Number" placeholder="Select room number" options={[{ label: "Pending", value: "Pending" }, { label: "Solved", value: "Solved" }, { label: "In Progress", value: "In Progress" }, { label: "Closed", value: "Closed" }]} onChange={(val) => console.log("Selected:", val)} />
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(5)} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Custom Field" && <div className="search_screen">
                        <>
                            <div className="popup_body" >
                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Submit" onClick={() => handleNextInputsTab(0, "submit")} />
                                </div>
                            </div>
                        </>
                    </div>}
                </TableWrapper>
            </div>
        </div>
    )
}

export default AddStudent;