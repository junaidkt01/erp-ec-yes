import { useEffect, useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import InputTitleTabs, { addStaffsTabs } from "../../../components/InputTitleTabs/InputTitleTabs.tsx"
import TableWrapper from "../../../components/TableWrapper"
import { CustomSelect } from "../../../components/InputFields/CustomSelect.tsx"
import InputFiles from "../../../components/InputFields/InputFiles.tsx"
import InputRadioButtons from "../../../components/InputRadioButtons/InputRadioButtons.tsx"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear.ts"
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass.ts"
import { useFetchAllSections } from "../../../hooks/useSections.ts"
import { useAddStudent, useFetchOneStudent, useUpdateStudent } from "../../../hooks/useStudent.ts"

import { useAuth } from "../../../auth/useAuth.ts"
import { useParams } from "react-router-dom"
import LoadingOverlay from "../../../components/Loadingoverlay.tsx"
import { toast } from "sonner"

const AddStaff = () => {
    const { staff_id } = useParams();
    const { data: student, isLoading: studentLoading, error: studentError } = useFetchOneStudent(staff_id || "")
    console.log("student: ", student)

    const [selectedInputTitleTab, setSelectedInputTitleTab] = useState(addStaffsTabs[0]);
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


    const { mutateAsync: addStudent } = useAddStudent();
    const { mutateAsync: updateStudent } = useUpdateStudent(staff_id || "");
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

    console.log("formData: ", formData)

    useEffect(() => {
        if (student && staff_id) {
            setFormData(student?.data);

            setFormData({
                academic_year_id: String(student?.data?.academic_year_id),
                admission_date: String(student?.data?.admission_date),
                admission_no: String(student?.data?.admission_no),
                birth_certificate_no: String(student?.data?.birth_certificate_no),
                blood_group: String(student?.data?.blood_group),
                caste: String(student?.data?.caste),
                current_address: String(student?.data?.current_address),
                dob: String(student?.data?.dob),
                documents: [],
                email: String(student?.data?.email),
                emergencyContacts: [],
                father_email: String(student?.data?.parents.father_email),
                father_name: String(student?.data?.parents.father_name),
                father_occupation: String(student?.data?.parents.father_occupation),
                father_phone: String(student?.data?.parents.father_phone),
                first_name: String(student?.data?.first_name),
                gender: String(student?.data?.gender),
                guardian_address: String(student?.data?.parents.guardian_address),
                guardian_email: String(student?.data?.parents.guardian_email),
                guardian_is: String(student?.data?.parents.guardian_is),
                guardian_name: String(student?.data?.parents.guardian_name),
                guardian_occupation: String(student?.data?.parents.guardian_occupation),
                guardian_phone: String(student?.data?.parents.guardian_phone),
                guardian_relation: String(student?.data?.parents.guardian_relation),
                last_name: String(student?.data?.last_name),
                mother_email: String(student?.data?.parents.mother_email),
                mother_name: String(student?.data?.parents.mother_name),
                mother_occupation: String(student?.data?.parents.mother_occupation),
                mother_phone: String(student?.data?.parents.mother_phone),
                national_id_no: String(student?.data?.national_id_no),
                note: String(student?.data?.note),
                permanent_address: String(student?.data?.permanent_address),
                phone: String(student?.data?.phone),
                previous_qualification: String(student?.data?.previous_qualification),
                previous_school_details: String(student?.data?.previous_school_details),
                previous_school_name: String(student?.data?.previous_school_name),
                religion: String(student?.data?.section_id),
                roll_no: String(student?.data?.section_id),
                section_id: String(student?.data?.section_id),
                class_id: String(student?.data?.class_id)
            })
        }
    }, [student, studentLoading, studentError])
    console.log("formData: ", formData);

    // const handleChange = (value: any, name?: string) => {
    //     if (name) {
    //         setFormData({ ...formData, [name]: value }); // for DatePicker
    //     } else {
    //         const e = value; // for normal inputs
    //         setFormData({ ...formData, [e.target.name]: e.target.value });
    //     }
    // };

    // const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();

    const { data } = useAuth();

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        setIsLoading(true);
        const payload = new FormData();

        payload.append("user_id", data?.data?.user?.id || "1");

        payload.append("admission_no", formData?.admission_no);
        payload.append("first_name", formData?.first_name);
        payload.append("email", formData?.email);
        payload.append("class_id", String(formData?.class_id));
        payload.append("section_id", String(formData?.section_id));
        payload.append("academic_year_id", String(formData?.academic_year_id));
        payload.append("gender", formData?.gender);

        payload.append("roll_no", formData?.roll_no);

        payload.append("last_name", formData?.last_name);
        payload.append("dob", formData?.dob);
        payload.append("phone", formData?.phone);

        payload.append("blood_group", formData?.blood_group);
        payload.append("religion", formData?.religion);
        payload.append("caste", formData?.caste);

        // payload.append("admission_date", formData.admission_date);

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

        // // Arrays → stringify
        payload.append("emergencyContacts", JSON.stringify(formData?.emergencyContacts));
        payload.append("documents", JSON.stringify(formData?.documents));

        try {
            if (student && staff_id) {
                const res = await updateStudent(payload as any);
                console.log("updated: res:", res);
                if (res.success) {
                    toast('Student updated successfully')
                } else {
                    toast('Student updation failed')
                }
            } else {
                const res = await addStudent(payload as any);
                console.log("aa: res:", res);
                toast('Student added successfully')
            }
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            toast('Student added failed')
            console.log("aa: error:", err);
        }
    };

    const handleNextInputsTab = (index: number, submit?: string) => {
        if (submit && readyToSubmit) {
            handleSubmit()
        } else if (submit) {
            setReadyToSubmit(true)
            setSelectedInputTitleTab(addStaffsTabs[0])
        } else {
            setSelectedInputTitleTab(addStaffsTabs[index])
        }
    }
    /////////////////////

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


    const genderOptions = [{ name: "Male", id: "Male" }, { name: "Female", id: "Female" }, { name: "Other", id: "Other" }]?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));
    console.log(gen)

    /////////////////////


    if (isLoading || studentLoading) {
        return <LoadingOverlay isLoading={true} />
    }

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
                                {siblingStaff === "from_sibling" && <CustomSelect value={formData?.class_id} label="Class" placeholder="Select class" options={classOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, class_id: value }))} />}
                                {siblingStaff === "from_sibling" && <CustomSelect value={formData?.section_id} name="section_id" label="Section" placeholder="Select section" options={sectionOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, section_id: value }))} />}
                                {siblingStaff === "from_staff" && <CustomSelect value={formData?.section_id} name="staff_id" label="Staff" placeholder="Select section" options={sectionOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, section_id: value }))} />}
                            </div>
                            {siblingStaff === "from_sibling" && <div className="body_section" >
                                <CustomSelect label="Sibling" placeholder="Select sibling" options={[{ label: "Pending", value: "Pending" }, { label: "Solved", value: "Solved" }, { label: "In Progress", value: "In Progress" }, { label: "Closed", value: "Closed" }]} onChange={(val) => console.log("Selected:", val)} />
                            </div>}

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Save" />
                            </div>
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton title={readyToSubmit ? "Details Preview" : "Add Staff"} onClick={handleAddAdmissionQuery} >
                    <InputTitleTabs tabsTitles={addStaffsTabs} onSetSelectedInputTitleTab={handleSelecteInputTitleTab} selected={selectedInputTitleTab} />

                    {(selectedInputTitleTab === "Basic Info" && readyToSubmit) && <div className="search_screen">
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
                                            <p className="value" >{formData?.admission_date || "N/A"}</p>
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
                                            <p className="title" >First Name</p>
                                            <p className="value" >{formData?.first_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Last Name</p>
                                            <p className="value" >{formData?.last_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Gender</p>
                                            <p className="value" >{formData?.gender || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="student_content_to_submit" style={{ display: "flex", justifyContent: "space-between" }} >
                                        <div>
                                            <p className="title" >Date of Birth</p>
                                            <p className="value" >{formData?.dob || "N/A"}</p>
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
                                    <PrimaryButton title={isLoading ? "Submiting" : "Submit"} onClick={() => handleNextInputsTab(0, "submit")} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {(selectedInputTitleTab === "Basic Info" && !readyToSubmit) && <div className="search_screen">
                        <>
                            {/* 1 */}
                            <p className="search_screen_title need_margin" >Staff Information</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField type="text" label="Staff Number" placeHolder="Enter staff number" name="staff_no" value={formData?.staff_no} onChange={handleChange} />
                                        <CustomSelect value={formData?.role} label="Role" placeholder="Select role" options={classOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, role: value }))} />
                                        <CustomSelect value={formData?.department} name="department" label="Department" placeholder="Select department" options={sectionOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, department: value }))} />
                                    </div>
                                    <div className="body_section" >
                                        <CustomSelect value={formData?.designation} name="designation" label="Designation" placeholder="Select designation" options={sectionOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, designation: value }))} />
                                        <InputField name="first_name" value={formData?.first_name} onChange={handleChange} type="text" label="First Name" placeHolder="Enter first name" />
                                        <InputField name="last_name" value={formData?.last_name} onChange={handleChange} type="text" label="Last Name" placeHolder="Enter last name" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="father_name" value={formData?.father_name} onChange={handleChange} type="text" label="Father Name" placeHolder="Enter father name" />
                                        <InputField name="mother_name" value={formData?.mother_name} onChange={handleChange} type="text" label="Mother Name" placeHolder="Enter mother name" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="dob" type="date" label="Date of Birth" value={formData.dob} placeHolder="Select date" onChange={handleChange} />
                                        <InputField name="email" value={formData?.email} onChange={handleChange} type="text" label="Email" placeHolder="Enter mail address" />
                                        <InputField name="date_of_joining" type="date" label="Date of Joining" value={formData.date_of_joining} placeHolder="Select date" onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* 5 */}
                            <p className="search_screen_title need_margin" >More</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputFiles title="Staff’s Photo" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="current_address" value={formData?.current_address} onChange={handleChange} type="text" label="Current Address" placeHolder="Enter current address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="permanent_address" value={formData?.permanent_address} onChange={handleChange} type="text" label="Permenant Address" placeHolder="Enter permenant address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="qualification" value={formData?.qualification} onChange={handleChange} type="text" label="Current Qualification" placeHolder="Enter qualification" />
                                        <InputField name="experience" value={formData?.experience} onChange={handleChange} type="text" label="Permenant Experience" placeHolder="Enter experience" />
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(1)} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Payroll Details" && <div className="search_screen">
                        <>
                            {/* 3 */}
                            <p className="search_screen_title need_margin" >Staff payroll Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField name="epf_no" value={formData?.epf_no} onChange={handleChange} type="text" label="EPF No" placeHolder="Enter EPF number" />
                                        <InputField name="basic_salary" value={formData?.basic_salary} onChange={handleChange} type="text" label="Basic Salary" placeHolder="Enter basic salary" />
                                    </div>
                                    <div className="body_section" >
                                        <CustomSelect value={formData?.contract_type} label="Contract Type" placeholder="Select contract type" options={classOptions || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, contract_type: value }))} />
                                        <InputField name="location" value={formData?.location} onChange={handleChange} type="text" label="Location" placeHolder="Enter location" />
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(2)} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Bank Info Details" && <div className="search_screen">
                        <>
                            {/* 1 */}
                            <p className="search_screen_title need_margin" >Staff Bank</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField name="bank_account_name" type="text" label="Bank Account Name" placeHolder="Enter bank account name" />
                                        <InputField name="account_number" type="text" label="Account Number" placeHolder="Enter account number" />
                                    </div>

                                    <div className="body_section" >
                                        <InputField type="text" label="Bank Name" placeHolder="Enter bank name" />
                                        <InputField type="text" label="Branch Name" placeHolder="Enter branch name" />
                                    </div>
                                </div>

                                <div className="buttons">
                                    <SecondaryButton title="Save" />
                                    <PrimaryButton title="Next" onClick={() => handleNextInputsTab(3)} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {selectedInputTitleTab === "Social Links Details" && <div className="search_screen">
                        <>
                            <div className="popup_body" >
                                {/* 2 */}
                                <p className="search_screen_title need_margin" >Previous School</p>
                                <div className="popup_body" >
                                    <div className="fields_wrapper" >
                                        <div className="body_section" >
                                            <InputField name="facebook_url" type="text" label="Facebook URL" placeHolder="Enter facebook url" />
                                            <InputField name="twitter_url" type="text" label="Twitter URL" placeHolder="Enter twitter url" />
                                        </div>

                                        <div className="body_section" >
                                            <InputField name="linkedin_url" type="text" label="Linkedin URL" placeHolder="Enter Linkedin url" />
                                            <InputField name="instagram_url" type="text" label="Instagram URL" placeHolder="Enter instagram url" />
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

                    {selectedInputTitleTab === "Document Info" && <div className="search_screen">
                        <>
                            {/* 2 */}
                            <p className="search_screen_title need_margin" >Files</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputFiles title="Resume" />
                                        <InputFiles title="Joining letter" />
                                        <InputFiles title="Other document" />
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

export default AddStaff;