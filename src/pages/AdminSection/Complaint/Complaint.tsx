import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper"
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect, StatusBar } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import "./Complaint.scss"

const Complaint = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "complaint_by", title: "Complaint By" },
        { key: "complaint_type", title: "Complaint Type" },
        { key: "source", title: "Source" },
        { key: "phone", title: "Phone" },
        { key: "date", title: "Date" },
        // { key: "progress", title: "Progress" },
    ];

    const sampleData = [
        {
            sl: "1",
            complaint_by: "John Smith",
            complaint_type: "Service Delay",
            source: "Email.",
            phone: "9876543210",
            date: "03-04-2025",
            progress: "Active",
        },
        {
            sl: "1",
            complaint_by: "John Smith",
            complaint_type: "Service Delay",
            source: "Email.",
            phone: "9876543210",
            date: "03-04-2025",
            progress: "Under Review",
        },
        {
            sl: "1",
            complaint_by: "John Smith",
            complaint_type: "Service Delay",
            source: "Email.",
            phone: "9876543210",
            date: "03-04-2025",
            progress: "In Progress",
        },
        {
            sl: "1",
            complaint_by: "John Smith",
            complaint_type: "Service Delay",
            source: "Email.",
            phone: "9876543210",
            date: "03-04-2025",
            progress: "Resolved",
        },
        {
            sl: "1",
            complaint_by: "John Smith",
            complaint_type: "Service Delay",
            source: "Email.",
            phone: "9876543210",
            date: "03-04-2025",
            progress: "Closed",
        },
    ];

    const [isAddComplaint, setIsAddComplaint] = useState(false)
    const handleAddComplaint = () => {
        setIsAddComplaint(!isAddComplaint)
    }
    return (
        <div className="page_wrapper">
            <div className="complaint_page" >
                {isAddComplaint && <PopupScreen title="Add Complaint" onClick={handleAddComplaint} >
                    <div className="popup_body" >
                        <div className="fields_wrapper" >

                            <div className="body_section" >
                                <InputField type="text" label="Complaint By" placeHolder="Enter complainant's name" />
                                <CustomSelect label="Complaint Type" placeholder="Select complaint type" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Complaint Source" placeholder="Select complaint source" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>
                            <div className="body_section" >
                                <InputField type="text" label="Phone" placeHolder="Enter phone number" />
                                <InputField type="date" label="Date" placeHolder="Select date" />
                                <CustomSelect label="Actions Taken" placeholder="Enter actions taken" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>
                            <div className="body_section" >
                                <InputField type="text" label="Address" placeHolder="Enter address" />
                            </div>
                            <div className="body_section" >
                                <InputField type="text" label="Discription" placeHolder="Enter discription" />
                            </div>

                            <div className="body_section" >
                                <input type="file" name="" id="" />
                            </div>
                        </div>

                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton isSearchBar title="Complaints" onClick={handleAddComplaint} >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        progress={(row) => (
                            <div className="actions"> <StatusBar status={row} /> </div>
                        )}
                        actions={() => (
                            <div className="actions">
                                <button><img src="/svgs/eye_open.svg" alt="" /></button>
                                <button><img src="/svgs/edit.svg" alt="" /></button>
                                <button><img src="/svgs/delete.svg" alt="" /></button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default Complaint
