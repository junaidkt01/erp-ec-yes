import { useState } from "react";
import type { Column } from "../../components/DataTable/DataTable";
import TableWrapper from "../../components/TableWrapper"
import "./Complaint.scss"
import DataTable from "../../components/DataTable/DataTable";

const Complaint = () => {
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

    const [page, setPage] = useState(1);
    return (
        <div className="complaint_page" >
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
    )
}

export default Complaint
