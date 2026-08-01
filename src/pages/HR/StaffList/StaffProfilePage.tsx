// StaffProfilePage

import { useParams } from "react-router-dom";
import Profile from "../../Profile/Profile"
import { useState } from "react";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { useFetchOneStaff } from "../../../hooks/useStaff";

const StaffProfilePage = () => {
    const { staff_id } = useParams();
    const { data: staff, isLoading: staffLoading } = useFetchOneStaff(staff_id || "")
    console.log("staff: 1", staff, staff_id);


    const details = [
        { label: "Staff ID", value: staff?.data?.id || "N/A" },
        { label: "Name", value: `${staff?.data?.class?.first_name || "N/A"} ${staff?.data?.section?.second_name || "N/A"}` },
        { label: "Roll", value: staff?.data?.name || "N/A" },
        { label: "Basic Salary", value: staff?.data?.basic_salary || "N/A" },
        { label: "Designation", value: staff?.data?.designation || "N/A" },
    ];

    const tabs = [
        "Profile",
        "Leave",
        "Exam",
        "Document",
        "Record",
        "Timeline",
        "Student Attendance",
        "Subject Attendance",
    ];

    const profileDetails = [
        { label: "Admission Details", value: staff?.data?.admission_date || "N/A" },
        { label: "Date Of Birth", value: staff?.data?.date_of_birth || "N/A" },
        { label: "Age", value: "17 years" },
        { label: "Category", value: staff?.data?.category || "N/A" },
        { label: "Religion", value: staff?.data?.religion || "N/A" },
        { label: "Phone Number", value: staff?.data?.phone || "N/A" },
        { label: "Email Address", value: staff?.data?.email || "N/A" },
        { label: "Present Address", value: staff?.data?.current_address || "N/A" },
        { label: "Permanent Address", value: staff?.data?.permanent_address || "N/A" },
    ];

    const [activeTab, setActiveTab] = useState("Profile");

    ///////////////////////


    if (staffLoading) {
        return <LoadingOverlay isLoading={true} />
    }

    return <Profile type={"staff"} data={staff} details={details} tabs={tabs} profileDetails={profileDetails} activeTab={activeTab} setActiveTab={setActiveTab} />
}

export default StaffProfilePage;
