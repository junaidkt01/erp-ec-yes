import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../../components/Buttons/Buttons";
import InputFiles from "../../../components/InputFields/InputFiles";
import { GENERAL_SETTINGS_KEY, useUploadGeneralSettingsFavicon, useUploadGeneralSettingsLogo, type GeneralSettings as GeneralSettingsData } from "../../../hooks/useGeneralSettings";
import "./GeneralSettings.scss";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const GeneralSettings = () => {
    const navigate = useNavigate();

    // const { data, isLoading, error } = useFetchGeneralSettings()
    // console.log("data: dsds", data)

    const queryClient = useQueryClient();

    const data = queryClient.getQueryData<GeneralSettingsData>(GENERAL_SETTINGS_KEY);

    // const { data: academicYears } = useFetchAllAcademicYears();
    // const academicYearData = academicYears?.find(
    //     (item) => String(item.id) === String(data?.data?.academic_year_id)
    // );

    // console.log("academicYears: ", academicYears)
    // console.log("academicYearData: ", academicYearData)

    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);

    const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);
    const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);

    const { mutate: uploadLogo, isPending: logoPending } = useUploadGeneralSettingsLogo();
    const { mutate: uploadFavicon, isPending: faviconPending } = useUploadGeneralSettingsFavicon();

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setSelectedLogo(file);

        // Preview image
        const imageUrl = URL.createObjectURL(file);
        setPreviewLogo(imageUrl);
    };

    const handleSaveLogo = () => {
        if (!selectedLogo) return;

        uploadLogo(selectedLogo, {
            onSuccess: () => {
                toast("Logo uploaded successfully");
                setSelectedLogo(null);
                setPreviewLogo(null);
            },
            onError: (error) => {
                console.error(error);
                toast("Logo uploaded failed");
            },
        });
    };

    const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setSelectedFavicon(file);

        // Preview image
        const imageUrl = URL.createObjectURL(file);
        setPreviewFavicon(imageUrl);
    };

    const handleSaveFavicon = () => {
        if (!selectedFavicon) return;

        uploadFavicon(selectedFavicon, {
            onSuccess: () => {
                console.log("Uploaded successfully");
                toast("Favicon uploaded successfully");
                setSelectedFavicon(null);
                setPreviewFavicon(null);
            },
            onError: (error) => {
                console.error(error);
                toast("Favicon uploaded failed");
            },
        });
    };

    // if (isLoading || error) {
    //     return <LoadingOverlay />
    // };

    return (
        <div className="page_wrapper" >
            <div className="general_settings_page" >
                <div className="general_settings_title" >
                    <h2>General Settings</h2>
                </div>

                <div className="general_setting_section" >
                    <div className="tab_inputs_wrapper" >
                        <div className="settings_icon_input" >
                            <InputFiles image={previewLogo || data?.data?.logo} accept="image/*" name="logo" onChange={handleLogoUpload} title="Change Logo" />
                            <PrimaryButton onClick={handleSaveLogo} disabled={!selectedLogo || logoPending} title={logoPending ? "Saving..." : "Save"} />
                        </div>
                        <div className="settings_icon_input" >
                            <InputFiles image={previewFavicon || data?.data?.favicon} accept="image/*" name="favicon" onChange={handleFaviconUpload} title="Change Favicon" />
                            <PrimaryButton onClick={handleSaveFavicon} disabled={!selectedFavicon || faviconPending} title={faviconPending ? "Saving..." : "Save"} />
                        </div>
                    </div>

                    <div className="tab_content_wrapper" >
                        <div className="tab_title" >
                            <h1>General Settings View</h1>
                            <PrimaryButton onClick={() => navigate("/settings-section/update-general-settings")} title="Edit" />
                        </div>
                        <div className="tab-content">
                            <div className="details-list">
                                <div className="detail-row" >
                                    <div className="label">School Name</div>
                                    <div className="value">{data?.data?.school_name}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Zone</div>
                                    <div className="value">{data?.data?.zone}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">SUIC Code</div>
                                    <div className="value">{data?.data?.suic_code}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Site Title</div>
                                    <div className="value">{data?.data?.site_title}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Address</div>
                                    <div className="value">{data?.data?.address}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Phone Number</div>
                                    <div className="value">{data?.data?.phone}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Email Address</div>
                                    <div className="value">{data?.data?.email}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">State</div>
                                    <div className="value">{data?.data?.state}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Academic Year</div>
                                    {/* <div className="value">{academicYearData}</div> */}
                                    <div className="value">{data?.data?.academic_year_id}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Language</div>
                                    <div className="value">{data?.data?.language}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Date Format</div>
                                    <div className="value">{data?.data?.date_format}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Week Start Day</div>
                                    <div className="value">{data?.data?.week_start_day}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Time Zone</div>
                                    <div className="value">{data?.data?.time_zone}</div>
                                </div>
                                {/* <div className="detail-row" >
                                    <div className="label">Currency</div>
                                    <div className="value">{data?.data?.currency}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Currency Symbol</div>
                                    <div className="value">{data?.data?.currency_symbol}</div>
                                </div> */}
                                <div className="detail-row" >
                                    <div className="label">Max Upload File Size</div>
                                    <div className="value">{data?.data?.max_upload_size}</div>
                                </div>
                                {/* <div className="detail-row" >
                                    <div className="label">Multiple Roll Number</div>
                                    <div className="value">{data?.data?.multiple_roll_number}</div>
                                </div> */}
                                <div className="detail-row" >
                                    <div className="label">Promotion Without Exam</div>
                                    <div className="value">{data?.data?.promotion_without_exam}</div>
                                </div>
                                {/* <div className="detail-row" >
                                    <div className="label">Subject Attendance Layout</div>
                                    <div className="value">{data?.data?.subject_attendance_layout}</div>
                                </div> */}
                                {/* <div className="detail-row" >
                                    <div className="label">New Fees Module</div>
                                    <div className="value">{data?.data?.new_fees_module}</div>
                                </div> */}
                                <div className="detail-row" >
                                    <div className="label">Result Type</div>
                                    <div className="value">{data?.data?.result_type}</div>
                                </div>
                                {/* <div className="detail-row" >
                                    <div className="label">Student Admission</div>
                                    <div className="value">{data?.data?.student_admission}</div>
                                </div> */}
                                <div className="detail-row" >
                                    <div className="label">Due Fees Login Restriction</div>
                                    <div className="value">{data?.data?.due_fees_login_restriction}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">In News Auto Approval Comment</div>
                                    <div className="value">{data?.data?.in_news_auto_approval_comment}</div>
                                </div>
                                {/* <div className="detail-row" >
                                    <div className="label">In News Can Comment</div>
                                    <div className="value">{data?.data?.in_news_can_comment}</div>
                                </div> */}
                                {/* <div className="detail-row" >
                                    <div className="label">Blog Search</div>
                                    <div className="value">{data?.data?.blog_search}</div>
                                </div> */}
                                {/* <div className="detail-row" >
                                    <div className="label">Recent Blog</div>
                                    <div className="value">{data?.data?.recent_blog}</div>
                                </div> */}
                                {/* <div className="detail-row" >
                                    <div className="label">Carry Forward Fees Due Days</div>
                                    <div className="value">{data?.data?.carry_forward_fees_due_days}</div>
                                </div>
                                <div className="detail-row" >
                                    <div className="label">Queue Connection</div>
                                    <div className="value">{data?.data?.queue_connection}</div>
                                </div> */}
                                <div className="detail-row" >
                                    <div className="label">Copyright Text</div>
                                    <div className="value">{data?.data?.copyright_text}</div>
                                </div>

                                {/* {profileDetails?.map((item: any) => (
                                    <div className="detail-row" key={item.label}>
                                        <div className="label">{item.label}</div>
                                        <div className="value">{item.value || "-"}</div>
                                    </div>
                                ))} */}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default GeneralSettings;
