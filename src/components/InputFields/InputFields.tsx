import { useState } from "react";
import { DatePicker } from "./DatePicker";
import "./inputField.scss";

export const InputField = ({ onChange, value, type, placeHolder, label, required, error }: { onChange?: (e: any) => void; value?: string; type: string; placeHolder: string; label: string; required?: boolean; error?: string; }) => {
    const [dateValue, setDateValue] = useState(null);

    return (
        <div className={`input_field ${error ? "error" : ""}`} >
            <label>{label}</label>

            {type === "date" ? (
                <DatePicker value={dateValue} onChange={setDateValue} />
            ) : (
                <>
                    <input className={`${error ? "error" : ""}`} required={required} type={type} placeholder={placeHolder} onChange={onChange} value={value} />
                    {error &&
                        <div className="error_text_wrapper" >
                            <img src="/svgs/input_valid_error.svg" alt="..." />
                            <p className="error_text">{error}</p>
                        </div>
                    }
                </>
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