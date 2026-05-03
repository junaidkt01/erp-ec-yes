import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { CustomSelect, StatusBar } from "../../../components/InputFields/CustomSelect"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const OptionalSubject = () => {
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
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="optional_subject_page">
                <TableWrapper title={"Optional Subject"} onClick={handleAddAdmissionQuery} >
                    <div className="search_screen">
                        <p className="search_screen_title" >Select Criteria</p>
                        <div className="popup_body" >
                            <div className="body_section" >
                                <CustomSelect label="Class" placeholder="Select class" onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Section" placeholder="Select section" onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Subject" placeholder="Select subject" onChange={(val) => console.log("Selected:", val)} />
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Search" />
                            </div>
                        </div>
                    </div>
                </TableWrapper>
                <TableWrapper isAddButton isSearchBar title="Subject" >
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

export default OptionalSubject;
