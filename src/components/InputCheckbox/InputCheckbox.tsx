import React from "react";
import "./InputCheckbox.scss";

type InputCheckboxProps = {
  checked: boolean;
  onChange: () => void;
  label?: string;
};

const InputCheckbox: React.FC<InputCheckboxProps> = ({ checked, onChange, label }) => {
  return (
    <label className="checkbox_item" htmlFor={label} >                                                                                                           
      <input type="checkbox" checked={checked} onChange={onChange} id={label} />
      <span className="custom_checkbox" />
      {label && label}
    </label>
  );
};

export default InputCheckbox;