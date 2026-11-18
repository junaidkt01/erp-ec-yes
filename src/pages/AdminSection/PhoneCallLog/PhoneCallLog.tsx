
import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

import {
    useFetchAllPhoneCallLogs,
    useAddPhoneCallLog,
    useUpdatePhoneCallLog,
    useRemovePhoneCallLog,
} from "../../../hooks/usePhoneCallLogs"
import LoadingOverlay from "../../../components/Loadingoverlay"

interface PhoneCallLogForm {
    name: string
    phone: string
    date: string
    description: string
    next_follow_up_date: string
    call_duration: string
    note: string
    call_type: string
}

const initialForm: PhoneCallLogForm = {
    name: "",
    phone: "",
    date: "",
    description: "",
    next_follow_up_date: "",
    call_duration: "",
    note: "",
    call_type: "Incoming",
}

const PhoneCallLog = () => {
    const [page, setPage] = useState(1)
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | string | null>(null)
    const [form, setForm] = useState<PhoneCallLogForm>(initialForm)

    // Queries and mutations
    const { data: response, isLoading } = useFetchAllPhoneCallLogs({
        page,
        per_page: 10,
    })

    const addMutation = useAddPhoneCallLog()
    const updateMutation = useUpdatePhoneCallLog()
    const deleteMutation = useRemovePhoneCallLog()

    // Laravel pagination response
    const callLogs = response?.data?.data ?? response?.data ?? []
    const tableData = Array.isArray(callLogs) ? callLogs : []

    const totalPages =
        response?.data?.last_page ??
        response?.meta?.last_page ??
        1

    const columns: Column[] = [
        { key: "name", title: "Name" },
        { key: "phone", title: "Phone" },
        { key: "date", title: "Date" },
        { key: "next_follow_up_date", title: "Follow Up Date" },
        { key: "call_duration", title: "Call Duration" },
        { key: "description", title: "Description" },
    ]

    const openAddPopup = () => {
        setEditingId(null)
        setForm(initialForm)
        setIsPopupOpen(true)
    }

    const openEditPopup = (item: any) => {
        setEditingId(item.id)
        setForm({
            name: item.name ?? "",
            phone: item.phone ?? "",
            date: item.date ?? "",
            description: item.description ?? "",
            next_follow_up_date: item.next_follow_up_date ?? "",
            call_duration: item.call_duration ?? "",
            note: item.note ?? "",
            call_type: item.call_type ?? "Incoming",
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
            if (editingId !== null) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    ...form,
                })
            } else {
                await addMutation.mutateAsync(form)
            }

            closePopup()
        } catch (error) {
            console.error("Failed to save phone call log:", error)
        }
    }

    const handleDelete = async (id: number | string) => {
        if (!window.confirm("Are you sure you want to delete this phone call log?")) {
            return
        }

        try {
            await deleteMutation.mutateAsync(id)
        } catch (error) {
            console.error("Failed to delete phone call log:", error)
        }
    }

    const isSaving = addMutation.isPending || updateMutation.isPending

    if (isLoading) {
        return <LoadingOverlay />
    }

    return (
        <div className="page_wrapper">
            <div className="phone_call_log">
                {isPopupOpen && (
                    <PopupScreen
                        title={editingId !== null ? "Edit Phone Call Log" : "Add Phone Call Log"}
                        onClick={closePopup}
                    >
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        name="name"
                                        label="Name"
                                        placeHolder="Enter name"
                                        value={form.name}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        type="text"
                                        name="phone"
                                        label="Phone"
                                        placeHolder="Enter phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        placeHolder=""
                                        type="date"
                                        name="date"
                                        label="Date"
                                        value={form.date}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        placeHolder=""
                                        type="date"
                                        name="next_follow_up_date"
                                        label="Follow Up Date"
                                        value={form.next_follow_up_date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        name="call_duration"
                                        label="Call Duration"
                                        placeHolder="Enter duration (e.g. 05:30)"
                                        value={form.call_duration}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        name="description"
                                        label="Description"
                                        placeHolder="Enter description"
                                        value={form.description}
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
                                    <div>
                                        <p>Call Type</p>

                                        <div className="radio_group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="call_type"
                                                    value="Incoming"
                                                    checked={form.call_type === "Incoming"}
                                                    onChange={handleChange}
                                                />
                                                Incoming
                                            </label>

                                            <label>
                                                <input
                                                    type="radio"
                                                    name="call_type"
                                                    value="Outgoing"
                                                    checked={form.call_type === "Outgoing"}
                                                    onChange={handleChange}
                                                />
                                                Outgoing
                                            </label>
                                        </div>
                                    </div>
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
                    title="Phone Call Log"
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

export default PhoneCallLog



// import { useState } from "react"
// import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
// import { InputField } from "../../../components/InputFields/InputFields"
// import PopupScreen from "../../../components/PopupScreen/PopupScreen"
// import TableWrapper from "../../../components/TableWrapper"
// import DataTable, { type Column } from "../../../components/DataTable/DataTable"

// const PhoneCallLog = () => {
//     const [page, setPage] = useState(1);
//     const columns: Column[] = [
//         { key: "name", title: "Name" },
//         { key: "phone", title: "Phone" },
//         { key: "date", title: "Date" },
//         { key: "follow_up_date", title: "Follow Up Date" },
//         { key: "call_duration", title: "Call Duration" },
//         { key: "description", title: "Description" },
//     ];

//     const sampleData = [
//         {
//             name: "John Smith",
//             phone: "+1 212-555-1234",
//             date: "03-04-2025",
//             follow_up_date: "03-04-2025",
//             complaint_type: "Service Delay",
//             call_duration: "15 min",
//             description: "Discussed project timeline",
//         },
//     ];

//     const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
//     const handleAddAdmissionQuery = () => {
//         setIsAddAdmissionQuery(!isAddAdmissionQuery)
//     }
//     return (
//         <div className="page_wrapper">
//             <div className="phone_call_log">
//                 {isAddAdmissionQuery && <PopupScreen title="Add Phone Call Log" onClick={handleAddAdmissionQuery} >
//                     <div className="popup_body" >
//                         <div className="fields_wrapper" >
//                             <div className="body_section" >
//                                 <InputField type="text" label="Name" placeHolder="Enter name" />
//                                 <InputField type="text" label="Phone" placeHolder="Enter phone" />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="date" label="Date" placeHolder="Enter complainant's name" />
//                                 <InputField type="date" label="Follow Up date" placeHolder="Enter complainant's name" />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="text" label="Call Duration" placeHolder="Enter call duration" />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="text" label="Description" placeHolder="Enter description" />
//                             </div>

//                             <div>
//                                 <p>Type</p>

//                                 <div>
//                                     <input type="radio" name="" id="" />
//                                     <input type="radio" name="" id="" />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="buttons">
//                             <SecondaryButton />
//                             <PrimaryButton title="Save" />
//                         </div>
//                     </div>
//                 </PopupScreen>}

//                 <TableWrapper isAddButton isSearchBar title="Phone Call Log" onClick={handleAddAdmissionQuery} >
//                     <DataTable
//                         columns={columns}
//                         data={sampleData}
//                         currentPage={page}
//                         totalPages={21}
//                         onPageChange={(p) => setPage(p)}
//                     />
//                 </TableWrapper>
//             </div>
//         </div>
//     )
// }

// export default PhoneCallLog;