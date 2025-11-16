import { useState } from "react"

const Header = () => {
    const [searchTerm, setSearchTerm] = useState("")
    return (
        <div className="header_wrapper">
            <div className="header" >
                <div className="header_left_icons" >
                    <div className="search_selection_wrapper" >
                        <div className="search_bar_wrapper">
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
                                <span className="search_icon">
                                    <img src="/header_icons/search_close.svg" alt="search" />
                                </span>
                            </div>
                        </div>

                        {searchTerm && <div className="selection_bar">
                            <div>
                                <p>helooo</p>
                            </div>
                            <div>
                                <p>helooo</p>
                            </div>
                        </div>}
                    </div>
                </div>
                <div className="header_left_icons" >
                    <div className="icon_box" ><img src="/header_icons/notification.svg" alt="" /> </div>
                    <div className="icon_box" ><img src="/header_icons/messages.svg" alt="" /> </div>
                    <div className="icon_box" ><img src="/header_icons/profile_pic.png" alt="" /> </div>
                </div>
            </div>
        </div>
    )
}

export default Header
