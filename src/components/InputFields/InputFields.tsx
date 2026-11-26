import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { DatePicker } from "./DatePicker";
import "./inputField.scss";

export const InputField = ({
    onChange,
    value,
    type,
    placeHolder,
    label,
    name,
    required,
    error,
    disabled,
    readOnly,
    showPasswordToggle = true,
}: {
    onChange?: (value: any, name?: string) => void;
    value?: any;
    type: string;
    placeHolder: string;
    name?: string;
    label?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    readOnly?: boolean;
    showPasswordToggle?: boolean;
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className={`input_field ${error ? "error" : ""}`}>
            {label && <label>{label}</label>}

            {type === "date" ? (
                <>
                    <DatePicker
                        value={value}
                        readOnly={readOnly}
                        disabled={disabled}
                        onChange={(date: Date | null) => {
                            if (readOnly || disabled) return;
                            onChange?.(date, name);
                        }}
                    />
                    {error && (
                        <div className="error_text_wrapper">
                            <img src="/svgs/input_valid_error.svg" alt="..." />
                            <p className="error_text">{error}</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="input_wrapper">
                        <input
                            className={`${error ? "error" : ""} ${isPassword && showPasswordToggle ? "has_password_toggle" : ""}`}
                            required={required}
                            type={inputType}
                            placeholder={placeHolder}
                            name={name}
                            onChange={onChange}
                            value={value}
                            disabled={disabled}
                            readOnly={readOnly}
                            onWheel={(e) => {
                                if (type === "number") {
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                        />
                        {isPassword && showPasswordToggle && (
                            <button
                                type="button"
                                className="password_toggle_btn"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                title={showPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                                disabled={disabled}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} strokeWidth={2} />
                                ) : (
                                    <Eye size={18} strokeWidth={2} />
                                )}
                            </button>
                        )}
                    </div>
                    {error && (
                        <div className="error_text_wrapper">
                            <img src="/svgs/input_valid_error.svg" alt="..." />
                            <p className="error_text">{error}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
