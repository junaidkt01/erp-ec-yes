import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sidebar_menus } from "../utils";

const slugify = (s: string) =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

    const submenuRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

    useEffect(() => {
        if (activeSubMenu) {
            const btn = submenuRefs.current[activeSubMenu];
            if (btn) {
                setTimeout(() => {
                    btn.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
            }
        }
    }, [activeSubMenu, expandedMenu]);

    const toggleMenu = (menuPath: string) => {
        setExpandedMenu(prev => (prev === menuPath ? null : menuPath));
    };

    const handleSubNavigate = (parentPath: string, sub: string) => {
        const finalPath = `${parentPath}/${slugify(sub)}`;
        setActiveSubMenu(finalPath);
        navigate(finalPath);
    };

    const isSubPathActive = (parentPath: string) =>
        location.pathname.startsWith(parentPath) ||
        (activeSubMenu !== null && activeSubMenu.startsWith(parentPath));

    return (
        <div className="sidebar">
            <div className="sidebar_inner_box">
                <div className="sidebar_head_wrapper">
                    <div className="sidebar_head">
                        <img className="logo" width={48} height={48} src="/logo.png" alt="logo" />
                        <img className="sidebar_arrow" src="/sidebar_icons/arrow_icon.svg" alt="arrow icon" />
                    </div>

                    <div className="search_bar">
                        <span className="search_icon">
                            <img src="/sidebar_icons/search_icon.svg" alt="search" />
                        </span>
                        <input type="text" placeholder="Search" />
                    </div>
                </div>

                <div className="sidebar_menus_wrapper">
                    <button
                        onClick={() => handleSubNavigate("/dashboard", "")}
                        className={`menu_button ${location.pathname.split("?")[0] === "/dashboard" ? "active dashboard" : "dashboard"}`}
                    >
                        <div className="menu_button_icon_text">
                            <SvgIcon src="/sidebar_icons/dormitory.svg" className="sidebar-icon" />
                            <span>Dashboard</span>
                        </div>
                    </button>

                    <div className="sidebar_menus">
                        {sidebar_menus.map((group, i) => (
                            <div key={i}>
                                <p className="menus_title">{group.title}</p>

                                {group.menus.map((menu, mIndex) => {
                                    const isMenuOpen = expandedMenu === menu.path;
                                    const isMenuActive = isSubPathActive(menu.path);

                                    return (
                                        <div key={mIndex}>
                                            <button
                                                onClick={() => toggleMenu(menu.path)}
                                                className={`menu_button ${isMenuActive ? "active" : ""}`}
                                            >
                                                <div className="menu_button_icon_text">
                                                    <SvgIcon src={menu.icon} className="sidebar-icon" />
                                                    <span>{menu.title}</span>
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
                                                            className={`sub_menu_button ${isSubActive ? "active" : ""}`}
                                                            onClick={() => handleSubNavigate(menu.path, sub)}
                                                        >
                                                            <div className="menu_button_icon_text">
                                                                {/* You can add small sub-icons here if you want */}
                                                                <span>{sub}</span>
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
    );
};

export default Sidebar;

function SvgIcon({ src, className }: { src: string; className?: string }) {
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




// import { useLocation, useNavigate } from "react-router-dom"
// import { sidebar_menus } from "../utils"

// const Sidebar = () => {
//     const params = useLocation()
//     const navigate = useNavigate()

//     const [timelineActive, setTimelineActive] = useState<Record<string, number>>({});
//     const [expandedMenu, setExpandedMenu] = useState<Record<string, boolean>>({});

//     useEffect(() => {
//         const saved = localStorage.getItem("timelineActiveState");
//         if (saved) {
//             setTimelineActive(JSON.parse(saved));
//         }

//         const savedExpanded = localStorage.getItem("timelineExpandedState");
//         if (savedExpanded) {
//             setExpandedMenu(JSON.parse(savedExpanded));
//         }
//     }, []);

//     useEffect(() => {
//         localStorage.setItem("timelineActiveState", JSON.stringify(timelineActive));
//     }, [timelineActive]);

//     useEffect(() => {
//         localStorage.setItem("timelineExpandedState", JSON.stringify(expandedMenu));
//     }, [expandedMenu]);



//     const handleNavigatepages = (path: string) => {
//         navigate(path)
//     }

//     return (
//         <div className="sidebar" >
//             <div className="sidebar_inner_box" >
//                 <div className="sidebar_head_wrapper" >
//                     <div className="sidebar_head" >
//                         <img className="logo" width={48} height={48} src="/logo.png" alt="logo" />
//                         <img className="sidebar_arrow" src="/sidebar_icons/arrow_icon.svg" alt="arrow icon" />
//                     </div>
//                     <div className="search_bar">
//                         <span className="search_icon">
//                             <img src="/sidebar_icons/search_icon.svg" alt="search" />
//                         </span>
//                         <input type="text" placeholder="Search" />
//                     </div>
//                 </div>

//                 <div className="sidebar_menus_wrapper" >
//                     <button onClick={() => handleNavigatepages("/dashboard")} className={`menu_button ${params.pathname.split("?")[0] === "/dashboard" ? "active" : ""}`} >
//                         <div className="menu_button_icon_text" >
//                             <SvgIcon src="/sidebar_icons/dormitory.svg" className="sidebar-icon" />
//                             <span>Dashboard</span>
//                         </div>
//                     </button>
//                     <div className="sidebar_menus">
//                         {
//                             sidebar_menus.map((item, i) => {
//                                 return (
//                                     <div key={i} >
//                                         <p className="menus_title" >{item.title}</p>
//                                         {
//                                             item?.menus.map((menu, subI) => {
//                                                 return (
//                                                     <div key={subI} >
//                                                         {/* <button onClick={() => handleNavigatepages(menu.path)} className={`menu_button ${params.pathname.includes(menu.path) ? "active" : ""}`} > */}
//                                                         <button onClick={() => handleNavigatepages(menu.path)} className={`menu_button ${params.pathname.split("?")[0] === menu.path ? "active" : ""}`}>
//                                                             <div className="menu_button_icon_text" >
//                                                                 <SvgIcon src={menu.icon} className="sidebar-icon" />
//                                                                 <span>{menu.title}</span>
//                                                             </div>
//                                                             <SvgIcon src="/sidebar_icons/down_arrow.svg" className="sidebar-ico" />
//                                                         </button>
//                                                     </div>
//                                                 )
//                                             })
//                                         }
//                                     </div>
//                                 )
//                             })
//                         }
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Sidebar



// import { useEffect, useState } from "react";

// function SvgIcon({ src, className }: { src: string; className: string; }) {
//     const [svg, setSvg] = useState("");

//     useEffect(() => {
//         fetch(src)
//             .then(res => res.text())
//             .then(setSvg);
//     }, [src]);

//     return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
// }