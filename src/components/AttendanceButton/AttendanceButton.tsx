import React from "react";
import "./AttendanceButton.scss";

export type StatusType =
    | "present"
    | "late"
    | "absent"
    | "half-day"
    | "leave";

interface AttendanceButtonProps {
    status: StatusType;
    title: string;
    /** Short label shown on mobile. Defaults to the first letter of `title`. */
    shortTitle?: string;
    active?: boolean;
    onClick?: (status: StatusType) => void;
    disabled?: boolean;
    className?: string;
}

const AttendanceButton: React.FC<AttendanceButtonProps> = ({
    status,
    title,
    shortTitle,
    active = false,
    onClick,
    disabled = false,
    className = "",
}) => {
    const handleClick = () => {
        if (disabled) return;
        onClick?.(status);
    };

    return (
        <button
            type="button"
            className={`attendance_button status_${status} ${active ? "active" : ""
                } ${disabled ? "disabled" : ""} ${className}`}
            onClick={handleClick}
            disabled={disabled}
            title={title}
            aria-label={title}
        >
            <span className="attendance_button_full">{title}</span>
            <span className="attendance_button_short" aria-hidden="true">
                {shortTitle ?? title.charAt(0)}
            </span>
        </button>
    );
};

export default AttendanceButton;