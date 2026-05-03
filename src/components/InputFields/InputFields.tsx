import { DatePicker } from "./DatePicker";

export const InputField = ({ onChange, value, type, placeHolder, label, name, required, error }: {
    onChange?: (value: any, name?: string) => void;
    value?: any; type: string; placeHolder: string; name?: string;
    label: string; required?: boolean; error?: string;
}) => {
    return (
        <div className={`input_field ${error ? "error" : ""}`} >
            <label>{label}</label>

            {type === "date" ? (
                <>
                    <DatePicker
                        value={value}
                        onChange={(date: Date) => {
                            onChange?.(date, name);
                        }}
                    />
                    {error &&
                        <div className="error_text_wrapper" >
                            <img src="/svgs/input_valid_error.svg" alt="..." />
                            <p className="error_text">{error}</p>
                        </div>
                    }
                </>
            ) : (
                <>
                    <input
                        className={`${error ? "error" : ""}`}
                        required={required}
                        type={type}
                        placeholder={placeHolder}
                        name={name}
                        onChange={onChange}
                        value={value}
                    />
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

// import { useState } from "react";
// import { DatePicker } from "./DatePicker";
// import "./inputField.scss";

// export const InputField = ({ onChange, value, type, placeHolder, label, name, required, error }: { onChange?: (e: any) => void; value?: string; type: string; placeHolder: string; name?: string; label: string; required?: boolean; error?: string; }) => {
//     const [dateValue, setDateValue] = useState(null);

//     return (
//         <div className={`input_field ${error ? "error" : ""}`} >
//             <label>{label}</label>

//             {type === "date" ? (
//                 <DatePicker value={dateValue} onChange={setDateValue} />
//             ) : (
//                 <>
//                     <input className={`${error ? "error" : ""}`} required={required} type={type} placeholder={placeHolder} name={name} onChange={onChange} value={value} />
//                     {error &&
//                         <div className="error_text_wrapper" >
//                             <img src="/svgs/input_valid_error.svg" alt="..." />
//                             <p className="error_text">{error}</p>
//                         </div>
//                     }
//                 </>
//             )}
//         </div>
//     );
// };