import { useEffect, useMemo, useState } from "react"
import { useFetchAllAcademicYears } from "../hooks/useAcademicYear"
import { SvgIcon } from "./Sidebar"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { useDebounce } from "../hooks/useDebounce"
import { useSearchUsers } from "../hooks/useSearchUsers"
import { highlightText } from "../utils/utils"
import { useTranslation } from "../i18n/LanguageContext"
import { LANGUAGES } from "../i18n/translations"
import { useSidebarStore } from "../stores/sidebarStore"

const Header = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [isProfile, setIsProfile] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const { t } = useTranslation();
    const toggleMobile = useSidebarStore((state) => state.toggleMobile);

    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, isLoading, isFetching, error } = useSearchUsers(debouncedSearch);

    console.log("data: search", data, error, isLoading, isFetching);

    const navigate = useNavigate();

    const handleSearchResultClick = (item: any) => {
        setSearchTerm("")
        setMobileSearchOpen(false)
        if (item.type === "Student") {
            navigate(`/student-info/profile/${item.student_id}`)
        } else if (item.type === "Staff" || item.type === "Teacher") {
            navigate(`/human-resource/profile/${item.staff_id}`)
        }
    }

    const SearchResults = () => (
        <>
            {searchTerm && <div className={`header_selection_bar ${searchTerm ? "has" : ""}`} >
                {
                    data?.data?.map((item: any, i: number) => (
                        <div key={i} className="selection_item" onClick={() => handleSearchResultClick(item)}>
                            <img src="/header_icons/profile_pic.png" alt="" />
                            <div className="selection_details" >
                                <p className="name" >{highlightText(item.name, searchTerm)}</p>
                                <p className="details" >{highlightText(item.details, searchTerm)}</p>
                            </div>
                        </div>
                    ))
                }
            </div>}
        </>
    )

    return (
        <div className="header_wrapper" >
            <div className="header" >
                <div className="header_left_icons" >
                    <button className="hamburger_btn hvr_zm_in" onClick={toggleMobile} aria-label="Toggle Sidebar">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    {/* Desktop search — hidden on mobile */}
                    <div className="search_selection_wrapper hvr_zm_in desktop_only" >
                        <div className={`search_bar_wrapper ${searchTerm ? "has" : ""}`} >
                            <div className="search_bar" >
                                <span className="search_icon" >
                                    <img src="/header_icons/search_icon.svg" alt="search" />
                                </span>
                                <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} type="text" placeholder={t("header.search_placeholder", "Search Name/Admission..")} />
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
                        <SearchResults />
                    </div>

                    {/* Desktop year filter */}
                    <div className="desktop_only">
                        <YearFilter />
                    </div>

                    {/* Mobile search icon button */}
                    <button
                        className="mobile_only mobile_icon_btn hvr_zm_in"
                        onClick={() => setMobileSearchOpen(true)}
                        aria-label="Open search"
                    >
                        <img src="/header_icons/search_icon.svg" alt="search" />
                    </button>

                    {/* Mobile year filter */}
                    <div className="mobile_only">
                        <YearFilter isMobile />
                    </div>
                </div>

                <div className="header_right_icons">
                    <div className="icon_box hvr_zm_out" ><img className="hvr_zm_in" src="/header_icons/notification.svg" alt="" /> </div>
                    <div className="icon_box hvr_zm_out" ><img className="hvr_zm_in" src="/header_icons/messages.svg" alt="" /> </div>
                    <div className="icon_box profile hvr_zm_out" onClick={() => setIsProfile(!isProfile)} ><img className="hvr_zm_in" src="/header_icons/profile_pic.png" alt="" />
                    </div>

                    {isProfile && <div onClick={() => setIsProfile(false)} className="overlay_wrapper"></div>}
                    {isProfile && <Profile />}
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
                <div className="mobile_search_overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setMobileSearchOpen(false)
                        setSearchTerm("")
                    }
                }}>
                    <div className="mobile_search_panel">
                        <div className={`search_bar_wrapper ${searchTerm ? "has" : ""}`}>
                            <div className="search_bar">
                                <span className="search_icon">
                                    <img src="/header_icons/search_icon.svg" alt="search" />
                                </span>
                                <input
                                    autoFocus
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    value={searchTerm}
                                    type="text"
                                    placeholder={t("header.search_placeholder", "Search Name/Admission..")}
                                />
                            </div>
                            {searchTerm && (
                                <div className="search_sort_close">
                                    <span className="search_icon" onClick={() => setSearchTerm("")}>
                                        <img src="/header_icons/search_close.svg" alt="clear" />
                                    </span>
                                </div>
                            )}
                        </div>
                        <SearchResults />
                        <button
                            className="mobile_search_cancel"
                            onClick={() => { setMobileSearchOpen(false); setSearchTerm("") }}
                        >
                            {t("common.cancel", "Cancel")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header;



// const dat = [
//     "2025 (Jun - Mar)",
//     "2024 (Jun - Mar)",
//     "2023 (Jun - Mar)",
//     "2022 (Jun - Mar)",
//     "2021 (Jun - Mar)",
//     "2020 (Jun - Mar)",
//     "2019 (Jun - Mar)",
//     "2018 (Jun - Mar)",
//     "2017 (Jun - Mar)",
//     "2016 (Jun - Mar)",
// ];

const YearFilter = ({ isMobile = false }: { isMobile?: boolean }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>();
    const [search, setSearch] = useState("");

    const { data: academicYears, isLoading } = useFetchAllAcademicYears();

    const formattedData = useMemo(() => {
        return academicYears?.map((item) => ({
            id: item.id,
            label: `${item.name} (${new Date(item.start_date).toLocaleString("default", { month: "short" })} - ${new Date(item.end_date).toLocaleString("default", { month: "short" })})`,
            short: item.name,
        })) ?? [];
    }, [academicYears]);

    const filtered = useMemo(() => {
        return formattedData.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [formattedData, search]);

    useEffect(() => {
        if (formattedData.length > 0) {
            setSelected((prev: any) => prev ?? formattedData[0]);
        } else if (isLoading) {
            setSelected((prev: any) => prev ?? { label: "2025 - 2026 (Jun - Mar)", short: "2025-26" });
        }
    }, [formattedData, isLoading]);

    const handleSelect = (item: any) => {
        setSelected(item);
        setOpen(false);
        setSearch("");
    };

    const renderYearList = () => (
        <>
            <div className="search-box">
                <span className="search_icon">
                    <img src="/sidebar_icons/search_icon.svg" alt="search" />
                </span>
                <input autoFocus={isMobile} placeholder="Search year..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="list">
                {filtered.map((item) => (
                    <div
                        key={item.id}
                        className={`item ${selected?.label === item.label ? "selected" : ""}`}
                        onClick={() => handleSelect(item)}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </>
    );

    if (isMobile) {
        return (
            <>
                <button
                    className={`mobile_year_btn hvr_zm_in ${open ? "active" : ""}`}
                    onClick={() => setOpen(true)}
                    aria-label="Select academic year"
                >
                    {/* Calendar icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{selected?.short ?? "Year"}</span>
                    <span className="chevron" />
                </button>

                {open && (
                    <>
                        <div className="mobile_year_backdrop" onClick={() => { setOpen(false); setSearch(""); }} />
                        <div className="mobile_year_sheet">
                            <div className="sheet_handle" />
                            <p className="sheet_title">Select Academic Year</p>
                            {renderYearList()}
                        </div>
                    </>
                )}
            </>
        );
    }

    return (
        <div className={`year-filter ${open ? "" : "hvr_zm_in"}`}>
            <div className={`filter-header ${open ? "active" : ""}`} onClick={() => setOpen(!open)} >
                <span>{selected?.label}</span>
                <span className="chevron" />
            </div>

            {open && (
                <div className="dropdown">
                    {renderYearList()}
                </div>
            )}
        </div>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const { language, setLanguage, currentLanguage, t } = useTranslation();
    const [isLangOpen, setIsLangOpen] = useState(false);

    const { data } = useAuth();
    console.log("user: ", data?.user)

    const handleLogout = () => {
        localStorage.removeItem("auth")
        setTimeout(() => {
            navigate("/")
        }, 100)
    }

    return (
        <div className="profile-dropdown hvr_zm_out">

            {/* Header */}
            <div className="profile-header hvr_zm_out" >
                <div className="profile_pic">
                    <img src="/header_icons/profile_pic.png" alt="user" />
                </div>
                <div onClick={() => navigate(`/student-info/profile/${data?.user?.id}`)} style={{ cursor: "pointer" }}>
                    <p className="email">{data?.user?.email}</p>
                    <span className="role">{data?.user?.roles[0]?.name}</span>
                </div>
                <span className="settings">
                    <img src="/header_icons/profile_settings.svg" alt="profile settings" />
                </span>
            </div>

            {/* Menu */}
            <div className="menu">
                <div className="item hvr_zm_out">
                    <span>
                        <img src="/header_icons/change_password.svg" alt="" />
                    </span>
                    <p>{t("header.change_password", "Change Password")}</p>
                </div>

                <div className="item hvr_zm_out" onClick={(e) => { e.stopPropagation(); setIsLangOpen(!isLangOpen); }}>
                    <span>
                        <img src="/header_icons/language.svg" alt="" />
                    </span>
                    <p>{t("header.language", "Language")} ({currentLanguage.short})</p>
                    <span className="arrow">
                        <SvgIcon
                            src="/sidebar_icons/down_arrow.svg"
                            className={`sidebar-ico ${isLangOpen ? "rotate" : ""}`}
                        />
                    </span>
                </div>

                {isLangOpen && (
                    <div className="language-submenu">
                        {LANGUAGES.map((lang) => (
                            <div
                                key={lang.code}
                                className={`item sub-item hvr_zm_out ${language === lang.code ? "active-lang" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLanguage(lang.code);
                                }}
                            >
                                <span>{lang.label} ({lang.nativeName})</span>
                                {language === lang.code && <span className="check-mark">✓</span>}
                            </div>
                        ))}
                    </div>
                )}

                <div className="item hvr_zm_out">
                    <span>
                        <img src="/header_icons/sidebar_manager.svg" alt="" />
                    </span>
                    <p>{t("header.sidebar_manager", "Sidebar Manager & Style")}</p>
                </div>
            </div>

            {/* Logout */}
            <div className="logout hvr_zm_in" onClick={handleLogout} >
                <span>
                    <img src="/header_icons/logout.svg" alt="" />
                </span>
                <p>{t("header.logout", "Logout")}</p>
            </div>
        </div>
    )
}