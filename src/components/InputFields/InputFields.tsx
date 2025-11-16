import { useState } from "react";
import { DatePicker } from "./DatePicker";
import "./inputField.scss";

export const InputField = ({ type, placeHolder, label }: { type: string; placeHolder: string; label: string; }) => {
    const [dateValue, setDateValue] = useState(null);

    return (
        <div className="input_field">
            <label>{label}</label>

            {type === "date" ? (
                <DatePicker value={dateValue} onChange={setDateValue} />
            ) : (
                <input type={type} placeholder={placeHolder} />
            )}
        </div>
    );
};


// import "./inputField.scss"

// export const InputField = ({ type, placeHolder, label }: { type: string; placeHolder: string; label: string; }) => {
//     return (
//         <div className="input_field" >
//             <label htmlFor="">{label}</label>
//             <input type={type} placeholder={placeHolder} />
//         </div>
//     )
// }