import { useEffect, useState } from "react";
import { useFetchGeneralSettings, useUpdateGeneralSettings } from "../../../hooks/useGeneralSettings.ts";
import LoadingOverlay from "../../../components/Loadingoverlay.tsx";
import { PrimaryButton } from "../../../components/Buttons/Buttons.tsx";
import { CustomSelect } from "../../../components/InputFields/CustomSelect.tsx";
import { InputField } from "../../../components/InputFields/InputFields.tsx";
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear.ts";
import { toast } from "sonner";
import TableWrapper from "../../../components/TableWrapper.tsx";
import InputRadioButtons from "../../../components/InputRadioButtons/InputRadioButtons.tsx";



const UpdateGeneralSettings = () => {
    const { data, isLoading: generalSettingLoading, error } = useFetchGeneralSettings()
    console.log("data: dsds", data)

    const [promotionWithoutExam, setPromotionWithoutExam] = useState("");

    const [errors, setErrors] = useState<any>({});
    console.log("errors: ", errors)

    const generalSettingsForm = {
        // logo: "",
        // favicon: "",

        school_name: "",
        site_title: "",
        address: "",
        phone: "",
        email: "",
        school_code: "",
        academic_year_id: "",
        language: "",
        date_format: "",
        week_start_day: "",
        time_zone: "",
        fees_income_head: "",
        max_upload_size: "",
        promotion_without_exam: "",

        result_type: "",
        due_fees_login_restriction: "",
        currency: "",
        currency_symbol: "",
        in_news_auto_approval_comment: "",
        copyright_text: "",
    }

    const [formData, setFormData] = useState({
        school_name: "",
        site_title: "",
        address: "",
        phone: "",
        email: "",
        school_code: "",
        academic_year_id: "",
        language: "",
        date_format: "",
        week_start_day: "",
        time_zone: "",
        fees_income_head: "",
        max_upload_size: "",
        promotion_without_exam: "",

        result_type: "",
        due_fees_login_restriction: "",
        currency: "",
        currency_symbol: "",
        in_news_auto_approval_comment: "",
        copyright_text: "",

        category_of_institution: "",
        suic_code: "",
        zone: "",

    });

    console.log("formData: ", formData);

    useEffect(() => {
        if (!data) return;

        setFormData((prev) => ({
            ...prev,
            // logo: String(data?.data?.logo || ""),
            // favicon: String(data?.data?.favicon || ""),

            school_name: String(data?.data?.school_name || ""),
            site_title: String(data?.data?.site_title || ""),
            address: String(data?.data?.address || ""),
            phone: String(data?.data?.phone || ""),
            email: String(data?.data?.email || ""),
            school_code: String(data?.data?.school_code || ""),
            academic_year_id: data?.data?.academic_year_id,
            language: String(data?.data?.language || ""),
            date_format: String(data?.data?.date_format || ""),
            week_start_day: String(data?.data?.week_start_day || ""),
            time_zone: String(data?.data?.time_zone || ""),
            fees_income_head: String(data?.data?.fees_income_head || ""),
            max_upload_size: String(data?.data?.max_upload_size || ""),
            promotion_without_exam: String(data?.data?.promotion_without_exam || ""),

            result_type: String(data?.data?.result_type || ""),
            due_fees_login_restriction: String(data?.data?.due_fees_login_restriction || ""),
            currency: String(data?.data?.currency || ""),
            currency_symbol: String(data?.data?.currency_symbol || ""),
            in_news_auto_approval_comment: String(data?.data?.in_news_auto_approval_comment || ""),
            copyright_text: String(data?.data?.copyright_text || ""),

            category_of_institution: String(data?.data?.category_of_institution || ""),
            suic_code: String(data?.data?.suic_code || ""),
            zone: String(data?.data?.zone || ""),

            // multiple_roll_number: String(data?.data?.multiple_roll_number || ""),
            // subject_attendance_layout: String(data?.data?.subject_attendance_layout || ""),
            // new_fees_module: String(data?.data?.new_fees_module || ""),
            // student_admission: String(data?.data?.student_admission || ""),
            // in_news_can_comment: String(data?.data?.in_news_can_comment || ""),
            // blog_search: String(data?.data?.blog_search || ""),
            // recent_blog: String(data?.data?.recent_blog || ""),
            // carry_forward_fees_due_days: String(data?.data?.carry_forward_fees_due_days || ""),
            // queue_connection: String(data?.data?.queue_connection || ""),
        }));
    }, [data, generalSettingLoading]);

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
                fieldValue = e.target.value;
            }

            setFormData((prev) => ({
                ...prev,
                [fieldName]: fieldValue,
            }));
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    console.log(isLoading)
    const { mutateAsync: updateGeneralSettings } = useUpdateGeneralSettings()

    const handleSubmit = async () => {
        setIsLoading(true);
        const payload = new FormData();

        payload.append("school_name", formData?.school_name);
        payload.append("site_title", formData?.site_title);
        payload.append("address", formData?.address);
        payload.append("phone", formData?.phone);
        payload.append("email", formData?.email);
        payload.append("school_code", formData?.school_code);
        // payload.append("academic_year_id", formData?.academic_year_id ? String(formData.academic_year_id) : "");
        // payload.append("academic_year_id", String(formData?.academic_year_id));

        payload.append("language", formData?.language);

        payload.append("date_format", formData?.date_format);
        payload.append("week_start_day", formData?.week_start_day);
        payload.append("time_zone", formData?.time_zone);

        payload.append("fees_income_head", formData?.fees_income_head);
        payload.append("max_upload_size", formData?.max_upload_size);
        payload.append("promotion_without_exam", formData?.promotion_without_exam);

        // payload.append("admission_date", formData.admission_date);

        payload.append("result_type", formData?.result_type);
        payload.append("due_fees_login_restriction", formData?.due_fees_login_restriction);

        payload.append("currency", formData?.currency);
        payload.append("currency_symbol", formData?.currency_symbol);
        payload.append("in_news_auto_approval_comment", formData?.in_news_auto_approval_comment);
        payload.append("copyright_text", formData?.copyright_text);

        try {
            const res = await updateGeneralSettings(payload as any);
            console.log("general settings: updated", res);
            toast('General setting updated')
            // setFormData(studentForm);

            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            toast('General setting changes failed')
            console.log("aa: error:", err);
        }
    };


    /////////////////////
    const { data: academicYears } = useFetchAllAcademicYears();
    console.log("academicYears: ", academicYears)
    const formattedData = academicYears?.map((item) => ({
        label: `${item.name} (${new Date(item.start_date).toLocaleString("default", { month: "short" })} - ${new Date(item.end_date).toLocaleString("default", { month: "short" })})`,
        value: item.id,
    }));

    const languages = [{ name: "English", id: "English" }, { name: "Urdu", id: "Urdu" }, { name: "Hindi", id: "Hindi" }]?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    const weekStartDay = [{ name: "Monday", id: "Monday" }, { name: "Tuesday", id: "Tuesday" }, { name: "Wednesday", id: "Wednesday" }, { name: "Thursday", id: "Thursday" }, { name: "Friday", id: "Friday" }, { name: "Saturday", id: "Saturday" }, { name: "Sunday", id: "Sunday" }]?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    const dateFormats = [{ name: "dd/mm/yyyy", id: "dd/mm/yyyy" }, { name: "dd-mm-yyyy", id: "dd-mm-yyyy" }, { name: "mm-dd-yyyy", id: "mm-dd-yyyy" }, { name: "yyyy-mm-dd", id: "yyyy-mm-dd" }]?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    const timeZones = [{ name: "Asia/Dubai", id: "Asia/Dubai" }, { name: "Asia/Kolkata", id: "Asia/Kolkata" }, { name: "Asia/Kabul", id: "Asia/Kabul" }, { name: "Asia/Tehran", id: "Asia/Tehran" }]?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    /////////////////////

    if (generalSettingLoading || error) {
        return <LoadingOverlay />
    };

    return (
        <div className="page_wrapper">
            <div className="update_general_settings_page" >
                <TableWrapper title="Update General Settings" >
                    <div className="search_screen">
                        {/* <p className="search_screen_title need_margin" >Academic Information</p> */}
                        <div className="popup_body" >
                            <div className="fields_wrapper" >
                                <div className="body_section" >
                                    <InputField error={errors.school_name} type="text" label="School Name" placeHolder="Enter School Name" name="school_name" value={formData?.school_name} onChange={handleChange} />
                                    <InputField error={errors.site_title} type="text" label="Site Title" placeHolder="Enter Site Title" name="site_title" value={formData?.site_title} onChange={handleChange} />
                                    <CustomSelect error={errors.academic_year_id} value={formData?.academic_year_id} name="academic_year_id" label="Academic year" placeholder="Select year" options={formattedData || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, academic_year_id: value }))} />
                                </div>
                                <div className="body_section" >
                                    <InputField error={errors.admission_no} type="text" label="School Code" placeHolder="Enter School Code" name="school_code" value={formData?.school_code} onChange={handleChange} />
                                    <InputField error={errors.admission_no} type="text" label="Phone" placeHolder="Enter Phone number" name="phone" value={formData?.phone} onChange={handleChange} />
                                    <InputField error={errors.admission_no} type="text" label="Email" placeHolder="Enter Email address" name="email" value={formData?.email} onChange={handleChange} />

                                    {/* <InputField error={errors.admission_date} name="admission_date" type="date" label="Admission Date" value={formData.admission_date} placeHolder="Select date" onChange={handleChange} /> */}
                                </div>
                                <div className="body_section" >
                                    <InputField error={errors.admission_no} type="text" label="Fees Income Head" placeHolder="Enter Fees Income Head" name="fees_income_head" value={formData?.fees_income_head} onChange={handleChange} />
                                    <CustomSelect error={errors.language} value={formData?.language} name="language" label="Language" placeholder="Select Language" options={languages || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, language: value }))} />
                                    <CustomSelect error={errors.week_day} value={formData?.week_start_day} name="week_start_day" label="Week Day" placeholder="Select Week Day" options={weekStartDay || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, week_start_day: value }))} />
                                </div>
                                <div className="body_section" >
                                    <CustomSelect error={errors.date_format} value={formData?.date_format} name="date_format" label="Date Formate" placeholder="Select Date Formate" options={dateFormats || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, date_format: value }))} />
                                    <CustomSelect error={errors.time_zone} value={formData?.time_zone} name="time_zone" label="Time Zone" placeholder="Select Time Zone" options={timeZones || []} onChange={(value) => setFormData((prev: any) => ({ ...prev, time_zone: value }))} />
                                    <InputField error={errors.max_upload_size} type="text" label="Max Upload File Size (MB)" placeHolder="Max Upload File Size (MB)" name="max_upload_size" value={formData?.max_upload_size} onChange={handleChange} />
                                    {/* <InputField error={errors.admission_no} type="text" label="SS Page" placeHolder="Enter admission number" name="admission_no" value={formData?.admission_no} onChange={handleChange} /> */}
                                </div>
                                <div className="body_section" >
                                    <InputField error={errors.admission_no} type="text" label="Zone" placeHolder="Enter Zone" name="zone" value={formData?.zone} onChange={handleChange} />
                                    <InputField error={errors.admission_no} type="text" label="SUIC Code" placeHolder="Enter SUIC Code" name="suic_code" value={formData?.suic_code} onChange={handleChange} />
                                </div>
                                <div className="body_section" >
                                    <InputRadioButtons selectedValue={promotionWithoutExam || (data?.data?.promotion_without_exam || "")} name="promotion_without_exam" onChange={setPromotionWithoutExam} title="Promotion Without Exam" options={[{ label: "Enable", value: "Enable" }, { label: "Disable", value: "Disable" }]} />
                                </div>
                                <div className="body_section" >
                                    <InputField error={errors.admission_no} type="text" label="School Address" placeHolder="Enter School Address" name="school_address" value={formData?.address} onChange={handleChange} />
                                </div>
                                <div className="body_section" >
                                    <InputField error={errors.admission_no} type="text" label="Copyright Text" placeHolder="Enter Copyright Text" name="copyright_text" value={formData?.copyright_text} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="buttons">
                                {/* <SecondaryButton title="Save" /> */}
                                <PrimaryButton onClick={handleSubmit} title="Save" />
                            </div>
                        </div>

                    </div>
                </TableWrapper>
            </div>
        </div >
    )
}

export default UpdateGeneralSettings;

// const UpdateGeneralSettings = () => {
//     return (
//         <div className="update-general-settings-page" >

//         </div>
//     )
// }

// export default UpdateGeneralSettings;