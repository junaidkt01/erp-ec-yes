import { useState } from "react";
import "./PopupScreen.scss";

const PopupScreen = ({ children, onClick }: { children: any; onClick?: any }) => {
    const [closing, setClosing] = useState(false);

    const handleClose = () => {
        setClosing(true);


        setTimeout(() => {
            onClick && onClick();
        }, 250);
    };

    return (
        <div className={`popup_screen_overlay ${closing ? "closing" : ""}`}>
            <div className={`popup_screen ${closing ? "closing" : ""}`}>
                <div className="popup_header">
                    <p>Add Complaint</p>
                    <img src="/svgs/close.svg" onClick={handleClose} />
                </div>

                {children}
            </div>
        </div>
    );
};

export default PopupScreen;


// import "./PopupScreen.scss"

// const PopupScreen = ({ children, onClick }: { children: any; onClick?: any }) => {
    
//     return (
//         <div className="popup_screen_overlay" >
//             <div className="popup_screen" >
//                 <div className="popup_header" >
//                     <p>Add Complaint</p>
//                     <img src="/svgs/close.svg" alt="" onClick={onClick} />
//                 </div>

//                 {children}
//             </div>
//         </div>
//     )
// }

// export default PopupScreen;
