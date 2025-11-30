import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";

const Certificate = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "name", title: "Name" },
        { key: "background_image", title: "Background Image" },
        { key: "default_for", title: "Default For" },
    ];

    const sampleData = [
        {
            sl: 1,
            name: "Transfer Certificate",
            background_image: "transfer_bg.jpg",
            default_for: "Students",
        }
    ];

    const [isAddComplaint, setIsAddComplaint] = useState(false)
    const handleAddComplaint = () => {
        setIsAddComplaint(!isAddComplaint)
    }
    return (
        <div className="page_wrapper">
            <div className="certificate_page" >
                <TableWrapper isAddButton isSearchBar title="Certificate" onClick={handleAddComplaint} >
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
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default Certificate
