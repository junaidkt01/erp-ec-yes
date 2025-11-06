import { useLocation, useNavigate } from "react-router-dom"
import { sidebar_menus } from "../utils"

const Sidebar = () => {
    const params = useLocation()
    const navigate = useNavigate()

    const handleNavigatepages = (path: string) => {
        navigate(path)
    }

    return (
        <div className="sidebar" >
            <div className="sidebar_inner_box" >
                <div className="sidebar_head_wrapper" >
                    <div className="sidebar_head" >
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

                <div className="sidebar_menus_wrapper" >
                    {/* <button onClick={() => handleNavigatepages("/dashboard")} className={`menu_button dashboard ${params.pathname.includes("/dashboard") ? "active" : ""}`} > */}
                    <button onClick={() => handleNavigatepages("/dashboard")} className={`menu_button ${params.pathname.split("?")[0] === "/dashboard" ? "active" : ""}`} >
                        <div className="menu_button_icon_text" >
                            <SvgIcon src="/sidebar_icons/dormitory.svg" className="sidebar-icon" />
                            <span>Dashboard</span>
                        </div>
                    </button>
                    <div className="sidebar_menus">
                        {
                            sidebar_menus.map((item, i) => {
                                return (
                                    <div key={i} >
                                        <p className="menus_title" >{item.title}</p>
                                        {
                                            item?.menus.map((menu, subI) => {
                                                return (
                                                    <div key={subI} >
                                                        {/* <button onClick={() => handleNavigatepages(menu.path)} className={`menu_button ${params.pathname.includes(menu.path) ? "active" : ""}`} > */}
                                                        <button onClick={() => handleNavigatepages(menu.path)} className={`menu_button ${params.pathname.split("?")[0] === menu.path ? "active" : ""}`}>
                                                            <div className="menu_button_icon_text" >
                                                                <SvgIcon src={menu.icon} className="sidebar-icon" />
                                                                <span>{menu.title}</span>
                                                            </div>
                                                            <SvgIcon src="/sidebar_icons/down_arrow.svg" className="sidebar-ico" />
                                                        </button>

                                                        {/* <div>
                                                            <button>test button</button>
                                                            <button>test button</button>
                                                            <button>test button</button>
                                                        </div> */}
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar



import { useEffect, useState } from "react";

function SvgIcon({ src, className }: { src: string; className: string; }) {
    const [svg, setSvg] = useState("");

    useEffect(() => {
        fetch(src)
            .then(res => res.text())
            .then(setSvg);
    }, [src]);

    return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}
