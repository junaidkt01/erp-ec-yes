
import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import InputFiles from "../../../components/InputFields/InputFiles"
import { useAddPostalDispatch, useFetchAllPostalDispatches, useRemovePostalDispatch, useUpdatePostalDispatch } from "../../../hooks/usePostalDispatch"
import LoadingOverlay from "../../../components/Loadingoverlay"

interface PostalDispatchForm {
    to_title: string
    reference_no: string
    address: string
    note: string
    from_title: string
    date: string
}

const initialForm: PostalDispatchForm = {
    to_title: "",
    reference_no: "",
    address: "",
    note: "",
    from_title: "",
    date: "",
}

const PostalDispatch = () => {
    const [page, setPage] = useState(1)
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | string | null>(null)
    const [form, setForm] = useState<PostalDispatchForm>(initialForm)

    const { data: dispatchResponse, isLoading } =
        useFetchAllPostalDispatches({ page, per_page: 10 })

    const addMutation = useAddPostalDispatch()
    const updateMutation = useUpdatePostalDispatch()
    const deleteMutation = useRemovePostalDispatch()

    // Supports the usual Laravel paginated response structure.
    const dispatchData =
        dispatchResponse?.data?.data ??
        dispatchResponse?.data ??
        []

    const tableData = Array.isArray(dispatchData) ? dispatchData : []

    const totalPages =
        dispatchResponse?.data?.last_page ??
        dispatchResponse?.meta?.last_page ??
        1

    const columns: Column[] = [
        { key: "to_title", title: "To Title" },
        { key: "reference_no", title: "Reference No" },
        { key: "address", title: "Address" },
        { key: "from_title", title: "From Title" },
        { key: "note", title: "Note" },
        { key: "date", title: "Date" },
    ]

    const openAddPopup = () => {
        setEditingId(null)
        setForm(initialForm)
        setIsPopupOpen(true)
    }

    const openEditPopup = (item: any) => {
        setEditingId(item.id)
        setForm({
            to_title: item.to_title ?? "",
            reference_no: item.reference_no ?? "",
            address: item.address ?? "",
            note: item.note ?? "",
            from_title: item.from_title ?? "",
            date: item.date ?? "",
        })
        setIsPopupOpen(true)
    }

    const closePopup = () => {
        setIsPopupOpen(false)
        setEditingId(null)
        setForm(initialForm)
    }

    const handleChange = (value: any, name?: string) => {
        if (name) {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }))
        } else {
            const fieldName = value.target.name
            const fieldValue = value.target.value

            setForm((prev) => ({
                ...prev,
                [fieldName]: fieldValue,
            }))
        }
    }

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    ...form,
                })
            } else {
                await addMutation.mutateAsync(form)
            }

            closePopup()
        } catch (error) {
            console.error("Failed to save postal dispatch:", error)
        }
    }

    const handleDelete = async (id: number | string) => {
        if (!window.confirm("Are you sure you want to delete this postal dispatch?")) {
            return
        }

        try {
            await deleteMutation.mutateAsync(id)
        } catch (error) {
            console.error("Failed to delete postal dispatch:", error)
        }
    }

    const isSaving = addMutation.isPending || updateMutation.isPending

    if (isLoading) {
        return <LoadingOverlay />
    }

    return (
        <div className="page_wrapper">
            <div className="postal_dispatch">
                {isPopupOpen && (
                    <PopupScreen
                        title={editingId ? "Edit Postal Dispatch" : "Add Postal Dispatch"}
                        onClick={closePopup}
                    >
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        name="from_title"
                                        label="From Title"
                                        placeHolder="Enter from title"
                                        value={form.from_title}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        type="text"
                                        name="reference_no"
                                        label="Reference No"
                                        placeHolder="Enter reference no"
                                        value={form.reference_no}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        name="address"
                                        label="Address"
                                        placeHolder="Enter address"
                                        value={form.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        name="note"
                                        label="Note"
                                        placeHolder="Enter note"
                                        value={form.note}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        name="to_title"
                                        label="To Title"
                                        placeHolder="Enter to title"
                                        value={form.to_title}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        type="date"
                                        name="date"
                                        label="Date"
                                        placeHolder="Select date"
                                        value={form.date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputFiles />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton
                                    title="Cancel"
                                    onClick={closePopup}
                                />

                                <PrimaryButton
                                    title={isSaving ? "Saving..." : "Save"}
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isAddButton
                    isSearchBar
                    title="Postal Dispatch"
                    onClick={openAddPopup}
                >
                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        actions={(item: any) => (
                            <div className="actions">
                                <button onClick={() => openEditPopup(item)}>
                                    <img src="/svgs/edit.svg" alt="Edit" />
                                </button>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <img src="/svgs/delete.svg" alt="Delete" />
                                </button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default PostalDispatch


// import { useState } from "react"
// import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
// import { InputField } from "../../../components/InputFields/InputFields"
// import PopupScreen from "../../../components/PopupScreen/PopupScreen"
// import TableWrapper from "../../../components/TableWrapper"
// import DataTable, { type Column } from "../../../components/DataTable/DataTable"
// import InputFiles from "../../../components/InputFields/InputFiles"

// const PostalDispatch = () => {
//     const [page, setPage] = useState(1);
//     const columns: Column[] = [
//         { key: "to_title", title: "To Title" },
//         { key: "reference_no", title: "Reference No" },
//         { key: "address", title: "Address" },
//         { key: "from_title", title: "From Title" },
//         { key: "note", title: "Note" },
//         { key: "date", title: "Date" },
//     ];

//     const sampleData = [
//         {
//             to_title: "ABC Pvt. Ltd.",
//             reference_no: "REF-10234",
//             address: "123, Park Street, NY",
//             from_title: "Accounts Dept.",
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
//             <div className="postal_dispatch">
//                 {isAddAdmissionQuery &&
//                     <PopupScreen title="Add Postal Dispatch" onClick={handleAddAdmissionQuery} >
//                         <div className="popup_body" >
//                             <div className="fields_wrapper" >
//                                 <div className="body_section" >
//                                     <InputField type="text" label="From Title" placeHolder="Enter from title" />
//                                     <InputField type="text" label="Reference No" placeHolder="Enter refrence no" />
//                                 </div>
//                                 <div className="body_section" >
//                                     <InputField type="text" label="Address" placeHolder="Enter address" />
//                                 </div>
//                                 <div className="body_section" >
//                                     <InputField type="text" label="Note" placeHolder="Enter note" />
//                                 </div>
//                                 <div className="body_section" >
//                                     <InputField type="text" label="To Title" placeHolder="Enter to title" />
//                                     <InputField type="date" label="Date" placeHolder="Select date" />
//                                 </div>
//                                 <div className="body_section" >
//                                     <InputFiles />
//                                 </div>
//                             </div>

//                             <div className="buttons">
//                                 <SecondaryButton />
//                                 <PrimaryButton title="Save" />
//                             </div>
//                         </div>
//                     </PopupScreen>}

//                 <TableWrapper isAddButton isSearchBar title="Postal Dispatch" onClick={handleAddAdmissionQuery} >
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

// export default PostalDispatch;
