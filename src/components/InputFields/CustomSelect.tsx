import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
    label?: string;
    placeholder?: string;
    options: string[];
    onChange: (value: string) => void;
}

export const CustomSelect = ({
    label,
    placeholder = "Select option",
    options,
    onChange,
}: CustomSelectProps) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const handleSelect = (opt: string) => {
        setSelected(opt);
        onChange(opt);
        setOpen(false);
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="custom_select_container" ref={ref}>
            {label && <label>{label}</label>}

            <div className="select_box" onClick={() => setOpen((prev) => !prev)}>
                <span className={selected ? "selected" : "placeholder"}>
                    {selected || placeholder}
                </span>

                <svg className={`arrow ${open ? "rotate" : ""}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 15.75L12 8.25L4.5 15.75" stroke="#212121" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>

            {open && (
                <div className="select_dropdown">
                    {options.map((opt) => (
                        <div
                            key={opt}
                            className={`dropdown_item ${selected === opt ? "active_item" : ""
                                }`}
                            onClick={() => handleSelect(opt)}
                        >
                            <StatusBar status={opt} />
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
        <p
            className="status_bar"
            style={{ backgroundColor: STATUS_COLORS[status] }}
        >
            {status}
        </p>
    );
};
