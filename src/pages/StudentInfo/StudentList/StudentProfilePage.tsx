import { useParams } from "react-router-dom";
import { useFetchOneStudent } from "../../../hooks/useStudent";
import Profile from "../../Profile/Profile"
import { useState } from "react";
import LoadingOverlay from "../../../components/Loadingoverlay";

const StudentProfilePage = () => {
    const { student_id } = useParams();
    const { data: student, isLoading: studentLoading } = useFetchOneStudent(student_id || "");
    console.log("student: 1", student, student_id);

    const details = [
        { label: "Admission Number", value: student?.data?.admission_no || "N/A" },
        { label: "Roll Number", value: student?.data?.roll_no || "N/A" },
        { label: "Class & Section", value: `${student?.data?.class?.name || "N/A"} - ${student?.data?.section?.name || "N/A"}` },
        { label: "Remark Points", value: student?.data?.remark_points || "N/A" },
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

    const dobValue = student?.data?.dob || student?.data?.date_of_birth;

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
        { label: "Admission Details", value: formatDateSafe(student?.data?.admission_date) },
        { label: "Student ID", value: student?.data?.student_code || student?.data?.admission_no || "N/A" },
        { label: "Date Of Birth", value: formatDateSafe(dobValue) },
        { label: "Age", value: calculateAge(dobValue) },
        { label: "Category", value: student?.data?.category?.name || "N/A" },
        { label: "Religion", value: student?.data?.religion || "N/A" },
        { label: "Phone Number", value: student?.data?.phone || "N/A" },
        { label: "Email Address", value: student?.data?.email || "N/A" },
        { label: "Present Address", value: student?.data?.current_address || "N/A" },
        { label: "Permanent Address", value: student?.data?.permanent_address || "N/A" },
    ];

    const [activeTab, setActiveTab] = useState("Profile");

    ///////////////////////


    if (studentLoading) {
        return <LoadingOverlay isLoading={true} />
    }

    return <Profile type={"student"} data={student} details={details} tabs={tabs} profileDetails={profileDetails} activeTab={activeTab} setActiveTab={setActiveTab} />
}

export default StudentProfilePage
