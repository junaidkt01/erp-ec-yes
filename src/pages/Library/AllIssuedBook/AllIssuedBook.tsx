import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import "./AllIssuedBook.scss";

const AllIssuedBook = () => {
    const [page, setPage] = useState(1);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const columns: Column[] = [
        { key: "book_title", title: "Book Title" },
        { key: "book_no", title: "Book No" },
        { key: "isbn_no", title: "ISBN No" },
        { key: "member_name", title: "Member Name" },
        { key: "author", title: "Author" },
        { key: "subject", title: "Subject" },
        { key: "issue_date", title: "Issue Date" },
        { key: "return_date", title: "Return Date" },
    ];

    const sampleData = [
        {
            book_title: "Ikigai",
            book_no: "3232",
            isbn_no: "5434",
            member_name: "Jhon Martin",
            author: "Jhon",
            subject: "Social Science",
            issue_date: "03/11/2025",
            return_date: "15/11/2025",
        },
        {
            book_title: "Ikigai",
            book_no: "3232",
            isbn_no: "5434",
            member_name: "Jhon Martin",
            author: "Jhon",
            subject: "Social Science",
            issue_date: "03/11/2025",
            return_date: "15/11/2025",
        },
        {
            book_title: "Ikigai",
            book_no: "3232",
            isbn_no: "5434",
            member_name: "Jhon Martin",
            author: "Jhon",
            subject: "Social Science",
            issue_date: "03/11/2025",
            return_date: "15/11/2025",
        },
        {
            book_title: "Ikigai",
            book_no: "3232",
            isbn_no: "5434",
            member_name: "Jhon Martin",
            author: "Jhon",
            subject: "Social Science",
            issue_date: "03/11/2025",
            return_date: "15/11/2025",
        },
        {
            book_title: "Ikigai",
            book_no: "3232",
            isbn_no: "5434",
            member_name: "Jhon Martin",
            author: "Jhon",
            subject: "Social Science",
            issue_date: "03/11/2025",
            return_date: "15/11/2025",
        },
        {
            book_title: "Ikigai",
            book_no: "3232",
            isbn_no: "5434",
            member_name: "Jhon Martin",
            author: "Jhon",
            subject: "Social Science",
            issue_date: "03/11/2025",
            return_date: "15/11/2025",
        },
        {
            book_title: "Ikigai",
            book_no: "3232",
            isbn_no: "5434",
            member_name: "Jhon Martin",
            author: "Jhon",
            subject: "Social Science",
            issue_date: "03/11/2025",
            return_date: "15/11/2025",
        },
    ];

    return (
        <div className="page_wrapper">
            <div className="all_issued_book_page">
                {/* Search Popup Modal matching Image 2 */}
                {isSearchOpen && (
                    <PopupScreen title="Search" onClick={() => setIsSearchOpen(false)}>
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        label="Book"
                                        placeholder="Select book name"
                                        options={[
                                            { label: "Ikigai", value: "Ikigai" },
                                            { label: "Atomic Habits", value: "Atomic Habits" },
                                            { label: "The Alchemist", value: "The Alchemist" },
                                        ]}
                                        onChange={() => {}}
                                    />
                                    <InputField
                                        type="text"
                                        label="Book ID"
                                        placeHolder="Enter book ID"
                                    />
                                    <CustomSelect
                                        label="Subject"
                                        placeholder="Select subject"
                                        options={[
                                            { label: "Social Science", value: "Social Science" },
                                            { label: "Mathematics", value: "Mathematics" },
                                            { label: "Science", value: "Science" },
                                        ]}
                                        onChange={() => {}}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Search" />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Table listing matching Image 2 */}
                <TableWrapper
                    isAddButton
                    isSearchBar
                    title="All Issued Book"
                    addButtonTitle="Search"
                    onClick={() => setIsSearchOpen(true)}
                >
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
    );
};

export default AllIssuedBook;
