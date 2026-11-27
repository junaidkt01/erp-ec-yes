import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TableWrapper from "../../../components/TableWrapper";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import InputFiles from "../../../components/InputFields/InputFiles";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
    useAddBook,
    useUpdateBook,
    useFetchBookById,
    useFetchBookCategories,
} from "../../../hooks/useBooks";
import { toast } from "sonner";
import "./AddBook.scss";

const AddBook = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditing = Boolean(id);

    const [isPreview, setIsPreview] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState<string | number>("");
    const [categoryName, setCategoryName] = useState("");
    const [bookNo, setBookNo] = useState("");
    const [isbnNo, setIsbnNo] = useState("");
    const [publisherName, setPublisherName] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [rackNumber, setRackNumber] = useState("");
    const [quantity, setQuantity] = useState("");
    const [bookPrice, setBookPrice] = useState("");
    const [description, setDescription] = useState("");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewCoverUrl, setPreviewCoverUrl] = useState("/sample/book_preview_sample.jpg");

    // Existing book data if editing
    const { data: existingBook } = useFetchBookById(id);

    // Categories for dropdowns
    const { data: categoryOptions = [] } = useFetchBookCategories();

    useEffect(() => {
        if (existingBook) {
            setTitle(existingBook.title || "");
            setCategoryId(existingBook.category_id || existingBook.category || "");
            setCategoryName(existingBook.category || "");
            setBookNo(existingBook.book_no || "");
            setIsbnNo(existingBook.isbn_no || "");
            setPublisherName(existingBook.publisher_name || existingBook.editor_name || "");
            setAuthorName(existingBook.author_name || "");
            setRackNumber(existingBook.rack_number || "");
            setQuantity(String(existingBook.quantity || ""));
            setBookPrice(String(existingBook.book_price || existingBook.price || ""));
            setDescription(existingBook.description || "");
            if (existingBook.cover_photo) {
                setPreviewCoverUrl(existingBook.cover_photo);
            }
        }
    }, [existingBook]);

    const addBookMutation = useAddBook();
    const updateBookMutation = useUpdateBook();

    const handleContinueToPreview = () => {
        if (!title.trim()) {
            toast.error("Please enter a book title");
            return;
        }
        setIsPreview(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setPreviewCoverUrl(URL.createObjectURL(file));
        }
    };

    const handleResetForm = () => {
        setTitle("");
        setCategoryId("");
        setCategoryName("");
        setBookNo("");
        setIsbnNo("");
        setPublisherName("");
        setAuthorName("");
        setRackNumber("");
        setQuantity("");
        setBookPrice("");
        setDescription("");
        setCoverFile(null);
        setPreviewCoverUrl("/sample/book_preview_sample.jpg");
    };

    const handleFinalSubmit = async () => {
        try {
            const payload = {
                title: title.trim(),
                category_id: categoryId || undefined,
                category: categoryName || undefined,
                book_no: bookNo.trim(),
                isbn_no: isbnNo.trim(),
                publisher_name: publisherName.trim(),
                author_name: authorName.trim(),
                rack_number: rackNumber.trim(),
                quantity: quantity ? Number(quantity) : 0,
                book_price: bookPrice ? Number(bookPrice) : 0,
                price: bookPrice ? Number(bookPrice) : 0,
                description: description.trim(),
                cover_photo: coverFile || previewCoverUrl,
            };

            if (isEditing && id) {
                await updateBookMutation.mutateAsync({
                    id,
                    ...payload,
                });
                toast.success("Book updated successfully");
            } else {
                await addBookMutation.mutateAsync(payload);
                toast.success("Book added successfully");
            }

            navigate("/library/book-list");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to save book");
        }
    };

    const isPending = addBookMutation.isPending || updateBookMutation.isPending;

    return (
        <div className="page_wrapper">
            <div className="add_book_page">
                {!isPreview ? (
                    /* Step 1: Add Book Form */
                    <TableWrapper title={isEditing ? "Edit Book" : "Add Book"}>
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Book Title"
                                        placeHolder="Enter book title"
                                        value={title}
                                        onChange={(e: any) => setTitle(e.target.value)}
                                    />
                                    <CustomSelect
                                        label="Book Categories"
                                        placeholder="Select book categories"
                                        value={categoryId}
                                        options={
                                            categoryOptions.length > 0
                                                ? categoryOptions
                                                : [
                                                      { label: "Health", value: "Health" },
                                                      { label: "Science", value: "Science" },
                                                      { label: "Literature", value: "Literature" },
                                                  ]
                                        }
                                        onChange={(val: any) => {
                                            setCategoryId(val);
                                            const matched = categoryOptions.find(
                                                (c) => String(c.value) === String(val)
                                            );
                                            if (matched) setCategoryName(matched.label);
                                        }}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Book No"
                                        placeHolder="Enter book no"
                                        value={bookNo}
                                        onChange={(e: any) => setBookNo(e.target.value)}
                                    />
                                    <InputField
                                        type="text"
                                        label="ISBN No"
                                        placeHolder="Enter ISBN no"
                                        value={isbnNo}
                                        onChange={(e: any) => setIsbnNo(e.target.value)}
                                    />
                                    <InputField
                                        type="text"
                                        label="Publisher Name"
                                        placeHolder="Enter publisher name"
                                        value={publisherName}
                                        onChange={(e: any) => setPublisherName(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Author Name"
                                        placeHolder="Enter author name"
                                        value={authorName}
                                        onChange={(e: any) => setAuthorName(e.target.value)}
                                    />
                                    <InputField
                                        type="text"
                                        label="Rack Number"
                                        placeHolder="Enter rack number"
                                        value={rackNumber}
                                        onChange={(e: any) => setRackNumber(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="number"
                                        label="Quantity"
                                        placeHolder="Enter quantity"
                                        value={quantity}
                                        onChange={(e: any) => setQuantity(e.target.value)}
                                    />
                                    <InputField
                                        type="number"
                                        label="Book Price"
                                        placeHolder="&#8377; Enter price"
                                        value={bookPrice}
                                        onChange={(e: any) => setBookPrice(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Description"
                                        placeHolder="Enter description"
                                        value={description}
                                        onChange={(e: any) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputFiles
                                        title="Book Cover Photo"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleResetForm} />
                                <PrimaryButton
                                    title="Continue"
                                    onClick={handleContinueToPreview}
                                />
                            </div>
                        </div>
                    </TableWrapper>
                ) : (
                    /* Step 2: Book Preview */
                    <TableWrapper title="Book Preview">
                        <div className="popup_body book_preview_card_body">
                            <div className="preview_top_bar">
                                <button
                                    className="edit_btn_link"
                                    type="button"
                                    onClick={() => setIsPreview(false)}
                                >
                                    <span>Edit</span>
                                    <img src="/svgs/edit.svg" alt="" />
                                </button>
                            </div>

                            <div className="book_preview_layout">
                                <div className="preview_cover_col">
                                    <img
                                        src={previewCoverUrl}
                                        alt={title || "Book Cover"}
                                        className="preview_cover_image"
                                    />
                                </div>

                                <div className="preview_info_col">
                                    <p className="preview_title">
                                        {title || "Ikigai: The Japanese Secret to a Long and Happy Life"}
                                    </p>
                                    <span className="preview_category_badge">
                                        {categoryName || "Health"}
                                    </span>

                                    <div className="preview_divider" />

                                    <div className="preview_section">
                                        <p className="section_title">Book Details</p>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Book No</span>
                                                <span className="val">{bookNo || "5"}</span>
                                            </div>
                                            <div>
                                                <span className="label">ISBN No</span>
                                                <span className="val">{isbnNo || "22"}</span>
                                            </div>
                                        </div>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Publisher name</span>
                                                <span className="val">{publisherName || "Admin"}</span>
                                            </div>
                                            <div>
                                                <span className="label">Author Name</span>
                                                <span className="val">{authorName || "Francis"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="preview_section">
                                        <p className="section_title">Library Info</p>
                                        <div className="details_row">
                                            <div>
                                                <span className="label">Rack Number</span>
                                                <span className="val">{rackNumber || "32"}</span>
                                            </div>
                                            <div>
                                                <span className="label">Quantity</span>
                                                <span className="val">{quantity || "5"}</span>
                                            </div>
                                            <div>
                                                <span className="label">Book Price</span>
                                                <span className="val">&#8377; {bookPrice || "300"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="preview_section">
                                        <p className="section_title">Description</p>
                                        <p className="description_text">
                                            {description ||
                                                "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="buttons" style={{ marginTop: "24px" }}>
                                <SecondaryButton
                                    title="Back"
                                    onClick={() => setIsPreview(false)}
                                    disable={isPending}
                                />
                                <PrimaryButton
                                    title={
                                        isPending
                                            ? "Saving..."
                                            : isEditing
                                            ? "Update Book"
                                            : "Save Book"
                                    }
                                    disabled={isPending}
                                    isLoading={isPending}
                                    onClick={handleFinalSubmit}
                                />
                            </div>
                        </div>
                    </TableWrapper>
                )}
            </div>
        </div>
    );
};

export default AddBook;
