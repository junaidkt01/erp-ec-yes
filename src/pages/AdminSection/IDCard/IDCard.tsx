import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";

const IDCard = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "title", title: "Title" },
        { key: "role", title: "Role" },
    ];

    const sampleData = [
        {
            sl: 1,
            title: "Employee ID – John Doe",
            role: "HR Manager",
        },
        {
            sl: 2,
            title: "Employee ID – John Doe",
            role: "HR Manager",
        },
    ];

    const [isAddComplaint, setIsAddComplaint] = useState(false)
    const handleAddComplaint = () => {
        setIsAddComplaint(!isAddComplaint)
    }
    return (
        <div className="page_wrapper">
            <div className="id_card_page" >
                <TableWrapper isAddButton isSearchBar title="ID Card" onClick={handleAddComplaint} >
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

export default IDCard
