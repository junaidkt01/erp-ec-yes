
import React from "react";
import { PrimaryButton, SecondaryButton } from "./Buttons/Buttons";

export type RoleType = "default" | "custom";

interface RoleAccessToggleProps {
    value: RoleType;
    onChange: (value: RoleType) => void;
    disabled?: boolean;
}

const RoleAccessToggle: React.FC<RoleAccessToggleProps> = ({
    value,
    onChange,
    disabled = false,
}) => {
    const options: { label: string; value: RoleType }[] = [
        { label: "Default role", value: "default" },
        { label: "Custom role", value: "custom" },
    ];

    return (
        <div className="flex flex-col gap-1">
            {/* <label className="text-[14px] font-medium text-[#212121]">
                Role & access
            </label> */}

            <div className="inline-flex w-fit items-center rounded-lg bg-[#F5F5F5] p-1 gap-1">
                {options.map((option) => {
                    const isActive = value === option.value;

                    return isActive ? (
                        <PrimaryButton
                            key={option.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(option.value)}
                            title={option.label}
                        />
                    ) : (
                        <SecondaryButton
                            key={option.value}
                            disable={disabled}
                            onClick={() => onChange(option.value)}
                            title={option.label}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default RoleAccessToggle;

//   <button
//                             key={option.value}
//                             type="button"
//                             disabled={disabled}
//                             onClick={() => onChange(option.value)}
//                             className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150
//                                 ${isActive
//                                     ? "bg-white text-[#2950DA] shadow-sm border border-[#E5E7EB]"
//                                     : "border border-transparent bg-transparent text-[#666666] hover:text-[#212121]"
//                                 }
//                                 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
//                             `}
//                         >
//                             {option.label}
//                         </button>