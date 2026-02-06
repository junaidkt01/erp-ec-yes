import { useState } from "react"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const SharedContentList = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "title", title: "Title" },
        { key: "send_to", title: "Send To" },
        { key: "share_date", title: "Share Date" },
        { key: "valid_upto", title: "Valid Upto" },
        { key: "shared_by", title: "Shared By" },
        { key: "discription", title: "Description" },
    ];

    const sampleData = [
        {
            sl: "1",
            name: "Service Delay Notice",
            send_to: "Email",
            share_date: "01-04-2025",
            valid_upto: "01-04-2025",
            shared_by: "John Smith",
            discription: "Delay in delivery",
        },
    ];
  
    return (
        <div className="page_wrapper">
            <div className="shared_content_list">
                <TableWrapper isSearchBar title="Shared Content List" >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        actions={() => (
                            <div className="actions">
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

export default SharedContentList;
