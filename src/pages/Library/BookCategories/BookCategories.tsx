import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";

const BookCategories = () => {
    const [page, setPage] = useState(1);
    const [isAddCategory, setIsAddCategory] = useState(false);

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "category_title", title: "Category Title" },
    ];

    const sampleData = [
        { sl: 1, category_title: "Health" },
        { sl: 1, category_title: "Health" },
        { sl: 1, category_title: "Health" },
        { sl: 1, category_title: "Health" },
        { sl: 1, category_title: "Health" },
        { sl: 1, category_title: "Health" },
    ];

    return (
        <div className="page_wrapper">
            <div className="book_categories_page">
                {isAddCategory && (
                    <PopupScreen title="Add Book Category" onClick={() => setIsAddCategory(false)}>
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <InputField type="text" label="Category Name" placeHolder="Enter category name" />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Save Category" />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isAddButton
                    isSearchBar
                    title="Book Categories"
                    addButtonTitle="Add Book Category"
                    onClick={() => setIsAddCategory(true)}
                >
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
    );
};

export default BookCategories;
