import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
    useFetchAllBooks,
    useDeleteBook,
    type BookItem,
} from "../../../hooks/useBooks";
import { toast } from "sonner";
import "./BookList.scss";

const BookList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<BookItem | null>(null);

    const { data: booksData, isLoading } = useFetchAllBooks({
        page,
        per_page: 8,
        search,
    });

    const deleteBookMutation = useDeleteBook();

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "book_title", title: "Book Title" },
        { key: "book_no", title: "Book No." },
        { key: "isbn_no", title: "ISBN No." },
        { key: "category", title: "Category" },
        { key: "editor_name", title: "Editor's Name" },
        { key: "author_name", title: "Authors Name" },
        { key: "amount", title: "Amount" },
    ];

    const rawList: BookItem[] = booksData?.data || [];
    const totalPages: number = booksData?.meta?.last_page || 1;

    const tableData = rawList.map((item: any, index: number) => {
        const categoryName =
            typeof item.category === "object" && item.category !== null
                ? item.category.name || item.category.title || ""
                : item.category || item.category_name || "Health";

        const editorName =
            typeof item.editor === "object" && item.editor !== null
                ? item.editor.name || ""
                : item.editor_name || item.publisher_name || "Admin";

        const authorName =
            typeof item.author === "object" && item.author !== null
                ? item.author.name || ""
                : item.author_name || item.author || "--";

        const bookTitle =
            typeof item.title === "object" && item.title !== null
                ? item.title.name || item.title.title || ""
                : item.title || "";

        return {
            sl: (page - 1) * 8 + index + 1,
            book_title: bookTitle,
            book_no: item.book_no || "--",
            isbn_no: item.isbn_no || "--",
            category: categoryName,
            editor_name: editorName,
            author_name: authorName,
            amount: String(item.book_price || item.price || 0),
            raw: item,
        };
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteBookMutation.mutateAsync(deleteTarget.id);
            toast.success("Book deleted successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to delete book");
        }
    };

    return (
        <div className="page_wrapper">
            <div className="book_list_page">
                {/* Detailed View Modal (Eye Icon) */}
                {selectedBook && (
                    <PopupScreen title="Book Preview" onClick={() => setSelectedBook(null)}>
                        <div className="popup_body book_preview_popup_body">
                            <div className="book_preview_layout">
                                <div className="preview_cover_col">
                                    <img
                                        src={selectedBook.cover_photo || "/sample/book_preview_sample.jpg"}
                                        alt={selectedBook.title}
                                        className="preview_cover_image"
                                    />
                                </div>

                                <div className="preview_info_col">
                                    <div className="preview_top_header">
                                        <p className="preview_title">{selectedBook.title}</p>
                                        <button
                                            className="preview_edit_btn"
                                            type="button"
                                            onClick={() => navigate(`/library/add-book/${selectedBook.id}`)}
                                        >
                                            <span>Edit</span>
                                            <img src="/svgs/edit.svg" alt="" />
                                        </button>
                                    </div>

                                    <span className="preview_category_badge">
                                        {typeof (selectedBook.category as any) === "object" && selectedBook.category !== null
                                            ? (selectedBook.category as any)?.name || (selectedBook.category as any)?.title || "Health"
                                            : String(selectedBook.category || "Health")}
                                    </span>

                                    <div className="preview_divider" />

                                    <div className="preview_section">
                                        <p className="section_title">Book Details</p>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Book No</span>
                                                <span className="val">{selectedBook.book_no || "5"}</span>
                                            </div>
                                            <div>
                                                <span className="label">ISBN No</span>
                                                <span className="val">{selectedBook.isbn_no || "22"}</span>
                                            </div>
                                        </div>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Publisher name</span>
                                                <span className="val">{selectedBook.publisher_name || "Admin"}</span>
                                            </div>
                                            <div>
                                                <span className="label">Author Name</span>
                                                <span className="val">{selectedBook.author_name || "Thomas"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="preview_section">
                                        <p className="section_title">Library Info</p>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Rack Number</span>
                                                <span className="val">{selectedBook.rack_number || "32"}</span>
                                            </div>
                                            <div>
                                                <span className="label">Quantity</span>
                                                <span className="val">{selectedBook.quantity || "5"}</span>
                                            </div>
                                            <div>
                                                <span className="label">Book Price</span>
                                                <span className="val">
                                                    &#8377; {selectedBook.book_price || selectedBook.price || "320"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="preview_section">
                                        <p className="section_title">Description</p>
                                        <p className="description_text">
                                            {selectedBook.description ||
                                                "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="preview_popup_actions">
                                <PrimaryButton title="Close" onClick={() => setSelectedBook(null)} />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <PopupScreen title="Delete Book" onClick={() => setDeleteTarget(null)}>
                        <div className="popup_body">
                            <p style={{ margin: "16px 0", fontSize: "15px", color: "#374151" }}>
                                Are you sure you want to delete book <strong>{deleteTarget.title}</strong>?
                            </p>
                            <div className="buttons">
                                <SecondaryButton title="Cancel" onClick={() => setDeleteTarget(null)} />
                                <PrimaryButton
                                    title={deleteBookMutation.isPending ? "Deleting..." : "Delete"}
                                    disabled={deleteBookMutation.isPending}
                                    isLoading={deleteBookMutation.isPending}
                                    onClick={handleDelete}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isSearchBar
                    title="Book List"
                    searchValue={search}
                    searchOnchange={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                >
                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                        emptyMessage={isLoading ? "Loading books..." : "No books found."}
                        actions={(row: any) => (
                            <div className="actions">
                                <button
                                    type="button"
                                    title="View Book Details"
                                    onClick={() => setSelectedBook(row.raw)}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#6b7280"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    title="Edit Book"
                                    onClick={() => navigate(`/library/add-book/${row.raw.id}`)}
                                >
                                    <img src="/svgs/edit.svg" alt="Edit" />
                                </button>
                                <button
                                    type="button"
                                    title="Delete Book"
                                    onClick={() => setDeleteTarget(row.raw)}
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

export default BookList;
