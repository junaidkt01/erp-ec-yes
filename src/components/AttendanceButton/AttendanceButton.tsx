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
    active?: boolean;
    onClick?: (status: StatusType) => void;
    disabled?: boolean;
    className?: string;
}

const AttendanceButton: React.FC<AttendanceButtonProps> = ({
    status,
    title,
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
        >
            {title}
        </button>
    );
};

export default AttendanceButton;