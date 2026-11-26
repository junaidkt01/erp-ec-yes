import { useState } from "react";
import TableWrapper from "../../../components/TableWrapper";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import InputFiles from "../../../components/InputFields/InputFiles";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import "./AddBook.scss";

const AddBook = () => {
    const [isPreview, setIsPreview] = useState(false);

    return (
        <div className="page_wrapper">
            <div className="add_book_page">
                {!isPreview ? (
                    /* Step 1: Add Book Form */
                    <TableWrapper title="Add Book">
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <InputField type="text" label="Book Title" placeHolder="Enter book title" />
                                    <CustomSelect
                                        label="Book Categories"
                                        placeholder="Select book categories"
                                        options={[
                                            { label: "Health", value: "Health" },
                                            { label: "Science", value: "Science" },
                                            { label: "Literature", value: "Literature" },
                                        ]}
                                        onChange={() => {}}
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

                                <div className="body_section">
                                    <InputField type="text" label="Book No" placeHolder="Enter book no" />
                                    <InputField type="text" label="ISBN No" placeHolder="Enter ISBN no" />
                                    <InputField type="text" label="Publisher Name" placeHolder="Enter publisher name" />
                                </div>

                                <div className="body_section">
                                    <InputField type="text" label="Author Name" placeHolder="Enter author name" />
                                    <InputField type="text" label="Rack Number" placeHolder="Enter rack number" />
                                </div>

                                <div className="body_section">
                                    <InputField type="text" label="Quantity" placeHolder="Enter quantity" />
                                    <InputField type="text" label="Book Price" placeHolder="&#8377; Enter price" />
                                </div>

                                <div className="body_section">
                                    <InputField type="text" label="Description" placeHolder="Enter description" />
                                </div>

                                <div className="body_section">
                                    <InputFiles title="Book Cover Photo" accept=".jpg,.jpeg,.png" />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Continue" onClick={() => setIsPreview(true)} />
                            </div>
                        </div>
                    </TableWrapper>
                ) : (
                    /* Step 2: Book Preview */
                    <TableWrapper title="Book Preview">
                        <div className="popup_body book_preview_card_body">
                            <div className="preview_top_bar">
                                <button className="edit_btn_link" type="button" onClick={() => setIsPreview(false)}>
                                    <span>Edit</span>
                                    <img src="/svgs/edit.svg" alt="" />
                                </button>
                            </div>

                            <div className="book_preview_layout">
                                <div className="preview_cover_col">
                                    <img
                                        src="/sample/book_preview_sample.jpg"
                                        alt="Book Cover"
                                        className="preview_cover_image"
                                    />
                                </div>

                                <div className="preview_info_col">
                                    <p className="preview_title">Ikigai: The Japanese Secret to a Long and Happy Life</p>
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
                    </TableWrapper>
                )}
            </div>
        </div>
    );
};

export default AddBook;
