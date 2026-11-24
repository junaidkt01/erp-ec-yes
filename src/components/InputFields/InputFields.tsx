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
}) => {
    return (
        <div className={`input_field ${error ? "error" : ""} ${type === "date" ? "" : "hvr_zm_in"}`}>
            {label && <label>{label}</label>}

            {type === "date" ? (
                <>
                    <DatePicker
                        value={value}
                        onChange={(date: Date | null) => {
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
                    <input
                        className={`${error ? "error" : ""}`}
                        required={required}
                        type={type}
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
