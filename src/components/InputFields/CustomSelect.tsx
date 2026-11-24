import { useState, useRef, useEffect, useMemo } from "react";

export interface Option {
    label: string;
    value: string | number;
}

export interface CustomSelectProps {
    value?: string | number | boolean | null;
    label?: string;
    placeholder?: string;
    options?: Option[];
    onChange: (value: any) => void;
    onClear?: () => void;
    name?: string;
    error?: string;
    disabled?: boolean;
    isClearable?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    required?: boolean;
    className?: string;
}

export const CustomSelect = ({
    value,
    label,
    placeholder = "Select option",
    options = [],
    onChange,
    onClear,
    name,
    error,
    disabled = false,
    isClearable = true,
    searchable = true,
    searchPlaceholder = "Search...",
    required = false,
    className = "",
}: CustomSelectProps) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(() => {
        if (value === undefined || value === null || value === "") return null;
        return options.find((opt) => opt.value == value) || null;
    }, [options, value]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        const query = searchTerm.toLowerCase();
        return options.filter((opt) =>
            (opt.label || "").toLowerCase().includes(query)
        );
    }, [options, searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle open/close side effects (focus search, reset highlight)
    useEffect(() => {
        if (open) {
            setSearchTerm("");
            if (selectedOption) {
                const idx = filteredOptions.findIndex((opt) => opt.value === selectedOption.value);
                setHighlightedIndex(idx >= 0 ? idx : 0);
            } else {
                setHighlightedIndex(0);
            }

            if (searchable) {
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 50);
            }
        } else {
            setSearchTerm("");
            setHighlightedIndex(-1);
        }
    }, [open, searchable]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (open && listRef.current && highlightedIndex >= 0) {
            const items = listRef.current.querySelectorAll<HTMLDivElement>(".dropdown_item");
            const item = items[highlightedIndex];
            if (item) {
                item.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }, [highlightedIndex, open]);

    const handleSelect = (opt: Option) => {
        onChange(opt.value);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        onChange("");
        onClear?.();
    };

    const toggleOpen = () => {
        if (disabled) return;
        setOpen((prev) => !prev);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        if (!open) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : -1
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    filteredOptions.length > 0
                        ? (prev - 1 + filteredOptions.length) % filteredOptions.length
                        : -1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setOpen(false);
                break;
            default:
                break;
        }
    };

    const hasValue = selectedOption !== null;

    return (
        <div
            className={`custom_select_container ${open ? "is-open" : "hvr_zm_in"} ${className}`}
            ref={containerRef}
            onKeyDown={handleKeyDown}
        >
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={value !== undefined && value !== null ? String(value) : ""}
                />
            )}
            {label && (
                <label>
                    {label}
                    {required && <span className="required_star"> *</span>}
                </label>
            )}

            <div
                className={`select_box ${open ? "open" : ""} ${disabled ? "disabled" : ""}`}
                onClick={toggleOpen}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span className={`select_value ${hasValue ? "selected" : "placeholder"}`}>
                    {hasValue ? selectedOption.label : placeholder}
                </span>

                <div className="select_actions">
                    {isClearable && !disabled && hasValue && (
                        <button
                            type="button"
                            className="clear_button"
                            onClick={handleClear}
                            aria-label="Remove selected value"
                            title="Remove selected value"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}

                    <svg
                        className={`arrow ${open ? "rotate" : ""}`}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M19.5 15.75L12 8.25L4.5 15.75"
                            stroke="#605dec"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            {error && (
                <div className="error_text_wrapper">
                    <img src="/svgs/input_valid_error.svg" alt="..." />
                    <p className="error_text">{error}</p>
                </div>
            )}

            {open && !disabled && (
                <div className="select_dropdown">
                    {searchable && (
                        <div className="select_search_wrapper">
                            <div className="search_input_container">
                                <svg
                                    className="search_icon"
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="select_search_input"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setHighlightedIndex(0);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        className="clear_search_btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchTerm("");
                                            searchInputRef.current?.focus();
                                        }}
                                        title="Clear search"
                                    >
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="dropdown_options_list" ref={listRef} role="listbox">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = opt.value == value;
                                const isHighlighted = highlightedIndex === idx;

                                return (
                                    <div
                                        key={opt.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        className={`dropdown_item ${isSelected ? "active_item" : ""} ${
                                            isHighlighted ? "highlighted" : ""
                                        }`}
                                        onClick={() => handleSelect(opt)}
                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                    >
                                        <svg className="check_icon" viewBox="0 0 14 14" fill="none">
                                            <path
                                                d="M2.5 7l3 3 6-6"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <p>{opt.label}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="dropdown_no_options">
                                <span>No options found</span>
                            </div>
                        )}
                    </div>
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
