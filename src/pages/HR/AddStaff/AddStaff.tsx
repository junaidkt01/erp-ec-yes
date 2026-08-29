import { useEffect, useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import InputTitleTabs, { addStaffsTabs } from "../../../components/InputTitleTabs/InputTitleTabs.tsx"
import TableWrapper from "../../../components/TableWrapper"
import { CustomSelect } from "../../../components/InputFields/CustomSelect.tsx"
import InputFiles from "../../../components/InputFields/InputFiles.tsx"
import { useAddStaff, useUpdateStaff, useFetchOneStaff } from "../../../hooks/useStaff.ts"

import { useAuth } from "../../../auth/useAuth.ts"
import { useParams } from "react-router-dom"
import LoadingOverlay from "../../../components/Loadingoverlay.tsx"
import { toast } from "sonner"
import StaffBulkUpload from "../../../components/BulkUpload/StaffBulkUpload.tsx"
import { STAFF_CATEGORY_OPTIONS } from "../../../utils/studentOptions.ts"

const AddStaff = () => {
    const { staff_id } = useParams();
    const { data: staff, isLoading: staffLoading } = useFetchOneStaff(staff_id || "")

    const [selectedInputTitleTab, setSelectedInputTitleTab] = useState(addStaffsTabs[0]);
    const [readyToSubmit, setReadyToSubmit] = useState(false);

    const handleSelecteInputTitleTab = (title: string) => {
        setSelectedInputTitleTab(title);
    }

    const [isImportStaff, setIsImportStaff] = useState(false);
    const handleImportStaff = () => {
        setIsImportStaff(!isImportStaff);
    }

    const { mutateAsync: addStaff } = useAddStaff();
    const { mutateAsync: updateStaff } = useUpdateStaff(staff_id || "");

    const [formData, setFormData] = useState({
        staff_code: "",
        category: "",
        email: "",
        role: "",
        staff_no: "",
        phone: "",
        designation: "",
        first_name: "",
        last_name: "",
        father_name: "",
        mother_name: "",
        gender: "",
        dob: "",
        date_of_joining: "",
        marital_status: "",
        emergency_mobile: "",
        driving_license: "",
        photo: null as File | null,
        is_expert_staff: false,
        current_address: "",
        permanent_address: "",
        qualifications: "",
        experience: "",
        facebook_url: "",
        twitter_url: "",
        linkedin_url: "",
        instagram_url: "",
        resume: null as File | null,
        joining_letter: null as File | null,
        other_document: null as File | null,
        bank_account_name: "",
        bank_account_no: "",
        bank_name: "",
        bank_branch_name: "",
        epf_no: "",
        basic_salary: null as number | null,
        contract_type: "",
        location: "",
    });
    console.log("formData: ", formData);

    useEffect(() => {
        if (!staff || !staff_id) return;

        const data = staff.data || {};

        setFormData((prev) => ({
            ...prev,
            staff_code: String(data.staff_code || ""),
            category: String(data.category || ""),
            email: String(data.email || ""),
            role: String(data.role || ""),
            staff_no: String(data.staff_no || ""),
            phone: String(data.phone || ""),
            designation: String(data.designation || ""),
            first_name: String(data.first_name || ""),
            last_name: String(data.last_name || ""),
            father_name: String(data.father_name || ""),
            mother_name: String(data.mother_name || ""),
            gender: String(data.gender || ""),
            dob: String(data.dob || ""),
            date_of_joining: String(data.date_of_joining || ""),
            marital_status: String(data.marital_status || ""),
            emergency_mobile: String(data.emergency_mobile || ""),
            driving_license: String(data.driving_license || ""),
            is_expert_staff: Boolean(data.is_expert_staff || false),
            current_address: String(data.current_address || ""),
            permanent_address: String(data.permanent_address || ""),
            qualifications: String(data.qualifications || ""),
            experience: String(data.experience || ""),
            facebook_url: String(data.facebook_url || ""),
            twitter_url: String(data.twitter_url || ""),
            linkedin_url: String(data.linkedin_url || ""),
            instagram_url: String(data.instagram_url || ""),
            bank_account_name: String(data.bank_account_name || ""),
            bank_account_no: String(data.bank_account_no || ""),
            bank_name: String(data.bank_name || ""),
            bank_branch_name: String(data.bank_branch_name || ""),
            epf_no: String(data.epf_no || ""),
            basic_salary: Number(data.basic_salary || ""),
            contract_type: String(data.contract_type || ""),
            location: String(data.location || ""),
        }));
    }, [staff, staff_id]);

    const handleChange = (value: any, name?: string) => {
        if (name) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            const e = value;
            const fieldName = e.target.name;
            let fieldValue;

            if (e.target.files) {
                fieldValue = e.target.files[0];
            } else if (e.target.type === "checkbox") {
                fieldValue = e.target.checked;
            } else {
                fieldValue = e.target.value;
            }

            setFormData((prev) => ({
                ...prev,
                [fieldName]: fieldValue,
            }));
        }
    };

    const { data } = useAuth();
    console.log(data)

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        setIsLoading(true);
        const payload = new FormData();

        payload.append("staff_code", formData?.staff_code);
        payload.append("category", formData?.category);
        payload.append("email", formData?.email);
        payload.append("role", formData?.role);
        payload.append("staff_no", String(formData?.staff_no));
        payload.append("phone", formData?.phone);
        payload.append("designation", String(formData?.designation));
        payload.append("first_name", formData?.first_name);
        payload.append("last_name", formData?.last_name);
        payload.append("father_name", formData?.father_name);
        payload.append("mother_name", formData?.mother_name);
        payload.append("gender", formData?.gender);
        payload.append("dob", formData?.dob);
        payload.append("date_of_joining", formData?.date_of_joining);
        payload.append("marital_status", formData?.marital_status);
        payload.append("emergency_mobile", formData?.emergency_mobile);
        payload.append("driving_license", formData?.driving_license);
        payload.append("is_expert_staff", String(formData?.is_expert_staff));
        payload.append("current_address", formData?.current_address);
        payload.append("permanent_address", formData?.permanent_address);
        payload.append("qualifications", formData?.qualifications);
        payload.append("experience", formData?.experience);
        payload.append("facebook_url", formData?.facebook_url);
        payload.append("twitter_url", formData?.twitter_url);
        payload.append("linkedin_url", formData?.linkedin_url);
        payload.append("instagram_url", formData?.instagram_url);
        payload.append("bank_account_name", formData?.bank_account_name);
        payload.append("bank_account_no", formData?.bank_account_no);
        payload.append("bank_name", formData?.bank_name);
        payload.append("bank_branch_name", formData?.bank_branch_name);
        payload.append("epf_no", formData?.epf_no);
        payload.append("basic_salary", String(formData?.basic_salary));
        payload.append("contract_type", formData?.contract_type);
        payload.append("location", formData?.location);

        if (formData.photo) payload.append("photo", formData.photo);
        if (formData.resume) payload.append("resume", formData.resume);
        if (formData.joining_letter) payload.append("joining_letter", formData.joining_letter);
        if (formData.other_document) payload.append("other_document", formData.other_document);

        try {
            if (staff && staff_id) {
                const res = await updateStaff(payload);
                if (res.success) {
                    toast.success('Staff updated successfully')
                } else {
                    toast.error('Staff updation failed')
                }
            } else {
                const res = await addStaff(payload);
                if (res.success) {
                    toast.success('Staff added successfully')
                } else {
                    toast.error('Staff addition failed')
                }
            }
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            toast.error('Operation failed')
            console.error("Submit error:", err);
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

    const genderOptions = [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" }
    ];

    const maritalStatusOptions = [
        { label: "Single", value: "single" },
        { label: "Married", value: "married" },
    ];

    const expertStaffOptions = [
        { label: "Yes", value: "1" },
        { label: "No", value: "0" },
    ];

    if (isLoading || staffLoading) {
        return <LoadingOverlay isLoading={true} />
    }

    return (
        <div className="page_wrapper">
            <div className="add_student" >
                {isImportStaff && <PopupScreen title="Bulk Upload Staff" onClick={handleImportStaff} >
                    <div className="popup_body" >
                        <div className="fields_wrapper" >
                            <StaffBulkUpload onClick={handleImportStaff} />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton title={readyToSubmit ? "Details Preview" : "Add Staff"} onClick={handleImportStaff} >
                    <InputTitleTabs tabsTitles={addStaffsTabs} onSetSelectedInputTitleTab={handleSelecteInputTitleTab} selected={selectedInputTitleTab} />

                    {(selectedInputTitleTab === "Basic Info" && readyToSubmit) && <div className="search_screen">
                        <>
                            <p className="search_screen_title need_margin" >Staff Information</p>
                            <div className="popup_body" >
                                <div className="student_content_to_submit_wrapper">
                                    <div className="student_content_to_submit">
                                        <div>
                                            <p className="title" >Staff ID</p>
                                            <p className="value" >{formData?.staff_code || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Category</p>
                                            <p className="value" >{formData?.category || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Staff Number</p>
                                            <p className="value" >{formData?.staff_no || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="student_content_to_submit">
                                        <div>
                                            <p className="title" >Role</p>
                                            <p className="value" >{formData?.role || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Designation</p>
                                            <p className="value" >{formData?.designation || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >First Name</p>
                                            <p className="value" >{formData?.first_name || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="student_content_to_submit">
                                        <div>
                                            <p className="title" >Last Name</p>
                                            <p className="value" >{formData?.last_name || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="search_screen_title need_margin" >Personal Info</p>
                            <div className="popup_body" >
                                <div className="student_content_to_submit_wrapper">
                                    <div className="student_content_to_submit">
                                        <div>
                                            <p className="title" >Father Name</p>
                                            <p className="value" >{formData?.father_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Mother Name</p>
                                            <p className="value" >{formData?.mother_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Gender</p>
                                            <p className="value" >{formData?.gender || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="student_content_to_submit">
                                        <div>
                                            <p className="title" >Date of Birth</p>
                                            <p className="value" >{formData?.dob || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Email</p>
                                            <p className="value" >{formData?.email || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="title" >Date of Joining</p>
                                            <p className="value" >{formData?.date_of_joining || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="buttons">
                                    <PrimaryButton title={isLoading ? "Submitting" : "Submit"} onClick={() => handleNextInputsTab(0, "submit")} />
                                </div>
                            </div>
                        </>
                    </div>}

                    {(selectedInputTitleTab === "Basic Info" && !readyToSubmit) && <div className="search_screen">
                        <>
                            <p className="search_screen_title need_margin" >Staff Information</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField type="text" label="Staff ID" placeHolder="Enter staff ID" name="staff_code" value={formData?.staff_code} onChange={handleChange} />
                                        <InputField type="text" label="Staff Number" placeHolder="Enter staff number" name="staff_no" value={formData?.staff_no} onChange={handleChange} />
                                        <CustomSelect value={formData?.category} label="Category" placeholder="Select category" options={STAFF_CATEGORY_OPTIONS} onChange={(val) => setFormData((prev: any) => ({ ...prev, category: val }))} />
                                    </div>
                                    <div className="body_section" >
                                        <InputField type="text" label="Role" placeHolder="Enter role" name="role" value={formData?.role} onChange={handleChange} />
                                        <InputField type="text" label="Designation" placeHolder="Enter designation" name="designation" value={formData?.designation} onChange={handleChange} />
                                        <InputField name="first_name" value={formData?.first_name} onChange={handleChange} type="text" label="First Name" placeHolder="Enter first name" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="last_name" value={formData?.last_name} onChange={handleChange} type="text" label="Last Name" placeHolder="Enter last name" />
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

                            <p className="search_screen_title need_margin" >More</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputFiles name="photo" title="Staff's Photo" onChange={handleChange} />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="phone" value={formData?.phone} onChange={handleChange} type="text" label="Phone" placeHolder="Enter phone number" />
                                        <InputField name="emergency_mobile" value={formData?.emergency_mobile} onChange={handleChange} type="text" label="Emergency Mobile" placeHolder="Enter emergency mobile" />
                                    </div>
                                    <div className="body_section" >
                                        <CustomSelect value={formData?.gender} label="Gender" placeholder="Select gender" options={genderOptions} onChange={(value) => setFormData((prev: any) => ({ ...prev, gender: value }))} />
                                        <CustomSelect value={formData?.marital_status} label="Marital Status" placeholder="Select marital status" options={maritalStatusOptions} onChange={(value) => setFormData((prev: any) => ({ ...prev, marital_status: value }))} />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="current_address" value={formData?.current_address} onChange={handleChange} type="text" label="Current Address" placeHolder="Enter current address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="permanent_address" value={formData?.permanent_address} onChange={handleChange} type="text" label="Permanent Address" placeHolder="Enter permanent address" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="qualifications" value={formData?.qualifications} onChange={handleChange} type="text" label="Current Qualification" placeHolder="Enter qualification" />
                                        <InputField name="experience" value={formData?.experience} onChange={handleChange} type="text" label="Experience" placeHolder="Enter experience" />
                                    </div>
                                    <div className="body_section" >
                                        <CustomSelect value={formData?.is_expert_staff} label="Expert Staff" placeholder="Select" options={expertStaffOptions} onChange={(value) => setFormData((prev: any) => ({ ...prev, is_expert_staff: value }))} />
                                        {/* <InputField name="mother_phone" value={formData?.mother_phone} onChange={handleChange} type="text" label="Mother Phone" placeHolder="Enter mother phone" /> */}
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
                            <p className="search_screen_title need_margin" >Staff Payroll Info</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField name="epf_no" value={formData?.epf_no} onChange={handleChange} type="text" label="EPF No" placeHolder="Enter EPF number" />
                                        <InputField name="basic_salary" value={formData?.basic_salary} onChange={handleChange} type="text" label="Basic Salary" placeHolder="Enter basic salary" />
                                    </div>
                                    <div className="body_section" >
                                        <InputField name="contract_type" value={formData?.contract_type} onChange={handleChange} type="text" label="Contract Type" placeHolder="Enter contract type" />
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
                            <p className="search_screen_title need_margin" >Staff Bank</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputField name="bank_account_name" value={formData?.bank_account_name} onChange={handleChange} type="text" label="Bank Account Name" placeHolder="Enter bank account name" />
                                        <InputField name="bank_account_no" value={formData?.bank_account_no} onChange={handleChange} type="text" label="Account Number" placeHolder="Enter account number" />
                                    </div>

                                    <div className="body_section" >
                                        <InputField name="bank_name" value={formData?.bank_name} onChange={handleChange} type="text" label="Bank Name" placeHolder="Enter bank name" />
                                        <InputField name="bank_branch_name" value={formData?.bank_branch_name} onChange={handleChange} type="text" label="Branch Name" placeHolder="Enter branch name" />
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
                                <p className="search_screen_title need_margin" >Social Links</p>
                                <div className="popup_body" >
                                    <div className="fields_wrapper" >
                                        <div className="body_section" >
                                            <InputField name="facebook_url" value={formData?.facebook_url} onChange={handleChange} type="text" label="Facebook URL" placeHolder="Enter facebook url" />
                                            <InputField name="twitter_url" value={formData?.twitter_url} onChange={handleChange} type="text" label="Twitter URL" placeHolder="Enter twitter url" />
                                        </div>

                                        <div className="body_section" >
                                            <InputField name="linkedin_url" value={formData?.linkedin_url} onChange={handleChange} type="text" label="Linkedin URL" placeHolder="Enter Linkedin url" />
                                            <InputField name="instagram_url" value={formData?.instagram_url} onChange={handleChange} type="text" label="Instagram URL" placeHolder="Enter instagram url" />
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
                            <p className="search_screen_title need_margin" >Files</p>
                            <div className="popup_body" >
                                <div className="fields_wrapper" >
                                    <div className="body_section" >
                                        <InputFiles name="resume" title="Resume" onChange={handleChange} />
                                        <InputFiles name="joining_letter" title="Joining letter" onChange={handleChange} />
                                        <InputFiles name="other_document" title="Other document" onChange={handleChange} />
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

