import { useNavigate } from "react-router-dom"
import { BASE_URL } from "../../api/endpoints"
import "./Profile.scss"

const Profile = ({ type, data, details, tabs, profileDetails, activeTab, setActiveTab }: any) => {
    const navigate = useNavigate();
    console.log("data: ", data);
    console.log("data: 12", profileDetails);

    const getPhotoUrl = (photoPath?: string) => {
        if (!photoPath) return "/sample/pic.png";
        if (
            photoPath.startsWith("http://") ||
            photoPath.startsWith("https://") ||
            photoPath.startsWith("blob:") ||
            photoPath.startsWith("data:")
        ) {
            return photoPath;
        }
        const cleanPath = photoPath.startsWith("/") ? photoPath.slice(1) : photoPath;
        if (cleanPath.startsWith("public/")) {
            return `${BASE_URL}/${cleanPath}`;
        }
        return `${BASE_URL}/public/${cleanPath}`;
    };

    const photoSrc = getPhotoUrl(
        data?.data?.photo ||
        data?.data?.student_photo ||
        data?.data?.avatar ||
        data?.data?.image ||
        data?.photo
    );

    const renderValue = (val: any) => {
        if (val === null || val === undefined || val === "") return "-";
        if (val instanceof Date) {
            if (isNaN(val.getTime())) return "-";
            return val.toISOString().split("T")[0];
        }
        if (typeof val === "object") {
            return String(val);
        }
        return val;
    };

    return (
        <div className="page_wrapper" >
            <div className="profile-page" >
                <div className="breadcrumbs" onClick={() => {
                    if (type === "student") {
                        navigate("/student-info/student-list")
                    } else if (type === "staff") {
                        navigate("/human-resource/staff-list")
                    }
                }} >
                    <img src="/svgs/breadcrumbs-left-arrow.svg" alt="" />
                    <p>{type === "student" ? "Student List" : "Staff List"}</p>
                    <span>| {type === "student" ? "Student details" : "Staff details"}</span>
                </div>

                <div className="profile-details-wrapper">

                    <div className="profile-details-header profile-details-section">
                        <div className="profile-header-wrapper" >
                            <img
                                className="profile-photo"
                                src={photoSrc}
                                alt={data?.data?.full_name || data?.data?.name || "Profile"}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/sample/pic.png";
                                }}
                            />
                            <div className="name-and-details" >
                                {/* <h1>Laya Sayd <span>(Female)</span></h1> */}
                                <h1>{`${data?.data?.full_name || "N/A"}`}<span>{(data?.data?.section?.gender)}</span></h1>
                                {/* <h1>{`${data?.data?.first_name || "N/A"} ${data?.data?.last_name || "N/A"}`}<span>{(data?.data?.section?.gender)}</span></h1> */}

                                <div className="student-details">
                                    {details?.map((item: any) => (
                                        <div className="detail-item" key={item?.label}>
                                            <span className="label">{item?.label}</span>
                                            <span className="separator">:</span>
                                            <span className="value">{renderValue(item?.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="profile-qr">
                            <img src="/sample/qr.png" alt="" />
                            <p>Student QR Code</p>
                        </div>
                    </div>

                    <div className="profile-details-body profile-details-section">
                        <div className="profile-info-head" >
                            <p>Student Info</p>
                            <button onClick={() => navigate(`/student-info/add-student/${data?.data?.id}`)} >
                                <img src="/svgs/edit-icon.svg" alt="" />
                                <span>Edit Details</span>
                            </button>
                        </div>

                        <div className="profile-tabs-wrapper" >
                            <div className="profile-tabs" >
                                {tabs?.map((tab: any) => (
                                    <button key={tab}
                                        className={`tab ${activeTab === tab ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab)} >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="tab-content">

                                {activeTab === "Profile" && (
                                    <div className="details-list">
                                        {profileDetails?.map((item: any) => (
                                            <div className="detail-row" key={item.label}>
                                                <div className="label">{item.label}</div>
                                                <div className="value">{renderValue(item.value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === "Leave" && (
                                    <div className="empty-page">Leave Content</div>
                                )}

                                {activeTab === "Exam" && (
                                    <div className="empty-page">Exam Content</div>
                                )}

                                {activeTab === "Document" && (
                                    <div className="empty-page">Document Content</div>
                                )}

                                {activeTab === "Record" && (
                                    <div className="empty-page">Record Content</div>
                                )}

                                {activeTab === "Timeline" && (
                                    <div className="empty-page">Timeline Content</div>
                                )}

                                {activeTab === "Student Attendance" && (
                                    <div className="empty-page">Student Attendance Content</div>
                                )}

                                {activeTab === "Subject Attendance" && (
                                    <div className="empty-page">Subject Attendance Content</div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
