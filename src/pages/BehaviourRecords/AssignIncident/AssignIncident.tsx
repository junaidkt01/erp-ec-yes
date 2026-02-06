import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const AssignIncident = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "student_name", title: "Student Name" },
        { key: "total_incident", title: "Total Incident" },
    ];

    const sampleData = [
        {
            sl: 1,
            student_name: "Laya Sayd",
            total_incident: 1,
        },
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="assign_incident">
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
                <TableWrapper title="Assign Incident" onClick={handleAddAdmissionQuery} >
                    <div className="search_screen">
                        <p className="search_screen_title" >Select Criteria</p>
                        <div className="popup_body" >
                            <div className="fields_wrapper" >
                                <div className="body_section" >
                                    <InputField type="date" label="Date From" placeHolder="Select date" />
                                    <InputField type="date" label="Date From" placeHolder="Select date" />
                                    <InputField type="date" label="Date To" placeHolder="Select date" />
                                </div>
                                <div className="body_section" >
                                    <CustomSelect label="Choose Enquiry Source" placeholder="Select source" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                    <CustomSelect label="Choose Status" placeholder="Select status" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Search" />
                            </div>
                        </div>
                    </div>
                </TableWrapper>
                <TableWrapper isAddButton isSearchBar title="Assign Incident List" >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        actions={() => (
                            <div className="actions">
                                <button><img src="/svgs/click_student.svg" alt="" /></button>
                                <button><img src="/svgs/eye_open.svg" alt="" /></button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default AssignIncident;