import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const PhoneCallLog = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "name", title: "Name" },
        { key: "phone", title: "Phone" },
        { key: "date", title: "Date" },
        { key: "follow_up_date", title: "Follow Up Date" },
        { key: "call_duration", title: "Call Duration" },
        { key: "description", title: "Description" },
    ];

    const sampleData = [
        {
            name: "John Smith",
            phone: "+1 212-555-1234",
            date: "03-04-2025",
            follow_up_date: "03-04-2025",
            complaint_type: "Service Delay",
            call_duration: "15 min",
            description: "Discussed project timeline",
        },
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="phone_call_log">
                {isAddAdmissionQuery && <PopupScreen title="Add Phone Call Log" onClick={handleAddAdmissionQuery} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            <InputField type="text" label="Name" placeHolder="Enter name" />
                            <InputField type="text" label="Phone" placeHolder="Enter phone" />
                        </div>
                        <div className="body_section" >
                            <InputField type="date" label="Date" placeHolder="Enter complainant's name" />
                            <InputField type="date" label="Follow Up date" placeHolder="Enter complainant's name" />
                        </div>
                        <div className="body_section" >
                            <InputField type="text" label="Call Duration" placeHolder="Enter call duration" />
                        </div>
                        <div className="body_section" >
                            <InputField type="text" label="Description" placeHolder="Enter description" />
                        </div>

                        <div>
                            <p>Type</p>

                            <div>
                                <input type="radio" name="" id="" />
                                <input type="radio" name="" id="" />
                            </div>
                        </div>

                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton isSearchBar title="Phone Call Log" onClick={handleAddAdmissionQuery} >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default PhoneCallLog;