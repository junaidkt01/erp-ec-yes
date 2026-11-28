import { useEffect, useMemo, useState } from "react"
import { useFetchAllAcademicYears } from "../hooks/useAcademicYear"
import { SvgIcon } from "./Sidebar"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../auth/useAuth"
import { useDebounce } from "../hooks/useDebounce"
import { useSearchUsers } from "../hooks/useSearchUsers"
import { highlightText } from "../utils/utils"
import { useTranslation } from "../i18n/LanguageContext"
import { LANGUAGES } from "../i18n/translations"
import { useSidebarStore } from "../stores/sidebarStore"
import { BASE_URL } from "../api/endpoints"
import { useFetchAllNotifications } from "../hooks/useNotifications"
import { useFetchAllMessages } from "../hooks/useMessages"
import Notifications from "./Notifications"
import Inbox from "./Inbox"

const getPhotoUrl = (photoPath?: string | null) => {
    if (!photoPath) return "";
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

const Header = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [isProfile, setIsProfile] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isInboxOpen, setIsInboxOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const { t } = useTranslation();
    const toggleMobile = useSidebarStore((state) => state.toggleMobile);

    const { data: authData } = useAuth();
    const userPhoto = getPhotoUrl(authData?.user?.photo);

    const { data: notifData } = useFetchAllNotifications({ per_page: 20 });
    const unreadNotifsCount = useMemo(() => {
        const list = Array.isArray(notifData?.data) ? notifData.data : Array.isArray(notifData) ? notifData : [];
        return list.filter((n: any) => n.read_at === null || n.is_read === false).length;
    }, [notifData]);

    const { data: messagesData } = useFetchAllMessages({ per_page: 20 });
    const unreadMessagesCount = useMemo(() => {
        const list = Array.isArray(messagesData?.data) ? messagesData.data : Array.isArray(messagesData) ? messagesData : [];
        return list.filter((m: any) => m.read_at === null || m.is_read === false).length;
    }, [messagesData]);

    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, isLoading, isFetching, error } = useSearchUsers(debouncedSearch);

    console.log("data: search", data, error, isLoading, isFetching);

    const navigate = useNavigate();

    const handleSearchResultClick = (item: any) => {
        setSearchTerm("");
        setMobileSearchOpen(false);
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
                        className="mobile_only mobile_icon_btn"
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
                    <div className="icon_box hvr_zm_out"
                        onClick={() => {
                            setIsNotificationOpen((prev) => !prev);
                            setIsInboxOpen(false);
                            setIsProfile(false);
                        }}
                        style={{ cursor: "pointer", position: "relative" }}
                        title="Notifications" >
                        <img className="hvr_zm_in" src="/header_icons/notification.svg" alt="Notifications" />
                        {unreadNotifsCount > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "-2px",
                                right: "-2px",
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: 700,
                                borderRadius: "50%",
                                minWidth: "16px",
                                height: "16px",
                                padding: "0 3px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                                border: "1.5px solid #ffffff",
                            }} >
                                {unreadNotifsCount > 9 ? "9+" : unreadNotifsCount}
                            </span>
                        )}
                    </div>

                    <div className="icon_box hvr_zm_out"
                        onClick={() => {
                            setIsInboxOpen((prev) => !prev);
                            setIsNotificationOpen(false);
                            setIsProfile(false);
                        }}
                        style={{ cursor: "pointer", position: "relative" }}
                        title="Inbox" >
                        <img className="hvr_zm_in" src="/header_icons/messages.svg" alt="Inbox" />
                        {unreadMessagesCount > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "-2px",
                                right: "-2px",
                                backgroundColor: "#605dec",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: 700,
                                borderRadius: "50%",
                                minWidth: "16px",
                                height: "16px",
                                padding: "0 3px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                                border: "1.5px solid #ffffff",
                            }} >
                                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                            </span>
                        )}
                    </div>

                    <div
                        className="icon_box profile hvr_zm_out"
                        onClick={() => {
                            setIsProfile(!isProfile);
                            setIsNotificationOpen(false);
                            setIsInboxOpen(false);
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <img
                            className="hvr_zm_in"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            src={userPhoto || "/header_icons/profile_pic.png"}
                            alt={authData?.user?.name || "profile"}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/header_icons/profile_pic.png";
                            }}
                        />
                    </div>

                    {isNotificationOpen && <div onClick={() => setIsNotificationOpen(false)} className="overlay_wrapper"></div>}
                    {isNotificationOpen && <Notifications onClose={() => setIsNotificationOpen(false)} />}

                    {isInboxOpen && <div onClick={() => setIsInboxOpen(false)} className="overlay_wrapper"></div>}
                    {isInboxOpen && <Inbox onClose={() => setIsInboxOpen(false)} />}

                    {isProfile && <div onClick={() => setIsProfile(false)} className="overlay_wrapper"></div>}
                    {isProfile && <ProfileMenu />}
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
                        <div className="mobile_search_input_row">
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
                            <button className="mobile_search_cancel" onClick={() => { setMobileSearchOpen(false); setSearchTerm("") }} >
                                {t("common.cancel", "Cancel")}
                            </button>
                        </div>
                        <SearchResults />
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

    const renderDesktopYearList = () => (
        <>
            <div className="search-box">
                <span className="search_icon">
                    <img src="/sidebar_icons/search_icon.svg" alt="search" />
                </span>
                <input placeholder="Search year..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    className={`mobile_year_btn ${open ? "active" : ""}`}
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
                            <div className="sheet_header">
                                <p className="sheet_title">Select Academic Year</p>
                                <button
                                    type="button"
                                    className="sheet_close_btn"
                                    onClick={() => { setOpen(false); setSearch(""); }}
                                    aria-label="Close"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="sheet_search_area">
                                <div className="sheet_search_bar">
                                    <span className="search_icon">
                                        <img src="/sidebar_icons/search_icon.svg" alt="search" />
                                    </span>
                                    <input
                                        placeholder="Search year..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            className="clear_btn"
                                            onClick={() => setSearch("")}
                                            aria-label="Clear search"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="list">
                                {filtered.length === 0 ? (
                                    <div className="empty_state">No academic year found</div>
                                ) : (
                                    filtered.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`item ${selected?.label === item.label ? "selected" : ""}`}
                                            onClick={() => handleSelect(item)}
                                        >
                                            <span>{item.label}</span>
                                            {selected?.label === item.label && (
                                                <svg className="check_icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#605dec" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
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
                    {renderDesktopYearList()}
                </div>
            )}
        </div>
    );
};

const ProfileMenu = () => {
    const navigate = useNavigate();
    const { language, setLanguage, currentLanguage, t } = useTranslation();
    const [isLangOpen, setIsLangOpen] = useState(false);

    const queryClient = useQueryClient();
    const { data } = useAuth();

    const handleLogout = () => {
        localStorage.removeItem("auth")
        queryClient.clear();
        setTimeout(() => {
            navigate("/")
        }, 100)
    }

    const userPhoto = getPhotoUrl(data?.user?.photo);

    return (
        <div className="profile-dropdown hvr_zm_out" >

            {/* Header */}
            <div className="profile-header hvr_zm_out" >
                <div className="profile_pic">
                    <img
                        src={userPhoto || "/header_icons/profile_pic.png"}
                        alt="user"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/header_icons/profile_pic.png";
                        }}
                    />
                </div>
                <div onClick={() => {
                    navigate(`/profile-page/user/${data?.user?.id}`)
                }} style={{ cursor: "pointer" }}>
                    <p className="email">{data?.user?.name}</p>
                    <span className="role">{data?.user?.roles[0]?.name}</span>
                </div>
                {/* <span className="settings">
                    <img src="/header_icons/profile_settings.svg" alt="profile settings" />
                </span> */}
            </div>

            {/* Menu */}
            <div className="menu">
                {/* <div className="item hvr_zm_out" onClick={() => navigate("/reset-password")} >
                    <span>
                        <img src="/header_icons/change_password.svg" alt="" />
                    </span>
                    <p>{t("header.change_password", "Change Password")}</p>
                </div> */}

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