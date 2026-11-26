import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import "./IssueReturnBook.scss";

const IssueReturnBook = () => {
    const [page, setPage] = useState(1);

    const columns: Column[] = [
        { key: "member_id", title: "Member ID" },
        { key: "full_name", title: "Full Name" },
        { key: "member_type", title: "Member Type" },
        { key: "phone", title: "Phone" },
        { key: "email", title: "Email" },
    ];

    const sampleData = [
        {
            member_id: "3243432",
            full_name: "Jhon Martin",
            member_type: "Admin",
            phone: "87878383838",
            email: "jhon@gmail.com",
        },
        {
            member_id: "3243432",
            full_name: "Jhon Martin",
            member_type: "Admin",
            phone: "87878383838",
            email: "jhon@gmail.com",
        },
        {
            member_id: "3243432",
            full_name: "Jhon Martin",
            member_type: "Admin",
            phone: "87878383838",
            email: "jhon@gmail.com",
        },
        {
            member_id: "3243432",
            full_name: "Jhon Martin",
            member_type: "Admin",
            phone: "87878383838",
            email: "jhon@gmail.com",
        },
        {
            member_id: "3243432",
            full_name: "Jhon Martin",
            member_type: "Admin",
            phone: "87878383838",
            email: "jhon@gmail.com",
        },
        {
            member_id: "3243432",
            full_name: "Jhon Martin",
            member_type: "Admin",
            phone: "87878383838",
            email: "jhon@gmail.com",
        },
        {
            member_id: "3243432",
            full_name: "Jhon Martin",
            member_type: "Admin",
            phone: "87878383838",
            email: "jhon@gmail.com",
        },
    ];

    return (
        <div className="page_wrapper">
            <div className="issue_return_book_page">
                <TableWrapper isSearchBar title="Issue Books">
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        actions={() => (
                            <div className="actions">
                                <button>
                                    <img src="/svgs/edit.svg" alt="Edit" />
                                </button>
                                <button>
                                    <img src="/svgs/delete.svg" alt="Delete" />
                                </button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    );
};

export default IssueReturnBook;
