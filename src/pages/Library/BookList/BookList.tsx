import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { PrimaryButton } from "../../../components/Buttons/Buttons";
import "./BookList.scss";

const BookList = () => {
    const [page, setPage] = useState(1);
    const [isViewBook, setIsViewBook] = useState(false);

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

    const sampleData = [
        {
            sl: 1,
            book_title: "Ikigai",
            book_no: "3232323",
            isbn_no: "3232",
            category: "Health",
            editor_name: "Mathew",
            author_name: "Thomas",
            amount: "320",
        },
        {
            sl: 1,
            book_title: "Ikigai",
            book_no: "3232323",
            isbn_no: "3232",
            category: "Health",
            editor_name: "Mathew",
            author_name: "Thomas",
            amount: "320",
        },
        {
            sl: 1,
            book_title: "Ikigai",
            book_no: "3232323",
            isbn_no: "3232",
            category: "Health",
            editor_name: "Mathew",
            author_name: "Thomas",
            amount: "320",
        },
        {
            sl: 1,
            book_title: "Ikigai",
            book_no: "3232323",
            isbn_no: "3232",
            category: "Health",
            editor_name: "Mathew",
            author_name: "Thomas",
            amount: "320",
        },
        {
            sl: 1,
            book_title: "Ikigai",
            book_no: "3232323",
            isbn_no: "3232",
            category: "Health",
            editor_name: "Mathew",
            author_name: "Thomas",
            amount: "320",
        },
        {
            sl: 1,
            book_title: "Ikigai",
            book_no: "3232323",
            isbn_no: "3232",
            category: "Health",
            editor_name: "Mathew",
            author_name: "Thomas",
            amount: "320",
        },
        {
            sl: 1,
            book_title: "Ikigai",
            book_no: "3232323",
            isbn_no: "3232",
            category: "Health",
            editor_name: "Mathew",
            author_name: "Thomas",
            amount: "320",
        },
        {
            sl: 1,
            book_title: "Ikigai",
            book_no: "3232323",
            isbn_no: "3232",
            category: "Health",
            editor_name: "Mathew",
            author_name: "Thomas",
            amount: "320",
        },
    ];

    return (
        <div className="page_wrapper">
            <div className="book_list_page">
                {/* Detailed View Modal (Eye Icon) */}
                {isViewBook && (
                    <PopupScreen title="Book Preview" onClick={() => setIsViewBook(false)}>
                        <div className="popup_body book_preview_popup_body">
                            <div className="book_preview_layout">
                                <div className="preview_cover_col">
                                    <img
                                        src="/sample/book_preview_sample.jpg"
                                        alt="Book Cover"
                                        className="preview_cover_image"
                                    />
                                </div>

                                <div className="preview_info_col">
                                    <div className="preview_top_header">
                                        <p className="preview_title">Ikigai: The Japanese Secret to a Long and Happy Life</p>
                                        <button className="preview_edit_btn" type="button">
                                            <span>Edit</span>
                                            <img src="/svgs/edit.svg" alt="" />
                                        </button>
                                    </div>

                                    <span className="preview_category_badge">Health</span>

                                    <div className="preview_divider" />

                                    <div className="preview_section">
                                        <p className="section_title">Book Details</p>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Subject</span>
                                                <span className="val">Social Science</span>
                                            </div>
                                            <div>
                                                <span className="label">Book No</span>
                                                <span className="val">5</span>
                                            </div>
                                            <div>
                                                <span className="label">ISBN No</span>
                                                <span className="val">22</span>
                                            </div>
                                        </div>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Publisher name</span>
                                                <span className="val">Admin</span>
                                            </div>
                                            <div>
                                                <span className="label">Author Name</span>
                                                <span className="val">Francis</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="preview_section">
                                        <p className="section_title">Library Info</p>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Rack Number</span>
                                                <span className="val">32</span>
                                            </div>
                                            <div>
                                                <span className="label">Quantity</span>
                                                <span className="val">5</span>
                                            </div>
                                            <div>
                                                <span className="label">Book Price</span>
                                                <span className="val">&#8377; 300</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="preview_section">
                                        <p className="section_title">Description</p>
                                        <p className="description_text">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="buttons">
                                <PrimaryButton title="Save Book" />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isSearchBar
                    title="Book List"
                >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        actions={() => (
                            <div className="actions">
                                <button onClick={() => setIsViewBook(true)}>
                                    <img src="/svgs/eye_open.svg" alt="View" />
                                </button>
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

export default BookList;
