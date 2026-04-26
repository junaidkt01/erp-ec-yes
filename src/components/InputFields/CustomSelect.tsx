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
}

export const CustomSelect = ({
    value,
    label,
    placeholder = "Select option",
    options,
    onChange,
}: CustomSelectProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Find selected option from value
    const selectedOption = options?.find((opt) => opt.value === value);

    // Close dropdown when clicking outside
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
        onChange(opt.value); // only store value (id)
        setOpen(false);
    };

    return (
        <div className="custom_select_container" ref={ref}>
            {label && <label>{label}</label>}

            <div className="select_box" onClick={() => setOpen((prev) => !prev)}>
                <span className={selectedOption ? "selected" : "placeholder"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <svg
                    className={`arrow ${open ? "rotate" : ""}`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M19.5 15.75L12 8.25L4.5 15.75"
                        stroke="#212121"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {open && (
                <div className="select_dropdown">
                    {options?.map((opt) => (
                        <div
                            key={opt.value}
                            className={`dropdown_item ${value === opt.value ? "active_item" : ""
                                }`}
                            onClick={() => handleSelect(opt)}
                        >
                            <p>{opt.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// import { useState, useRef, useEffect } from "react";

// interface CustomSelectProps {
//     value?: string;
//     label?: string;
//     placeholder?: string;
//     options: any;
//     // options: string[];
//     onChange: (value: string) => void;
//     name?: string;
// }

// export const CustomSelect = ({ value, label, placeholder = "Select option", options, onChange, name }: CustomSelectProps) => {
//     const [open, setOpen] = useState(false);
//     const [selected, setSelected] = useState("");
//     const ref = useRef<HTMLDivElement>(null);

//     const handleSelect = (opt?: string | any, id?: string | any) => {
//         setSelected(opt);
//         onChange(id || opt);
//         setOpen(false);
//     };

//     // Close when clicking outside
//     useEffect(() => {
//         if (value) {
//             setSelected(value);
//             onChange(value);
//         }

//         const handleClickOutside = (e: MouseEvent) => {
//             if (ref.current && !ref.current.contains(e.target as Node)) {
//                 setOpen(false);
//             }
//         };
//         document.addEventListener("click", handleClickOutside);
//         return () => document.removeEventListener("click", handleClickOutside);
//     }, []);

//     return (
//         <div className="custom_select_container" ref={ref}>
//             {label && <label>{label}</label>}

//             <div className="select_box" onClick={() => setOpen((prev) => !prev)}>
//                 <span className={selected ? "selected" : "placeholder"}>
//                     {selected || placeholder}
//                 </span>

//                 <svg className={`arrow ${open ? "rotate" : ""}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M19.5 15.75L12 8.25L4.5 15.75" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//             </div>

//             {(open && name === "academic_year_id") && (
//                 <div className="select_dropdown" >
//                     {options.map((opt: { id: string; label: string }) => (
//                         <div
//                             key={opt.id}
//                             className={`dropdown_item ${selected === opt.id ? "active_item" : ""}`}
//                             onClick={() => handleSelect(opt.label, opt.id)} >
//                             <p>{opt.label}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {(open && name === "class_id") && (
//                 <div className="select_dropdown" >
//                     {options.map((opt: { id: string; name: string }) => (
//                         <div
//                             key={opt.id}
//                             className={`dropdown_item ${selected === opt.id ? "active_item" : ""}`}
//                             onClick={() => handleSelect(opt.name, opt.id)} >
//                             <p>{opt.name}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {(open && name === "section_id") && (
//                 <div className="select_dropdown" >
//                     {options.map((opt: { id: string; name: string }) => (
//                         <div
//                             key={opt.id}
//                             className={`dropdown_item ${selected === opt.id ? "active_item" : ""}`}
//                             onClick={() => handleSelect(opt.name, opt.id)} >
//                             <p>{opt.name}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {(open && name === "gender") && (
//                 <div className="select_dropdown" >
//                     {options.map((opt: string) => (
//                         <div
//                             key={opt}
//                             className={`dropdown_item ${selected === opt ? "active_item" : ""}`}
//                             onClick={() => handleSelect(opt)} >
//                             <p>{opt}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {(open && name === "religion") && (
//                 <div className="select_dropdown" >
//                     {options.map((opt: string) => (
//                         <div
//                             key={opt}
//                             className={`dropdown_item ${selected === opt ? "active_item" : ""}`}
//                             onClick={() => handleSelect(opt)} >
//                             <p>{opt}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {(open && name === "blood_group") && (
//                 <div className="select_dropdown" >
//                     {options.map((opt: string) => (
//                         <div
//                             key={opt}
//                             className={`dropdown_item ${selected === opt ? "active_item" : ""}`}
//                             onClick={() => handleSelect(opt)} >
//                             <p>{opt}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {(open && name === "") && (
//                 <div className="select_dropdown">
//                     {options.map((opt: string) => (
//                         <div
//                             key={opt}
//                             className={`dropdown_item ${selected === opt ? "active_item" : ""}`}
//                             onClick={() => handleSelect(opt)} >
//                             <StatusBar status={opt} />
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

const STATUS_COLORS: Record<string, string> = {
    Active: "#6C757D",
    "Under Review": "#0069F6",
    "In Progress": "#00A4BD",
    Resolved: "#28A745",
    Closed: "#6F42C1",
};

export const StatusBar = ({ status }: { status: string }) => {
    return (
        <p
            className="status_bar"
            style={{ backgroundColor: STATUS_COLORS[status] }}
        >
            {status}
        </p>
    );
};











// // const a = {
// //     "id": 34,
// //     "user_id": 71,
// //     "admission_no": "as1231",
// //     "admission_date": null,
// //     "roll_no": "14",
// //     "first_name": "junaid",
// //     "last_name": "kt",
// //     "dob": null,
// //     "religion": "Muslim",
// //     "caste": "mappila",
// //     "blood_group": "B+",
// //     "height": null,
// //     "weight": null,
// //     "as_on_date": null,
// //     "gender": "Male",
// //     "phone": null,
// //     "emergency_phone": null,
// //     "alternate_phone": null,
// //     "email": "ju@gmail.com",
// //     "category_id": null,
// //     "student_group_id": null,
// //     "photo": null,
// //     "status": 1,
// //     "created_at": "2026-04-15T19:19:54.000000Z",
// //     "updated_at": "2026-04-15T19:19:54.000000Z",
// //     "deleted_at": null,
// //     "class_id": 3,
// //     "section_id": 5,
// //     "address": null,
// //     "date_of_birth": null,
// //     "nationality": null,
// //     "current_address": "ullincheerathil house, koomanna, olakara post",
// //     "permanent_address": "koomanna",
// //     "bank_account_no": null,
// //     "bank_name": null,
// //     "ifsc_code": null,
// //     "national_id_no": "121212121212",
// //     "local_id_no": null,
// //     "birth_certificate_no": "1243323",
// //     "previous_school_name": "najath",
// //     "previous_qualification": "10",
// //     "medical_history": null,
// //     "previous_school_details": "hss school, kadappadi",
// //     "note": "note",
// //     "is_disabled": 0,
// //     "disable_reason": null,
// //     "disable_date": null,
// //     "route_id": null,
// //     "vehicle_id": null,
// //     "dormitory_id": null,
// //     "room_id": null,
// //     "class": {
// //         "id": 3,
// //         "name": "LKG",
// //         "branch_id": 1,
// //         "academic_year_id": 1,
// //         "created_at": "2026-03-13T02:26:44.000000Z",
// //         "updated_at": "2026-03-13T02:33:41.000000Z",
// //         "deleted_at": null
// //     },
// //     "section": {
// //         "id": 5,
// //         "class_id": 7,
// //         "name": "B",
// //         "created_at": "2026-04-10T14:42:45.000000Z",
// //         "updated_at": "2026-04-10T14:42:45.000000Z",
// //         "deleted_at": null
// //     },
// //     "parents": {
// //         "id": 29,
// //         "student_id": 34,
// //         "father_name": "basheer",
// //         "father_phone": "342342343",
// //         "father_email": null,
// //         "father_occupation": null,
// //         "father_photo": null,
// //         "mother_name": "fathima",
// //         "mother_phone": "1231233213",
// //         "mother_email": null,
// //         "mother_occupation": null,
// //         "mother_photo": null,
// //         "guardian_name": null,
// //         "guardian_phone": null,
// //         "guardian_occupation": null,
// //         "guardian_email": "juna@gmail.com",
// //         "guardian_relation": "bro",
// //         "guardian_address": "ullincheerathil house, koomanna, olakara post",
// //         "guardian_photo": null,
// //         "guardian_is": null,
// //         "created_at": "2026-04-15T19:19:54.000000Z",
// //         "updated_at": "2026-04-15T19:19:54.000000Z",
// //         "deleted_at": null
// //     },
// //     "user": {
// //         "id": 71,
// //         "branch_id": null,
// //         "name": "junaid",
// //         "email": "ju@gmail.com",
// //         "two_factor_confirmed_at": null,
// //         "is_active": 1,
// //         "created_at": "2026-04-15T19:19:54.000000Z",
// //         "updated_at": "2026-04-15T19:19:54.000000Z",
// //         "deleted_at": null
// //     },
// //     "group": null,
// //     "route": null,
// //     "vehicle": null,
// //     "dormitory": null,
// //     "room": null,
// //     "emergency_contacts": []
// // }