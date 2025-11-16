import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import { CustomSelect } from "../InputFields/CustomSelect";
import { InputField } from "../InputFields/InputFields";
import "./PopupScreen.scss"

const PopupScreen = () => {
    return (
        <div className="popup_screen_overlay" >
            <div className="popup_screen" >
                <div className="popup_header" >
                    <p>Add Complaint</p>
                    <img src="/svgs/close.svg" alt="" />
                </div>

                <div className="popup_body" >
                    <div className="body_section" >
                        <InputField type="text" label="Complaint By" placeHolder="Enter complainant's name" />
                        <CustomSelect label="Choose Status" placeholder="Select status" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                        <InputField type="text" label="Complaint By" placeHolder="Enter complainant's name" />
                    </div>
                    <div className="body_section" >
                        <InputField type="date" label="Complaint By" placeHolder="Enter complainant's name" />
                        <InputField type="text" label="Complaint By" placeHolder="Enter complainant's name" />
                        <InputField type="text" label="Complaint By" placeHolder="Enter complainant's name" />
                    </div>
                    <div className="body_section" >
                        <InputField type="text" label="Complaint By" placeHolder="Enter complainant's name" />
                    </div>
                    <div className="body_section" >
                        <InputField type="text" label="Complaint By" placeHolder="Enter complainant's name" />
                    </div>

                    <div className="buttons">
                        <SecondaryButton />
                        <PrimaryButton />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PopupScreen;
