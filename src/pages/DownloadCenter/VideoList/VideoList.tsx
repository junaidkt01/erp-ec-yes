import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import YouTubePlayer from "../../../components/YouTubePlayer"
import "./VideoList.scss"

const VideoList = () => {
    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    console.log("isAddAdmissionQuery: ", isAddAdmissionQuery)
    return (
        <div className="page_wrapper">
            <div className="video_list">
                {isAddAdmissionQuery && <PopupScreen title="Add Admission Query" onClick={handleAddAdmissionQuery} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            <InputField type="text" label="Name" placeHolder="Enter name" />
                            <InputField type="text" label="Phone" placeHolder="Enter phone number" />
                            <InputField type="text" label="Email" placeHolder="Enter email address" />
                        </div>
                        <div className="body_section" >
                            <InputField type="text" label="Address" placeHolder="Enter address" />
                        </div>
                        <div className="body_section" >
                            <InputField type="text" label="Discription" placeHolder="Enter discription" />
                        </div>
                        <div className="body_section" >
                            <InputField type="date" label="Date From" placeHolder="Select date" />
                            <InputField type="date" label="Next Follow Up Date" placeHolder="Select date" />
                            <InputField type="text" label="Assigned" placeHolder="Enter assignee name" />
                        </div>

                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}
                <TableWrapper onClick={handleAddAdmissionQuery} isAddButton isSearchBar title="Content Type List" >
                    <div className="videos_list" >
                        {
                            Array.from({ length: 10 }).map((_, i) => {
                                return (
                                    <div className='player_wrapper' key={i} >
                                        <YouTubePlayer />
                                        <div className="video_details" >
                                            <p>Title Name</p>
                                            <div>
                                                <img src="/svgs/edit.svg" alt="" />
                                                <img src="/svgs/delete.svg" alt="" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </TableWrapper>
            </div>
        </div>
    )
}

export default VideoList;
