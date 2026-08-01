import { useNavigate } from "react-router-dom"
import "./Profile.scss"

const Profile = ({ type, data, details, tabs, profileDetails, activeTab, setActiveTab }: any) => {
    const navigate = useNavigate();
    console.log("data: ", data);
    console.log("data: 12", profileDetails);

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
                            <img src="/sample/pic.png" alt="" />
                            <div className="name-and-details" >
                                {/* <h1>Laya Sayd <span>(Female)</span></h1> */}
                                <h1>{`${data?.data?.first_name || "N/A"} ${data?.data?.last_name || "N/A"}`}<span>{(data?.data?.section?.gender)}</span></h1>

                                <div className="student-details">
                                    {details?.map((item: any) => (
                                        <div className="detail-item" key={item?.label}>
                                            <span className="label">{item?.label}</span>
                                            <span className="separator">:</span>
                                            <span className="value">{item?.value}</span>
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
                                                <div className="value">{item.value || "-"}</div>
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
