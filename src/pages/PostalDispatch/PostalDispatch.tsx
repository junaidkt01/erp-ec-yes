import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons"
import { CustomSelect } from "../../components/InputFields/CustomSelect"
import { InputField } from "../../components/InputFields/InputFields"
import PopupScreen from "../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../components/TableWrapper"
import DataTable, { type Column } from "../../components/DataTable/DataTable"

const PostalDispatch = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "complaint_by", title: "Complaint By" },
        { key: "complaint_type", title: "Complaint Type" },
        { key: "source", title: "Source" },
        { key: "phone", title: "Phone" },
        { key: "date", title: "Date" },
        { key: "progress", title: "Progress" },
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
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="postal_dispatch">
                {isAddAdmissionQuery && <PopupScreen onClick={handleAddAdmissionQuery} >
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
                </PopupScreen>}
                <TableWrapper onClick={handleAddAdmissionQuery} >
                    <div className="search_screen">
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
                </TableWrapper>
                <TableWrapper>
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        actions={() => (
                            // actions={(row) => (
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

export default PostalDispatch;
