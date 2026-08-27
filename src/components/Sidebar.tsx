import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sidebar_menus } from "../utils";
import { useQueryClient } from "@tanstack/react-query";
import { GENERAL_SETTINGS_KEY, type generalSettings } from "../hooks/useGeneralSettings";
import { useTranslation } from "../i18n/LanguageContext";
import { useSidebarStore } from "../stores/sidebarStore";

const slugify = (s: string) =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

const getNavKey = (text: string) => {
    return `nav.${text.toLowerCase().trim().replace(/[^\w\s]/g, "").replace(/\s+/g, "_")}`;
};

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isMobileOpen, closeMobile } = useSidebarStore();

    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

    const submenuRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    //////////////////////////////////
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMenus, setFilteredMenus] = useState<
        { label: string; path: string }[]
    >([]);

    const getAllSearchableItems = () => {
        const items: { label: string; path: string; fullLabel: string }[] = [];

        sidebar_menus.forEach(group => {
            group.menus.forEach(menu => {

                // Sub menus
                if (menu.sub_menus) {
                    menu.sub_menus.forEach(sub => {
                        items.push({
                            label: sub,
                            path: `${menu.path}/${slugify(sub)}`,
                            fullLabel: `${menu.title} → ${sub}`
                        });
                    });
                }
            });
        });

        return items;
    };


    useEffect(() => {
        if (!searchTerm) {
            setFilteredMenus([]);
            return;
        }

        const all = getAllSearchableItems();

        const matched = all.filter(item =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t(getNavKey(item.label), item.label).toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredMenus(matched);
    }, [searchTerm, t]);
    //////////////////////////////////

    useEffect(() => {
        const savedExpanded = localStorage.getItem("sidebarExpanded");
        const savedActive = localStorage.getItem("sidebarSubActive");

        if (savedExpanded) setExpandedMenu(savedExpanded);
        if (savedActive) setActiveSubMenu(savedActive);

        const path = location.pathname;
        sidebar_menus.forEach(group => {
            group.menus.forEach(menu => {
                menu.sub_menus?.forEach((sub: string) => {
                    const candidate = `${menu.path}/${slugify(sub)}`;
                    if (candidate === path) {
                        setActiveSubMenu(candidate);
                        setExpandedMenu(menu.path);
                        localStorage.setItem("sidebarSubActive", candidate);
                        localStorage.setItem("sidebarExpanded", menu.path);
                    }
                });
            });
        });
    }, []);

    useEffect(() => {
        if (expandedMenu !== null) {
            localStorage.setItem("sidebarExpanded", expandedMenu);
        } else {
            localStorage.removeItem("sidebarExpanded");
        }
    }, [expandedMenu]);

    useEffect(() => {
        if (activeSubMenu !== null) {
            localStorage.setItem("sidebarSubActive", activeSubMenu);
        } else {
            localStorage.removeItem("sidebarSubActive");
        }
    }, [activeSubMenu]);

    const toggleMenu = (menuPath: string) => {
        setExpandedMenu(prev => (prev === menuPath ? null : menuPath));
    };

    const handleSubNavigate = (parentPath: string, sub: string) => {
        const finalPath = sub ? `${parentPath}/${slugify(sub)}` : parentPath;
        setActiveSubMenu(finalPath);
        navigate(finalPath);
        closeMobile();
    };

    const isSubPathActive = (parentPath: string) =>
        location.pathname.startsWith(parentPath) ||
        (activeSubMenu !== null && activeSubMenu.startsWith(parentPath));


    const queryClient = useQueryClient();

    const data = queryClient.getQueryData<generalSettings>(GENERAL_SETTINGS_KEY);

    return (
        <>
            {isMobileOpen && (
                <div className="sidebar_mobile_backdrop" onClick={closeMobile} />
            )}
            <div className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
                <div className="sidebar_inner_box">
                    <div className="sidebar_head_wrapper">
                        <div className="sidebar_head">
                            <img className="logo" width={120} height={48} src={data?.data?.logo} alt="logo" />
                            <img className="sidebar_arrow" onClick={closeMobile} src="/sidebar_icons/arrow_icon.svg" alt="arrow icon" />
                        </div>

                        <div className="search_bar">
                            <span className="search_icon">
                                <img src="/sidebar_icons/search_icon.svg" alt="search" />
                            </span>
                            <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} type="text" placeholder={t("header.search", "Search")} />
                            <div className={`sidebar_search_list ${searchTerm ? "open" : "close"}`}>
                                {filteredMenus.length > 0 ? (
                                    filteredMenus.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                navigate(item.path);
                                                setSearchTerm("");
                                            }}
                                        >
                                            {t(getNavKey(item.label), item.label)}
                                        </button>
                                    ))
                                ) : searchTerm ? (
                                    <p>{t("common.no_results", "No results found")}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="sidebar_menus_wrapper">
                        <button
                            onClick={() => handleSubNavigate("/dashboard", "")}
                            className={`menu_button ${location.pathname.split("?")[0] === "/dashboard" ? "active dashboard" : "dashboard"}`}
                        >
                            <div className="menu_button_icon_text">
                                <SvgIcon src="/sidebar_icons/dormitory.svg" className="sidebar-icon" />
                                <span>{t("nav.dashboard", "Dashboard")}</span>
                            </div>
                        </button>

                        <div className="sidebar_menus">
                            {sidebar_menus.map((group, i) => (
                                <div key={i}>
                                    <p className="menus_title">{t(getNavKey(group.title), group.title)}</p>

                                    {group.menus.map((menu, mIndex) => {
                                        const isMenuOpen = expandedMenu === menu.path;
                                        const isMenuActive = isSubPathActive(menu.path);

                                        return (
                                            <div key={mIndex}>
                                                <button
                                                    onClick={() => toggleMenu(menu.path)}
                                                    className={`menu_button hvr_zm_out ${isMenuActive ? "active" : ""}`}
                                                >
                                                    <div className="menu_button_icon_text">
                                                        <SvgIcon src={menu.icon} className="sidebar-icon" />
                                                        <span>{t(getNavKey(menu.title), menu.title)}</span>
                                                    </div>

                                                    <SvgIcon
                                                        src="/sidebar_icons/down_arrow.svg"
                                                        className={`sidebar-ico ${isMenuOpen ? "rotate" : ""}`}
                                                    />
                                                </button>

                                                <div
                                                    className={`submenu_wrapper ${isMenuOpen ? "open" : "closed"}`}
                                                    aria-hidden={!isMenuOpen}
                                                >
                                                    {menu.sub_menus?.map((sub: string, sIndex: number) => {
                                                        const finalPath = `${menu.path}/${slugify(sub)}`;
                                                        const isSubActive = location.pathname === finalPath;

                                                        return (
                                                            <button
                                                                key={sIndex}
                                                                ref={(el: any) => (submenuRefs.current[finalPath] = el)}
                                                                className={`sub_menu_button hvr_zm_out ${isSubActive ? "active" : ""}`}
                                                                onClick={() => handleSubNavigate(menu.path, sub)}
                                                            >
                                                                <div className="menu_button_icon_text">
                                                                    <span>{t(getNavKey(sub), sub)}</span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

export function SvgIcon({ src, className }: { src: string; className?: string }) {
    const [svg, setSvg] = useState("");

    useEffect(() => {
        let cancelled = false;

        fetch(src)
            .then(res => res.text())
            .then(text => {
                if (!cancelled) setSvg(text);
            })
            .catch(() => {
                if (!cancelled) setSvg("");
            });

        return () => {
            cancelled = true;
        };
    }, [src]);

    return <span className={className ?? ""} dangerouslySetInnerHTML={{ __html: svg }} />;
}