import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
    useFetchAllLibraryIssues,
    useReturnBook,
    useFetchBookCategories,
    type LibraryIssueItem,
} from "../../../hooks/useBooks";
import { toast } from "sonner";
import "./AllIssuedBook.scss";

const AllIssuedBook = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [returnTarget, setReturnTarget] = useState<LibraryIssueItem | null>(null);

    // Search filter inputs
    const [filterBookTitle, setFilterBookTitle] = useState("");
    const [filterBookId, setFilterBookId] = useState("");

    // Applied search filters
    const [appliedFilters, setAppliedFilters] = useState<{
        book_title?: string;
        book_id?: string;
    }>({});

    const { data: issuesData, isLoading } = useFetchAllLibraryIssues({
        page,
        per_page: 7,
        search,
        book_title: appliedFilters.book_title,
        book_id: appliedFilters.book_id,
    });

    const returnBookMutation = useReturnBook();
    const { data: categoryOptions = [] } = useFetchBookCategories();

    const columns: Column[] = [
        { key: "book_title", title: "Book Title" },
        { key: "book_no", title: "Book No" },
        { key: "isbn_no", title: "ISBN No" },
        { key: "member_name", title: "Member Name" },
        { key: "author", title: "Author" },
        { key: "issue_date", title: "Issue Date" },
        { key: "return_date", title: "Return Date" },
    ];

    const rawList: LibraryIssueItem[] = issuesData?.data || [];
    const totalPages: number = issuesData?.meta?.last_page || 1;

    const tableData = rawList.map((item: any) => ({
        book_title:
            typeof item.book === "object" && item.book !== null
                ? item.book.title || item.book.name || "--"
                : item.book_title || item.title || "--",
        book_no:
            typeof item.book === "object" && item.book !== null
                ? item.book.book_no || item.book_no || "--"
                : item.book_no || "--",
        isbn_no:
            typeof item.book === "object" && item.book !== null
                ? item.book.isbn_no || item.isbn_no || "--"
                : item.isbn_no || "--",
        member_name:
            typeof item.member === "object" && item.member !== null
                ? item.member.name || item.member.full_name || "--"
                : item.member_name || "--",
        author:
            typeof item.book === "object" && item.book !== null
                ? item.book.author_name || item.author || "--"
                : item.author || "--",
        issue_date: item.issue_date || "--",
        return_date: item.return_date || item.due_date || "--",
        raw: item,
    }));

    const handleApplySearch = () => {
        setAppliedFilters({
            book_title: filterBookTitle || undefined,
            book_id: filterBookId || undefined,
        });
        setPage(1);
        setIsSearchOpen(false);
    };

    const handleResetFilters = () => {
        setFilterBookTitle("");
        setFilterBookId("");
        setAppliedFilters({});
        setPage(1);
    };

    const handleConfirmReturn = async () => {
        if (!returnTarget) return;
        try {
            await returnBookMutation.mutateAsync(returnTarget.id);
            toast.success("Book returned successfully");
            setReturnTarget(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to return book");
        }
    };

    return (
        <div className="page_wrapper">
            <div className="all_issued_book_page">
                {/* Search / Filter Modal */}
                {isSearchOpen && (
                    <PopupScreen title="Search" onClick={() => setIsSearchOpen(false)}>
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        label="Book"
                                        placeholder="Select book name"
                                        value={filterBookTitle}
                                        options={[
                                            { label: "Ikigai", value: "Ikigai" },
                                            ...categoryOptions.map((c) => ({
                                                label: c.label,
                                                value: c.label,
                                            })),
                                        ]}
                                        onChange={(val: any) => setFilterBookTitle(val)}
                                    />
                                    <InputField
                                        type="text"
                                        label="Book ID"
                                        placeHolder="Enter book ID"
                                        value={filterBookId}
                                        onChange={(e: any) => setFilterBookId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleResetFilters} />
                                <PrimaryButton title="Search" onClick={handleApplySearch} />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Return Book Confirmation Modal */}
                {returnTarget && (
                    <PopupScreen title="Return Book" onClick={() => setReturnTarget(null)}>
                        <div className="popup_body">
                            <p style={{ margin: "16px 0", fontSize: "15px", color: "#374151" }}>
                                Are you sure you want to mark the book <strong>{returnTarget.book_title}</strong> issued to <strong>{returnTarget.member_name}</strong> as returned?
                            </p>
                            <div className="buttons">
                                <SecondaryButton title="Cancel" onClick={() => setReturnTarget(null)} />
                                <PrimaryButton
                                    title={returnBookMutation.isPending ? "Returning..." : "Confirm Return"}
                                    disabled={returnBookMutation.isPending}
                                    isLoading={returnBookMutation.isPending}
                                    onClick={handleConfirmReturn}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isSearchBar
                    title="All Issued Book"
                    searchValue={search}
                    searchOnchange={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                        <button
                            type="button"
                            className="button secondary_button"
                            style={{ height: "36px", padding: "0 14px", fontSize: "13px" }}
                            onClick={() => setIsSearchOpen(true)}
                        >
                            Filter Search
                        </button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                        emptyMessage={isLoading ? "Loading issued books..." : "No issued books found."}
                        actions={(row: any) => (
                            <div className="actions">
                                <button
                                    type="button"
                                    title="Return Book"
                                    onClick={() => setReturnTarget(row.raw)}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="9 14 4 9 9 4" />
                                        <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    title="Delete Record"
                                    onClick={() => setReturnTarget(row.raw)}
                                >
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

export default AllIssuedBook;
