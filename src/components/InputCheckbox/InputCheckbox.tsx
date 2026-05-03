import React from "react";
import "./InputCheckbox.scss";

type InputCheckboxProps = {
  checked: boolean;
  onChange: () => void;
  label?: string;
};

const InputCheckbox: React.FC<InputCheckboxProps> = ({
  checked,
  onChange,
  label,
}) => {
  return (
    <label className="checkbox_item">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="custom_checkbox" />
      {label && label}
    </label>
  );
};

export default InputCheckbox;