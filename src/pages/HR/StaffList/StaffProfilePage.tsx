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

    const dobValue = staff?.data?.dob || staff?.data?.date_of_birth;

    const formatDateSafe = (dateVal: any): string => {
        if (!dateVal) return "N/A";
        if (dateVal instanceof Date) {
            if (isNaN(dateVal.getTime())) return "N/A";
            return dateVal.toISOString().split("T")[0];
        }
        if (typeof dateVal === "string") {
            if (dateVal.includes("T")) {
                return dateVal.split("T")[0];
            }
            return dateVal;
        }
        return String(dateVal);
    };

    const calculateAge = (dobInput: any): string => {
        if (!dobInput) return "N/A";
        const birthDate = dobInput instanceof Date ? dobInput : new Date(dobInput);
        if (isNaN(birthDate.getTime())) return "N/A";

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 0) return "N/A";
        return `${age} ${age === 1 ? "year" : "years"}`;
    };

    const profileDetails = [
        { label: "Admission Details", value: formatDateSafe(staff?.data?.admission_date) },
        { label: "Date Of Birth", value: formatDateSafe(dobValue) },
        { label: "Age", value: calculateAge(dobValue) },
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
