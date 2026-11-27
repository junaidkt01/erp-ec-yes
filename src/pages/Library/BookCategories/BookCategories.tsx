import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
    useFetchAllBookCategories,
    useAddBookCategory,
    useUpdateBookCategory,
    useDeleteBookCategory,
    type BookCategoryItem,
} from "../../../hooks/useBooks";
import { toast } from "sonner";

const BookCategories = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isAddCategory, setIsAddCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BookCategoryItem | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDesc, setCategoryDesc] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<BookCategoryItem | null>(null);

    const { data: categoriesData, isLoading } = useFetchAllBookCategories({
        page,
        per_page: 6,
        search,
    });

    const addCategoryMutation = useAddBookCategory();
    const updateCategoryMutation = useUpdateBookCategory();
    const deleteCategoryMutation = useDeleteBookCategory();

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "category_title", title: "Category Title" },
    ];

    const rawList: BookCategoryItem[] = categoriesData?.data || [];
    const totalPages: number = categoriesData?.meta?.last_page || 1;

    const tableData = rawList.map((item: any, index: number) => ({
        sl: (page - 1) * 6 + index + 1,
        category_title:
            typeof item.name === "object" && item.name !== null
                ? item.name.name || item.name.title || "Category"
                : item.name || item.category_title || item.title || "Category",
        raw: item,
    }));

    const handleOpenAdd = () => {
        setEditingCategory(null);
        setCategoryName("");
        setCategoryDesc("");
        setIsAddCategory(true);
    };

    const handleOpenEdit = (item: BookCategoryItem) => {
        setEditingCategory(item);
        setCategoryName(item.name || "");
        setCategoryDesc(item.description || "");
        setIsAddCategory(true);
    };

    const handleCloseModal = () => {
        setIsAddCategory(false);
        setEditingCategory(null);
        setCategoryName("");
        setCategoryDesc("");
    };

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            toast.error("Please enter a category name");
            return;
        }

        try {
            if (editingCategory) {
                await updateCategoryMutation.mutateAsync({
                    id: editingCategory.id,
                    name: categoryName.trim(),
                    description: categoryDesc.trim(),
                });
                toast.success("Category updated successfully");
            } else {
                await addCategoryMutation.mutateAsync({
                    name: categoryName.trim(),
                    description: categoryDesc.trim() || undefined,
                });
                toast.success("Category created successfully");
            }
            handleCloseModal();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to save category");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteCategoryMutation.mutateAsync(deleteTarget.id);
            toast.success("Category deleted successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to delete category");
        }
    };

    return (
        <div className="page_wrapper">
            <div className="book_categories_page">
                {/* Add / Edit Popup */}
                {isAddCategory && (
                    <PopupScreen
                        title={editingCategory ? "Edit Book Category" : "Add Book Category"}
                        onClick={handleCloseModal}
                    >
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Category Name"
                                        placeHolder="Enter category name"
                                        value={categoryName}
                                        onChange={(e: any) => setCategoryName(e.target.value)}
                                    />
                                    <InputField
                                        type="text"
                                        label="Description"
                                        placeHolder="Enter description (optional)"
                                        value={categoryDesc}
                                        onChange={(e: any) => setCategoryDesc(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton
                                    title="Reset"
                                    onClick={() => {
                                        setCategoryName("");
                                        setCategoryDesc("");
                                    }}
                                />
                                <PrimaryButton
                                    title={
                                        addCategoryMutation.isPending || updateCategoryMutation.isPending
                                            ? "Saving..."
                                            : editingCategory
                                            ? "Update Category"
                                            : "Save Category"
                                    }
                                    disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
                                    isLoading={addCategoryMutation.isPending || updateCategoryMutation.isPending}
                                    onClick={handleSaveCategory}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <PopupScreen title="Delete Book Category" onClick={() => setDeleteTarget(null)}>
                        <div className="popup_body">
                            <p style={{ margin: "16px 0", fontSize: "15px", color: "#374151" }}>
                                Are you sure you want to delete category <strong>{deleteTarget.name}</strong>?
                            </p>
                            <div className="buttons">
                                <SecondaryButton title="Cancel" onClick={() => setDeleteTarget(null)} />
                                <PrimaryButton
                                    title={deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
                                    disabled={deleteCategoryMutation.isPending}
                                    isLoading={deleteCategoryMutation.isPending}
                                    onClick={handleDelete}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isAddButton
                    isSearchBar
                    title="Book Categories"
                    addButtonTitle="Add Book Category"
                    searchValue={search}
                    searchOnchange={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                    onClick={handleOpenAdd}
                >
                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                        emptyMessage={isLoading ? "Loading categories..." : "No book categories found."}
                        actions={(row: any) => (
                            <div className="actions">
                                <button
                                    type="button"
                                    title="Edit Category"
                                    onClick={() => handleOpenEdit(row.raw)}
                                >
                                    <img src="/svgs/edit.svg" alt="Edit" />
                                </button>
                                <button
                                    type="button"
                                    title="Delete Category"
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

export default BookCategories;
