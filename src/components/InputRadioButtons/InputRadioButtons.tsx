import React from "react";
import "./InputRadioButtons.scss"

type Option = {
    label: string;
    value: string;
};

type InputRadioButtonsProps = {
    title?: string;
    options: Option[];
    selectedValue: string;
    onChange: (value: string) => void;
    name: string;
};

const InputRadioButtons: React.FC<InputRadioButtonsProps> = ({
    title,
    options,
    selectedValue,
    onChange,
    name,
}) => {
    return (
        <div className="radio_group">
            {title && <h3 className="radio_title">{title}</h3>}

            <div className="radio_options">
                {options.map((option) => (
                    <label key={option.value} className="radio_item">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={selectedValue === option.value}
                            onChange={() => onChange(option.value)}
                        />
                        <span className="custom_radio" />
                        {option.label}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default InputRadioButtons;