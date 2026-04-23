import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
// import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const StudentPromote = () => {
    // const [page, setPage] = useState(1);
    // const columns: Column[] = [
    //     { key: "sl", title: "SL" },
    //     { key: "admission_no", title: "Admission No" },
    //     { key: "name", title: "Name" },
    //     { key: "father_name", title: "Father Name" },
    //     { key: "date_of_birth", title: "Date of birth" },
    //     { key: "class_and_section", title: "Class & Section" },
    //     { key: "gender", title: "Gender" },
    //     { key: "type", title: "Type" },
    // ];

    // const sampleData = [
    //     {
    //         sl: 1,
    //         admission_no: "John Smith",
    //         name: "John Smith",
    //         father_name: "Nazer",
    //         date_of_birth: "03-04-2025.",
    //         class_and_section: "8 B",
    //         gender: "Female",
    //         type: "-",
    //     },
    // ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="student_promote">
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
                <TableWrapper isAddButton title="Student Promote" onClick={handleAddAdmissionQuery} >
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
                                    <CustomSelect label="Choose Enquiry Source" placeholder="Select source" onChange={(val) => console.log("Selected:", val)} />
                                    <CustomSelect label="Choose Status" placeholder="Select status" onChange={(val) => console.log("Selected:", val)} />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Search" />
                            </div>
                        </div>
                    </div>
                </TableWrapper>
                {/* <TableWrapper isAddButton isSearchBar title="Student List" >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        actions={() => (
                            <div className="actions">
                                <button><img src="/svgs/eye_open.svg" alt="" /></button>
                                <button><img src="/svgs/edit.svg" alt="" /></button>
                                <button><img src="/svgs/delete.svg" alt="" /></button>
                                <button><img src="/svgs/block.svg" alt="" /></button>
                            </div>
                        )}
                    />
                </TableWrapper> */}
            </div>
        </div>
    )
}

export default StudentPromote;