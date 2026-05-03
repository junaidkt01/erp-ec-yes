import { useState, useRef, useEffect } from "react";

interface Option {
    label: string;
    value: string | number;
}

interface CustomSelectProps {
    value?: string | number | boolean;
    label?: string;
    placeholder?: string;
    options?: Option[];
    onChange: (value: string | number) => void;
    name?: string;
    error?: string;
}

export const CustomSelect = ({
    value, label, placeholder = "Select option",
    options, onChange, error
}: CustomSelectProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selectedOption = options?.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSelect = (opt: Option) => {
        onChange(opt.value);
        setOpen(false);
    };

    return (
        <div className={`custom_select_container ${open ? "is-open" : ""}`} ref={ref}>
            {label && <label>{label}</label>}

            <div className={`select_box ${open ? "open" : ""}`} onClick={() => setOpen((prev) => !prev)}>
                <span className={selectedOption ? "selected" : "placeholder"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`arrow ${open ? "rotate" : ""}`}
                    width="24" height="24" viewBox="0 0 24 24" fill="none"
                >
                    <path d="M19.5 15.75L12 8.25L4.5 15.75"
                        stroke="#605dec" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"
                    />
                </svg>
            </div>

            {error && (
                <div className="error_text_wrapper">
                    <img src="/svgs/input_valid_error.svg" alt="..." />
                    <p className="error_text">{error}</p>
                </div>
            )}

            {open && (
                <div className="select_dropdown">
                    {options?.map((opt) => (
                        <div
                            key={opt.value}
                            className={`dropdown_item ${value === opt.value ? "active_item" : ""}`}
                            onClick={() => handleSelect(opt)}
                        >
                            <svg className="check_icon" viewBox="0 0 14 14" fill="none">
                                <path d="M2.5 7l3 3 6-6" stroke="currentColor"
                                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p>{opt.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const STATUS_COLORS: Record<string, string> = {
    Active: "#6C757D",
    "Under Review": "#0069F6",
    "In Progress": "#00A4BD",
    Resolved: "#28A745",
    Closed: "#6F42C1",
};

export const StatusBar = ({ status }: { status: string }) => {
    return (
        <p className="status_bar" style={{ backgroundColor: STATUS_COLORS[status] }}>
            {status}
        </p>
    );
};

// import { useState, useRef, useEffect } from "react";

// interface Option {
//     label: string;
//     value: string | number;
// }

// interface CustomSelectProps {
//     value?: string | number | boolean;
//     label?: string;
//     placeholder?: string;
//     options?: Option[];
//     onChange: (value: string | number) => void;
//     name?: string;
//     error?: string;
// }

// export const CustomSelect = ({
//     value,
//     label,
//     placeholder = "Select option",
//     options,
//     onChange,
//     error
// }: CustomSelectProps) => {
//     const [open, setOpen] = useState(false);
//     const ref = useRef<HTMLDivElement>(null);

//     // Find selected option from value
//     const selectedOption = options?.find((opt) => opt.value === value);

//     // Close dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (e: MouseEvent) => {
//             if (ref.current && !ref.current.contains(e.target as Node)) {
//                 setOpen(false);
//             }
//         };
//         document.addEventListener("click", handleClickOutside);
//         return () => document.removeEventListener("click", handleClickOutside);
//     }, []);

//     const handleSelect = (opt: Option) => {
//         onChange(opt.value); // only store value (id)
//         setOpen(false);
//     };

//     return (
//         <div className="custom_select_container" ref={ref}>
//             {label && <label>{label}</label>}

//             <div className="select_box" onClick={() => setOpen((prev) => !prev)}>
//                 <span className={selectedOption ? "selected" : "placeholder"}>
//                     {selectedOption ? selectedOption.label : placeholder}
//                 </span>

//                 <svg
//                     className={`arrow ${open ? "rotate" : ""}`}
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                 >
//                     <path
//                         d="M19.5 15.75L12 8.25L4.5 15.75"
//                         stroke="#212121"
//                         strokeWidth="1.5"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                     />
//                 </svg>
//             </div>
//             {error &&
//                 <div className="error_text_wrapper" >
//                     <img src="/svgs/input_valid_error.svg" alt="..." />
//                     <p className="error_text">{error}</p>
//                 </div>
//             }

//             {open && (
//                 <div className="select_dropdown">
//                     {options?.map((opt) => (
//                         <div
//                             key={opt.value}
//                             className={`dropdown_item ${value === opt.value ? "active_item" : ""
//                                 }`}
//                             onClick={() => handleSelect(opt)}
//                         >
//                             <p>{opt.label}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// const STATUS_COLORS: Record<string, string> = {
//     Active: "#6C757D",
//     "Under Review": "#0069F6",
//     "In Progress": "#00A4BD",
//     Resolved: "#28A745",
//     Closed: "#6F42C1",
// };

// export const StatusBar = ({ status }: { status: string }) => {
//     return (
//         <p
//             className="status_bar"
//             style={{ backgroundColor: STATUS_COLORS[status] }}
//         >
//             {status}
//         </p>
//     );
// };