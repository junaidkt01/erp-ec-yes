import { useState } from "react"
import { useFetchAllAcademicYears } from "../hooks/useAcademicYear"
import { SvgIcon } from "./Sidebar"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { useDebounce } from "../hooks/useDebounce"
import { useSearchUsers } from "../hooks/useSearchUsers"
import { highlightText } from "../utils/utils"

const Header = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [isProfile, setIsProfile] = useState(false)

    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, isLoading, isFetching, error } = useSearchUsers(debouncedSearch);

    console.log("data: search", data, error, isLoading, isFetching);

    const navigate = useNavigate();

    return (
        <div className="header_wrapper">
            <div className="header" >
                <div className="header_left_icons" >
                    <div className="search_selection_wrapper" >
                        <div className={`search_bar_wrapper ${searchTerm ? "has" : ""}`}>
                            <div className="search_bar" >
                                <span className="search_icon">
                                    <img src="/header_icons/search_icon.svg" alt="search" />
                                </span>
                                <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} type="text" placeholder="Search Name/Admission.." />
                            </div>
                            <div className="search_sort_close" >
                                <span className="search_icon">
                                    <img src="/header_icons/search_sort.svg" alt="search" />
                                </span>
                                <span className="search_icon" onClick={() => setSearchTerm("")} >
                                    <img src="/header_icons/search_close.svg" alt="search" />
                                </span>
                            </div>
                        </div>

                        {searchTerm && <div className={`header_selection_bar ${searchTerm ? "has" : ""}`} >
                            {
                                data?.data?.map((item: any, i: number) => (
                                    <div key={i} className="selection_item" onClick={() => {
                                        if (item.type === "Student") {
                                            setSearchTerm("")
                                            navigate(`/student-info/profile/${item.student_id}`)
                                        } else if (item.type === "Staff") {
                                            setSearchTerm("")
                                            navigate(`/human-resource/profile/${item.staff_id}`)
                                        } else if (item.type === "Teacher") {
                                            setSearchTerm("")
                                            navigate(`/human-resource/profile/${item.staff_id}`)
                                        }
                                    }
                                    } >
                                        <img src="/header_icons/profile_pic.png" alt="" />
                                        <div className="selection_details" >
                                            <p className="name" >{highlightText(item.name, searchTerm)}</p>
                                            <p className="details" >{highlightText(item.details, searchTerm)}</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>}
                    </div>
                    <div>
                        <YearFilter />
                    </div>
                </div>
                <div className="header_left_icons" >
                    <div className="icon_box" ><img src="/header_icons/notification.svg" alt="" /> </div>
                    <div className="icon_box" ><img src="/header_icons/messages.svg" alt="" /> </div>
                    <div className="icon_box profile" onMouseEnter={() => setIsProfile(!isProfile)} ><img src="/header_icons/profile_pic.png" alt="" />
                    </div>
                    {isProfile && <Profile />}
                </div>
            </div>
        </div>
    )
}

export default Header;



const dat = [
    "2025 (Jun - Mar)",
    "2024 (Jun - Mar)",
    "2023 (Jun - Mar)",
    "2022 (Jun - Mar)",
    "2021 (Jun - Mar)",
    "2020 (Jun - Mar)",
    "2019 (Jun - Mar)",
    "2018 (Jun - Mar)",
    "2017 (Jun - Mar)",
    "2016 (Jun - Mar)",
];

const YearFilter = () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(dat[0]);
    const [search, setSearch] = useState("");


    const { data: academicYears } = useFetchAllAcademicYears();

    const formattedData = academicYears?.map((item) => ({
        id: item.id,
        label: `${item.name} (${new Date(item.start_date).toLocaleString("default", { month: "short" })} - ${new Date(item.end_date).toLocaleString("default", { month: "short" })})`,
    }));

    const filtered = formattedData?.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="year-filter">
            <div className={`filter-header ${open ? "active" : ""}`} onClick={() => setOpen(!open)} >
                <span>{selected}</span>
                <span className="chevron" />
            </div>

            {open && (
                <div className="dropdown">
                    <div className="search-box">
                        <span className="search_icon">
                            <img src="/sidebar_icons/search_icon.svg" alt="search" />
                        </span>
                        <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    <div className="list">
                        {filtered?.map((item) => (
                            <div
                                key={item.id}
                                className={`item ${selected === item.label ? "selected" : ""}`}
                                onClick={() => {
                                    setSelected(item.label);
                                    setOpen(false);
                                }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const Profile = () => {
    const navigate = useNavigate();

    const { data } = useAuth();
    console.log("user: ", data?.user)

    const handleLogout = () => {
        localStorage.removeItem("auth")
        setTimeout(() => {
            navigate("/")
        }, 100)
    }

    return (
        <div className="profile-dropdown">
            {/* Header */}
            <div className="profile-header">
                <div className="profile_pic">
                    <img src="/header_icons/profile_pic.png" alt="user" />
                </div>
                <div onClick={() => navigate(`/student-info/profile/${data?.user?.id}`)} >
                    <p className="email">{data?.user?.email}</p>
                    <span className="role">{data?.user?.roles[0]?.name}</span>
                </div>
                <span className="settings">
                    <img src="/header_icons/profile_settings.svg" alt="profile settings" />
                </span>
            </div>

            {/* Menu */}
            <div className="menu">
                <div className="item">
                    <span>
                        <img src="/header_icons/change_password.svg" alt="" />
                    </span>
                    <p>Change Password</p>
                </div>

                <div className="item">
                    <span>
                        <img src="/header_icons/language.svg" alt="" />
                    </span>
                    <p>Language (EN)</p>
                    <span className="arrow">
                        <SvgIcon
                            src="/sidebar_icons/down_arrow.svg"
                            className={`sidebar-ico ${true ? "rotate" : ""}`}
                        />
                    </span>
                </div>

                <div className="item">
                    <span>
                        <img src="/header_icons/sidebar_manager.svg" alt="" />
                    </span>
                    <p>Sidebar Manager & Style</p>
                </div>
            </div>

            {/* Logout */}
            <div className="logout" onClick={handleLogout} >
                <span>
                    <img src="/header_icons/logout.svg" alt="" />
                </span>
                <p>Logout</p>
            </div>
        </div>
    )
}