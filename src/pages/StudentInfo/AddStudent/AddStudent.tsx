import { useEffect, useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import InputTitleTabs, { inputTitleTabs } from "../../../components/InputTitleTabs/InputTitleTabs.tsx"
import TableWrapper from "../../../components/TableWrapper"
import { CustomSelect } from "../../../components/InputFields/CustomSelect.tsx"
import InputFiles from "../../../components/InputFields/InputFiles.tsx"
import InputRadioButtons from "../../../components/InputRadioButtons/InputRadioButtons.tsx"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear.ts"
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass.ts"
import { useFetchAllSections } from "../../../hooks/useSections.ts"
import { useAddStudent } from "../../../hooks/useStudent.ts"

import "./AddStudent.scss"
import { useAuth } from "../../../auth/useAuth.ts"
import { useParams } from "react-router-dom"

const AddStudent = () => {
    const { student_id } = useParams();

    const [selectedInputTitleTab, setSelectedInputTitleTab] = useState(inputTitleTabs[0]);
    const [readyToSubmit, setReadyToSubmit] = useState(false);

    const handleSelecteInputTitleTab = (title: string) => {
        setSelectedInputTitleTab(title);
    }

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }


    const [relation, setRelation] = useState("father");
    const options = [
        { label: "Father", value: "father" },
        { label: "Mother", value: "mother" },
        { label: "Other", value: "other" },
    ];

    const [siblingStaff, setSiblingStaff] = useState("from_sibling");
    const siblingStaffOptions = [
        { label: "From Sibling", value: "from_sibling" },
        { label: "From Staff", value: "from_staff" },
    ];


    const { mutateAsync } = useAddStudent();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        class_id: "",
        section_id: "",
        academic_year_id: "",

        blood_group: "",
        religion: "",
        admission_date: "",
        admission_no: "",
        dob: "",
        gender: "",
        emergencyContacts: [{
            name: "",
            relation: "",
            phone: ""
        }],
        documents: [{
            id: 1,
            title: "",
            file: ""
        }],

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
    });

    useEffect(() => {
        console.log("formData: ", formData)
    }, [formData])

    const handleChange = (value: any, name?: string) => {
        if (name) {
            setFormData({ ...formData, [name]: value }); // for DatePicker
        } else {
            const e = value; // for normal inputs
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();

    const { data } = useAuth();

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        setIsLoading(true);
        const payload = new FormData();

        payload.append("user_id", data?.data?.user?.id || "1");

        payload.append("admission_no", formData.admission_no);
        payload.append("first_name", formData.first_name);
        payload.append("email", formData.email);
        payload.append("class_id", String(formData.class_id));
        payload.append("section_id", String(formData.section_id));
        payload.append("academic_year_id", String(formData.academic_year_id));
        payload.append("gender", formData.gender);

        payload.append("roll_no", formData.roll_no);

        payload.append("last_name", formData.last_name);
        payload.append("dob", formData.dob);
        payload.append("phone", formData.phone);

        payload.append("blood_group", formData.blood_group);
        payload.append("religion", formData.religion);
        payload.append("caste", formData.caste);

        // payload.append("admission_date", formData.admission_date);

        payload.append("current_address", formData.current_address);
        payload.append("permanent_address", formData.permanent_address);

        payload.append("father_name", formData.father_name);
        payload.append("father_phone", formData.father_phone);
        payload.append("father_email", formData.father_email);
        payload.append("father_occupation", formData.father_occupation);

        payload.append("mother_name", formData.mother_name);
        payload.append("mother_phone", formData.mother_phone);
        payload.append("mother_email", formData.mother_email);
        payload.append("mother_occupation", formData.mother_occupation);

        payload.append("guardian_name", formData.guardian_name);
        payload.append("guardian_phone", formData.guardian_phone);
        payload.append("guardian_email", formData.guardian_email);
        payload.append("guardian_occupation", formData.guardian_occupation);
        payload.append("guardian_relation", formData.guardian_relation);
        payload.append("guardian_address", formData.guardian_address);
        payload.append("guardian_is", formData.guardian_is);

        payload.append("national_id_no", formData.national_id_no);
        payload.append("birth_certificate_no", formData.birth_certificate_no);
        payload.append("note", formData.note);

        payload.append("previous_school_name", formData.previous_school_name);
        payload.append("previous_qualification", formData.previous_qualification);
        payload.append("previous_school_details", formData.previous_school_details);

        // // Arrays → stringify
        payload.append("emergencyContacts", JSON.stringify(formData.emergencyContacts));
        payload.append("documents", JSON.stringify(formData.documents));

        try {
            const res = await mutateAsync(payload as any);
            console.log("aa: res:", res);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.log("aa: error:", err);
        }
    };

    const handleNextInputsTab = (index: number, submit?: string) => {
        if (submit && readyToSubmit) {
            handleSubmit()
        } else if (submit) {
            setReadyToSubmit(true)
            setSelectedInputTitleTab(inputTitleTabs[0])
        } else {
            setSelectedInputTitleTab(inputTitleTabs[index])
        }
    }
    /////////////////////

    const { data: academicYears } = useFetchAllAcademicYears();
    const formattedData = academicYears?.map((item) => ({
        id: item.id,
        label: `${item.name} (${new Date(item.start_date).toLocaleString("default", { month: "short" })} - ${new Date(item.end_date).toLocaleString("default", { month: "short" })})`,
    }));

    const { data: studentClasses } = useFetchAllStudentClasses();
    const { data: sections } = useFetchAllSections();

    /////////////////////

    return (
        <div className="page_wrapper">
            <div className="add_student" >
                {isAddAdmissionQuery && <PopupScreen title="Add Admission Query" onClick={handleAddAdmissionQuery} >
                    <div className="popup_body" >
                        <div className="fields_wrapper">
                            <div className="body_section" >
                                <InputRadioButtons
                                    options={siblingStaffOptions}
                                    selectedValue={siblingStaff}
                                    onChange={setSiblingStaff}
                                    name="sibling_staff"
                                />
                            </div>
                            <div className="body_section" >
                                {siblingStaff === "from_sibling" && <CustomSelect label="Class" placeholder="Select class" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />}
                                <CustomSelect label="Section" placeholder="Select section" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>
                            {siblingStaff === "from_sibling" && <div className="body_section" >
                                <CustomSelect label="Sibling" placeholder="Select sibling" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>}

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Save" />
                            </div>
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton title={readyToSubmit ? "Details Preview" : "Add Student"} onClick={handleAddAdmissionQuery} >
                    <InputTitleTabs onSetSelectedInputTitleTab={handleSelecteInputTitleTab} selected={selectedInputTitleTab} />

                    {(selectedInputTitleTab === "Personal Details" && readyToSubmit) && <div className="search_screen">
                        <>
                            <p className="search_screen_title need_margin" >Academic Information</p>
                            <div className="popup_body" >
                                <div className="student_content_to_submit_wrapper" style={{ display: "grid", gap: "24px" }} >
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >Academic Year</p>
                                            <p className="value" >{formData.academic_year_id || "N/A"}</p>
                                            {/* <p className="value" >{academicYears?.find((item) => String(item.id) === formData.academic_year_id)?.name}</p> */}
                                        </div>
                                        <div>
                                            <p className="title" >Class</p>
                                            <p className="value" >{formData.class_id || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Section</p>
                                            <p className="value" >{formData.section_id || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >Admission Number</p>
                                            <p className="value" >{formData.admission_no || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Admission Date</p>
                                            <p className="value" >{formData.admission_date || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Roll Number</p>
                                            <p className="value" >{formData.roll_no || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="search_screen_title need_margin" >Personal Info</p>
                            <div className="popup_body" >
                                <div className="student_content_to_submit_wrapper" style={{ display: "grid", gap: "24px" }} >
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >First Name</p>
                                            <p className="value" >{formData.first_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Last Name</p>
                                            <p className="value" >{formData.last_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Gender</p>
                                            <p className="value" >{formData.gender || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >Date of Birth</p>
                                            <p className="value" >{formData.dob || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Religion</p>
                                            <p className="value" >{formData.religion || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Caste</p>
                                            <p className="value" >{formData.caste || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="buttons">
                                    <PrimaryButton title={isLoading ? "Submiting" : "Submit"} onClick={() => handleNextInputsTab(0, "submit")} />
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
                                        <CustomSelect name="academic_year_id" label="Academic year" placeholder="Select year" options={formattedData} onChange={(value) => setFormData((prev) => ({ ...prev, academic_year_id: value }))} />
                                        <CustomSelect name="class_id" label="Class" placeholder="Select class" options={studentClasses} onChange={(value) => setFormData((prev) => ({ ...prev, class_id: value }))} />
                                        <CustomSelect name="section_id" label="Section" placeholder="Select section" options={sections} onChange={(value) => setFormData((prev) => ({ ...prev, section_id: value }))} />
                                    </div>
                                    <div className="body_section" >
                                        <InputField type="text" label="Admission Number" placeHolder="Enter admission number" name="admission_no" value={formData.admission_no} onChange={handleChange} />
                                        {/* <InputField name="admission_date" type="date" label="Admission Date" value={formData.admission_date} placeHolder="Select date" onChange={handleChange} /> */}
                                        <InputField name="email" value={formData.email} onChange={handleChange} type="text" label="Email" placeHolder="Enter mail address" />
                                        <InputField name="roll_no" value={formData.roll_no} onChange={handleChange} type="text" label="Roll Number" placeHolder="Enter roll number" />
                                    </div>
                                </div>
                            </div>

                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Personal Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField type="text" label="First Name" placeHolder="Enter name" name="first_name" value={formData.first_name} onChange={handleChange} />
                                        <InputField type="text" label="Last Name" placeHolder="Enter name" name="last_name" value={formData.last_name} onChange={handleChange} />
                                        <CustomSelect name="gender" label="Gender" placeholder="Select gender" options={["Male", "Female", "Other"]} onChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))} />
                                    </div>
                                    <div className="body_section" >
                                        {/* <InputField name="dob" type="date" label="Date Of Birth" value={formData.dob} placeHolder="Select date" onChange={handleChange} /> */}
                                        <CustomSelect name="religion" label="Religion" placeholder="Select religion" options={["Muslim", "Hindu", "Christian"]} onChange={(value) => setFormData((prev) => ({ ...prev, religion: value }))} />
                                        <InputField name="caste" value={formData.caste} onChange={handleChange} type="text" label="Cast" placeHolder="Enter cast" />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles title="Student photo" />
                                    </div>
                                </div>
                            </div>


                            {/* 3 */}
                            {/* <p className="search_screen_title need_margin" >Contact Information</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField type="text" label="Email Address" placeHolder="Enter email address" name="email" value={formData.email} onChange={handleChange} />
                                        <InputField type="text" label="Phone Number" placeHolder="Enter phone number" name="phone" value={formData.phone} onChange={handleChange} />
                                    </div>
                                    <div className="body_section" >
                                        <InputField type="date" label="Date Of Birth" placeHolder="Select date" />
                                    </div>
                                </div>
                            </div> */}

                            {/* 4 */}
                            <p className="search_screen_title need_margin" >Student Address</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField name="current_address" value={formData.current_address} onChange={handleChange} type="text" label="Current Address" placeHolder="Enter current address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="permanent_address" value={formData.permanent_address} onChange={handleChange} type="text" label="Permenant Address" placeHolder="Enter permenant address" />
                                    </div>
                                </div>
                            </div>

                            {/* 5 */}
                            <p className="search_screen_title need_margin" >Medical Record</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <CustomSelect name="blood_group" label="Blood Group" placeholder="Select blood group" options={["A+", "O+", "B+", "AB+", "A-", "O-", "B-", "AB-"]} onChange={(value) => setFormData((prev) => ({ ...prev, blood_group: value }))} />
                                        {/* <CustomSelect label="Category" placeholder="Select category" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} /> */}
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(1)} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Family / Contact" && <div className="search_screen">
                        <>
                            {/* 1 */}
                            <p className="search_screen_title need_margin" >Father Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField name="father_name" type="text" label="Father Name" placeHolder="Enter father name" value={formData.father_name} onChange={handleChange} />
                                        <InputField name="father_phone" type="text" label="Father Phone Number" placeHolder="Enter phone number" value={formData.father_phone} onChange={handleChange} />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles title="Father’s Photo" />
                                    </div>
                                </div>
                            </div>

                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Mother Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField name="mother_name" type="text" label="Mother Name" placeHolder="Enter Mother name" value={formData.mother_name} onChange={handleChange} />
                                        <InputField name="mother_phone" type="text" label="Mother Phone Number" placeHolder="Enter phone number" value={formData.mother_phone} onChange={handleChange} />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles title="Mother’s Photo" />
                                    </div>
                                    <div className="body_section" >
                                        <div className="add_additional_contact" onClick={handleAddAdmissionQuery} >
                                            <p>Add Additional Contact</p>
                                            <img src="/svgs/+.svg" alt="" />
                                        </div>
                                    </div>
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
                                        <InputField name="guardian_name" value={relation === "father" ? formData.father_name : relation === "mother" ? formData.mother_name : formData.guardian_name} onChange={handleChange} type="text" label={`${relation.charAt(0).toUpperCase() + relation.slice(1)} Name`} placeHolder={`Enter ${relation} name`} />
                                        <InputField name="guardian_phone" value={relation === "father" ? formData.father_phone : relation === "mother" ? formData.mother_phone : formData.guardian_phone} onChange={handleChange} type="text" label="Phone Number" placeHolder="Enter phone number" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="guardian_relation" value={formData.guardian_relation} onChange={handleChange} type="text" label="Relation With Guardian" placeHolder="Enter relation with guardian" />
                                        <InputField name="guardian_email" value={formData.guardian_email} onChange={handleChange} type="text" label="Guardian Email" placeHolder="Enter guardian's email address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="guardian_address" value={formData.guardian_address} onChange={handleChange} type="text" label="Guardian Address" placeHolder="Enter guardian's address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles title="Guardian Photo" />
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(2)} />
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
                                        <InputField name="national_id_no" value={formData.national_id_no} onChange={handleChange} type="text" label="Adhaar Number" placeHolder="Enter national id card" />
                                        <InputField name="birth_certificate_no" value={formData.birth_certificate_no} onChange={handleChange} type="text" label="Birth cerifiate number" placeHolder="Enter brith certificate number" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="note" value={formData.note} onChange={handleChange} type="text" label="Additional Notes" placeHolder="Enter additional notes" />
                                    </div>
                                </div>
                            </div>

                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Document Attachment</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField type="text" label="Document 1" placeHolder="Enter document 1 title" />
                                        <InputField type="text" label="Document 2" placeHolder="Enter document 2 title" />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles />
                                        <InputFiles />
                                    </div>

                                    <div className="body_section" >
                                        <InputField type="text" label="Document 3" placeHolder="Enter document 3 title" />
                                        <InputField type="text" label="Document 4" placeHolder="Enter document 4 title" />
                                    </div>
                                    <div className="body_section" >
                                        <InputFiles />
                                        <InputFiles />
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
                                            <InputField name="previous_school_name" type="text" label="Previous School Name" placeHolder="Enter previous school name" value={formData.previous_school_name} onChange={handleChange} />
                                            <InputField name="previous_qualification" type="text" label="Previous Qualification" placeHolder="Enter previous qualification" value={formData.previous_qualification} onChange={handleChange} />
                                        </div>
                                        <div className="body_section" >
                                            <InputField name="previous_school_details" type="text" label="Previous School Details" placeHolder="Enter previous school details" value={formData.previous_school_details} onChange={handleChange} />
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
                                        <CustomSelect label="Route List" placeholder="Select route list" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                        <CustomSelect label="Vehicle Number" placeholder="Select vehicle number" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                    </div>
                                </div>
                            </div>

                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Hostel Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <CustomSelect label="Hostel List" placeholder="Select hostel list" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                        <CustomSelect label="Room Number" placeholder="Select room number" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(5)} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Custom Data" && <div className="search_screen">
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