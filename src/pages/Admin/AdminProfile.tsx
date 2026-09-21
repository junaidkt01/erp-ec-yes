// import { useParams } from "react-router-dom";
import { useState } from "react";
// import { useFetchOneStudent } from "../../hooks/useStudent";
import LoadingOverlay from "../../components/Loadingoverlay";
import Profile from "../Profile/Profile";
import { useAuth } from "../../auth/useAuth";

const AdminProfile = () => {
    // const { student_id } = useParams();
    // const { data: student, isLoading: studentLoading } = useFetchOneStudent(student_id || "");
    // console.log("student: 1", student, student_id);

    const { data, isLoading } = useAuth();
    console.log("user: 111", data.user);

    const details = [
        { label: "Full Name", value: data.user?.full_name || "N/A" },
        { label: "Email", value: data.user?.email || "N/A" },
        { label: "Role", value: data.user?.roles[0].name || "N/A" },
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

    // const dobValue = student?.data?.dob || student?.data?.date_of_birth;

    // const profileDetails = [
    //     { label: "Admission Details", value: formatDateSafe(student?.data?.admission_date) },
    //     { label: "Student ID", value: student?.data?.student_code || student?.data?.admission_no || "N/A" },
    //     { label: "Date Of Birth", value: formatDateSafe(dobValue) },
    //     { label: "Age", value: calculateAge(dobValue) },
    //     { label: "Category", value: student?.data?.category?.name || "N/A" },
    //     { label: "Religion", value: student?.data?.religion || "N/A" },
    //     { label: "Phone Number", value: student?.data?.phone || "N/A" },
    //     { label: "Email Address", value: student?.data?.email || "N/A" },
    //     { label: "Present Address", value: student?.data?.current_address || "N/A" },
    //     { label: "Permanent Address", value: student?.data?.permanent_address || "N/A" },
    // ];

    const [activeTab, setActiveTab] = useState("Profile");

    ///////////////////////


    if (isLoading) {
        return <LoadingOverlay isLoading={true} />
    }

    return <Profile type={"admin"} data={data?.user} details={details} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
}

export default AdminProfile;
