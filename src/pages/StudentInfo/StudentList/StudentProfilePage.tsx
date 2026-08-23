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
        { label: "Behaviour Records Point", value: student?.data?.behaviour_points || "N/A" },
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
        { label: "Admission Details", value: student?.data?.admission_date || "N/A" },
        { label: "Student ID", value: student?.data?.student_code || "N/A" },
        { label: "Date Of Birth", value: student?.data?.date_of_birth || "N/A" },
        { label: "Age", value: "17 years" },
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
