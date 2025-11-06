const Header = () => {
    return (
        <div className="header" >
            <div className="header_left_icons" >
                <div className="search_selection_wrapper" >
                    <div className="search_bar_wrapper">
                        <div className="search_bar" >
                            <span className="search_icon">
                                <img src="/header_icons/search_icon.svg" alt="search" />
                            </span>
                            <input type="text" placeholder="Search Name/Admission.." />
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

                    {/* <div className="selection_bar">
                        <div>
                            <p>helooo</p>
                        </div>
                        <div>
                            <p>helooo</p>
                        </div>
                    </div> */}
                </div>
            </div>
            <div className="header_left_icons" >
                <div className="icon_box" ><img src="/header_icons/notification.svg" alt="" /> </div>
                <div className="icon_box" ><img src="/header_icons/messages.svg" alt="" /> </div>
                <div className="icon_box" ><img src="/header_icons/profile_pic.png" alt="" /> </div>
            </div>
        </div>
    )
}

export default Header
