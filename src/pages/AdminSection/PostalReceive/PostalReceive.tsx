
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { InputField } from "../../../components/InputFields/InputFields";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import InputFiles from "../../../components/InputFields/InputFiles";

import {
    useFetchAllPostalReceives,
    useAddPostalReceive,
    useUpdatePostalReceive,
    useRemovePostalReceive,
    type CreatePostalReceivePayload,
    type PostalReceive as PostalReceiveType,
} from "../../../hooks/usePostalReceives";
import LoadingOverlay from "../../../components/Loadingoverlay";

const initialForm: CreatePostalReceivePayload = {
    from_title: "",
    reference_no: "",
    address: "",
    note: "",
    to_title: "",
    date: "",
};

const PostalReceive = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | string | undefined>();
    const [isEdit, setIsEdit] = useState(false);

    const [form, setForm] = useState<CreatePostalReceivePayload>(initialForm);

    // API hooks
    const { data, isLoading, isError } = useFetchAllPostalReceives({
        page,
        per_page: 15,
        search,
    });

    const addPostalReceive = useAddPostalReceive();
    const updatePostalReceive = useUpdatePostalReceive();
    const removePostalReceive = useRemovePostalReceive();

    // Extract API response
    const postalReceives: PostalReceiveType[] =
        data?.data?.data ??
        data?.data ??
        [];

    const meta = data?.data?.meta ?? data?.meta;

    const totalPages =
        meta?.last_page ??
        data?.last_page ??
        1;

    const columns: Column[] = [
        { key: "from_title", title: "From Title" },
        { key: "reference_no", title: "Reference No" },
        { key: "address", title: "Address" },
        { key: "to_title", title: "To Title" },
        { key: "note", title: "Note" },
        { key: "date", title: "Date" },
    ];

    // Map API response to table data
    const tableData = postalReceives.map((item) => ({
        ...item,
        date: item.date
            ? new Date(item.date).toLocaleDateString("en-GB")
            : "-",
    }));

    // Update form
    const handleChange = (value: any, name?: string) => {
        if (name) {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            const e = value;
            const fieldName = e.target.name;
            let fieldValue;

            if (e.target.files) {
                fieldValue = e.target.files[0];
            } else if (e.target.type === "checkbox") {
                fieldValue = e.target.checked;
            } else {
                fieldValue = e.target.value;
            }

            setForm((prev) => ({
                ...prev,
                [fieldName]: fieldValue,
            }));
        }
    };

    // Open add popup
    const handleAddPostalReceive = () => {
        setIsEdit(false);
        setSelectedId(undefined);
        setForm(initialForm);
        setIsPopupOpen(true);
    };

    // Open edit popup
    const handleEdit = (row: PostalReceiveType) => {
        setIsEdit(true);
        setSelectedId(row.id);

        setForm({
            from_title: row.from_title || "",
            reference_no: row.reference_no || "",
            address: row.address || "",
            note: row.note || "",
            to_title: row.to_title || "",
            date: row.date || "",
        });

        setIsPopupOpen(true);
    };

    // Close popup
    const handleClose = () => {
        setIsPopupOpen(false);
        setSelectedId(undefined);
        setForm(initialForm);
    };

    // Save / Update
    const handleSubmit = async () => {
        if (
            !form.from_title.trim() ||
            !form.reference_no.trim() ||
            !form.to_title.trim() ||
            !form.date
        ) {
            return;
        }

        try {
            if (isEdit && selectedId) {
                await updatePostalReceive.mutateAsync({
                    id: selectedId,
                    ...form,
                });
            } else {
                await addPostalReceive.mutateAsync(form);
            }

            handleClose();
        } catch (error) {
            console.error("Postal receive save failed:", error);
        }
    };

    // Delete
    const handleDelete = async (id: number | string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this postal receive?"
        );

        if (!confirmed) return;

        try {
            await removePostalReceive.mutateAsync(id);
        } catch (error) {
            console.error("Postal receive deletion failed:", error);
        }
    };

    const isSaving =
        addPostalReceive.isPending ||
        updatePostalReceive.isPending;

    if (isLoading) {
        return <LoadingOverlay />
    }

    return (
        <div className="page_wrapper">
            <div className="postal_receive">

                {/* Add / Edit Popup */}
                {isPopupOpen && (
                    <PopupScreen
                        title={isEdit ? "Edit Postal Receive" : "Add Postal Receive"}
                        onClick={handleClose}
                    >
                        <div className="popup_body">
                            <div className="fields_wrapper">

                                <div className="body_section">
                                    <InputField
                                        name="from_title"
                                        type="text"
                                        label="From Title"
                                        placeHolder="Enter from title"
                                        value={form.from_title}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        name="reference_no"
                                        type="text"
                                        label="Reference No"
                                        placeHolder="Enter reference no"
                                        value={form.reference_no}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        name="address"
                                        type="text"
                                        label="Address"
                                        placeHolder="Enter address"
                                        value={form.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        name="note"
                                        type="text"
                                        label="Note"
                                        placeHolder="Enter note"
                                        value={form.note}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        name="to_title"
                                        type="text"
                                        label="To Title"
                                        placeHolder="Enter to title"
                                        value={form.to_title}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        name="date"
                                        type="date"
                                        label="Date"
                                        value={form.date}
                                        placeHolder="Select date"
                                        onChange={handleChange}
                                    // onChange={(e: any) =>
                                    //     handleChange("date", e.target.value)
                                    // }
                                    />
                                </div>

                                <div className="body_section">
                                    <InputFiles />
                                </div>

                            </div>

                            <div className="buttons">
                                <SecondaryButton
                                    title="Cancel"
                                    onClick={handleClose}
                                />

                                <PrimaryButton
                                    title={isEdit ? "Update" : "Save"}
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    isLoading={isSaving}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Postal Receive Table */}
                <TableWrapper
                    isAddButton
                    isSearchBar
                    title="Postal Receive"
                    onClick={handleAddPostalReceive}
                    searchValue={search}
                    searchOnchange={setSearch}
                >
                    {isLoading ? (
                        <p>Loading postal receives...</p>
                    ) : isError ? (
                        <p>Unable to load postal receives. Please try again.</p>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={tableData}
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={(p) => setPage(p)}

                            actions={(row: PostalReceiveType) => (
                                <div className="actions">
                                    <button onClick={() => handleEdit(row)}>
                                        <img src="/svgs/edit.svg" alt="Edit" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(row.id)}
                                        disabled={removePostalReceive.isPending}
                                    >
                                        <img src="/svgs/delete.svg" alt="Delete" />
                                    </button>
                                </div>
                            )}
                        />
                    )}
                </TableWrapper>

            </div>
        </div>
    );
};

export default PostalReceive;


// import { useState } from "react"
// import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
// import { InputField } from "../../../components/InputFields/InputFields"
// import PopupScreen from "../../../components/PopupScreen/PopupScreen"
// import TableWrapper from "../../../components/TableWrapper"
// import DataTable, { type Column } from "../../../components/DataTable/DataTable"
// import InputFiles from "../../../components/InputFields/InputFiles"

// const PostalReceive = () => {
//     const [page, setPage] = useState(1);
//     const columns: Column[] = [
//         { key: "from_title", title: "From Title" },
//         { key: "reference_no", title: "Reference No" },
//         { key: "address", title: "Address" },
//         { key: "to_title", title: "To Title" },
//         { key: "note", title: "Note" },
//         { key: "date", title: "Date" },
//     ];

//     const sampleData = [
//         {
//             from_title: "ABC Pvt. Ltd.",
//             reference_no: "REF-10234",
//             address: "123, Park Street, NY",
//             to_title: "Accounts Dept.",
//             note: "Invoice for payment",
//             date: "03-04-2025",
//         },
//     ];

//     const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
//     const handleAddAdmissionQuery = () => {
//         setIsAddAdmissionQuery(!isAddAdmissionQuery)
//     }
//     return (
//         <div className="page_wrapper">
//             <div className="postal_receive">
//                 {isAddAdmissionQuery && <PopupScreen title="Add Postal Receive" onClick={handleAddAdmissionQuery} >
//                     <div className="popup_body" >
//                         <div className="fields_wrapper" >

//                             <div className="body_section" >
//                                 <InputField type="text" label="From Title" placeHolder="Enter from title" />
//                                 <InputField type="text" label="Reference No" placeHolder="Enter refrence no" />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="text" label="Address" placeHolder="Enter address" />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="text" label="Note" placeHolder="Enter note" />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="text" label="To Title" placeHolder="Enter to title" />
//                                 <InputField type="date" label="Date" placeHolder="Select date" />
//                             </div>
//                             <div className="body_section" >
//                                 <InputFiles />
//                             </div>
//                         </div>

//                         <div className="buttons">
//                             <SecondaryButton />
//                             <PrimaryButton title="Save" />
//                         </div>
//                     </div>
//                 </PopupScreen>}

//                 <TableWrapper isAddButton isSearchBar title="Postal Receive" onClick={handleAddAdmissionQuery} >
//                     <DataTable
//                         columns={columns}
//                         data={sampleData}
//                         currentPage={page}
//                         totalPages={21}
//                         onPageChange={(p) => setPage(p)}
//                         actions={() => (
//                             <div className="actions">
//                                 <button><img src="/svgs/edit.svg" alt="" /></button>
//                                 <button><img src="/svgs/delete.svg" alt="" /></button>
//                             </div>
//                         )}
//                     />
//                 </TableWrapper>
//             </div>
//         </div>
//     )
// }

// export default PostalReceive;
