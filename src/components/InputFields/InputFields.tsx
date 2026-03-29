import { useState } from "react";
import { DatePicker } from "./DatePicker";
import "./inputField.scss";

export const InputField = ({ onChange, value, type, placeHolder, label, required }: { onChange?: (e: any) => void; value?: string; type: string; placeHolder: string; label: string; required?: boolean; }) => {
    const [dateValue, setDateValue] = useState(null);

    return (
        <div className="input_field">
            <label>{label}</label>

            {type === "date" ? (
                <DatePicker value={dateValue} onChange={setDateValue} />
            ) : (
                <input required={required} type={type} placeholder={placeHolder} onChange={onChange} value={value} />
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