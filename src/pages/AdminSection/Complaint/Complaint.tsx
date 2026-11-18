
import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect, StatusBar } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";

import "./Complaint.scss";
import { useAddComplaint, useFetchAllComplaints, useFetchComplaintById, useRemoveComplaint, useUpdateComplaint, type Complaint as ComplaintItem, type CreateComplaintPayload } from "../../../hooks/useComplaint";
import { COMPLAINTS_SOURCE, COMPLAINTS_STATUS, COMPLAINTS_TYPES } from "../../../utils/studentOptions";

const initialForm: CreateComplaintPayload = {
    name: "",
    phone: "",
    email: "",
    complaint_type: "",
    source: "",
    message: "",
    status: "pending",
};

const Complaint = () => {
    const [page, setPage] = useState(1);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupMode, setPopupMode] = useState<"add" | "edit" | "view">("add");
    const [selectedId, setSelectedId] = useState<number | string | undefined>();
    const [form, setForm] = useState<CreateComplaintPayload>(initialForm);
    console.log("form: ",form)

    // API hooks
    const { data, isLoading, isError } = useFetchAllComplaints({
        page,
        per_page: 15,
    });

    const addComplaint = useAddComplaint();
    const updateComplaint = useUpdateComplaint();
    const removeComplaint = useRemoveComplaint();

    const { data: complaintDetails, isLoading: isDetailsLoading } =
        useFetchComplaintById(
            popupMode === "view" || popupMode === "edit"
                ? selectedId
                : undefined
        );

    // Extract API data
    const complaints: ComplaintItem[] =
        data?.data?.data ??
        data?.data ??
        [];

    const meta = data?.data?.meta ?? data?.meta;

    const totalPages =
        meta?.last_page ??
        data?.last_page ??
        1;

    // Table columns
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "complaint_by", title: "Complaint By" },
        { key: "complaint_type", title: "Complaint Type" },
        { key: "source", title: "Source" },
        { key: "phone", title: "Phone" },
        { key: "date", title: "Date" },
    ];

    // Map API response to table rows
    const tableData = complaints.map((item, index) => ({
        ...item,
        sl: (page - 1) * 15 + index + 1,
        complaint_by: item.name,
        date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-GB")
            : "-",
        progress: item.status || "pending",
    }));

    // Update form fields
    const handleChange = (field: keyof CreateComplaintPayload, value: any) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Open add popup
    const handleAddComplaint = () => {
        setPopupMode("add");
        setSelectedId(undefined);
        setForm(initialForm);
        setIsPopupOpen(true);
    };

    // Open edit popup
    const handleEdit = (row: ComplaintItem) => {
        setPopupMode("edit");
        setSelectedId(row.id);

        setForm({
            name: row.name || "",
            phone: row.phone || "",
            email: row.email || "",
            complaint_type: row.complaint_type || "",
            source: row.source || "",
            message: row.message || "",
            status: row.status || "pending",
        });

        setIsPopupOpen(true);
    };

    // Open view popup
    const handleView = (row: ComplaintItem) => {
        setPopupMode("view");
        setSelectedId(row.id);
        setIsPopupOpen(true);
    };

    // Close popup
    const handleClose = () => {
        setIsPopupOpen(false);
        setSelectedId(undefined);
        setForm(initialForm);
    };

    // Save complaint
    const handleSubmit = async () => {
        if (
            !form.name.trim() ||
            !form.phone.trim() ||
            !form.complaint_type ||
            !form.source ||
            !form.message.trim()
        ) {
            return;
        }

        try {
            if (popupMode === "edit" && selectedId) {
                await updateComplaint.mutateAsync({
                    id: selectedId,
                    ...form,
                });
            } else {
                await addComplaint.mutateAsync(form);
            }

            handleClose();
        } catch (error) {
            console.error("Complaint save failed:", error);
        }
    };

    // Delete complaint
    const handleDelete = async (id: number | string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this complaint?"
        );

        if (!confirmed) return;

        try {
            await removeComplaint.mutateAsync(id);
        } catch (error) {
            console.error("Complaint deletion failed:", error);
        }
    };

    const isSaving = addComplaint.isPending || updateComplaint.isPending;

    const isReadOnly = popupMode === "view";

    const details = complaintDetails?.data ?? complaintDetails;

    return (
        <div className="page_wrapper">
            <div className="complaint_page">

                {/* Add / Edit / View Popup */}
                {isPopupOpen && (
                    <PopupScreen
                        title={
                            popupMode === "add"
                                ? "Add Complaint"
                                : popupMode === "edit"
                                    ? "Edit Complaint"
                                    : "Complaint Details"
                        }
                        onClick={handleClose}
                    >
                        <div className="popup_body">
                            {popupMode === "view" && isDetailsLoading ? (
                                <p>Loading complaint details...</p>
                            ) : (
                                <div className="fields_wrapper">

                                    <div className="body_section">
                                        <InputField
                                            type="text"
                                            label="Complaint By"
                                            placeHolder="Enter complainant's name"
                                            value={isReadOnly ? details?.name || "" : form.name}
                                            onChange={(e: any) =>
                                                handleChange("name", e.target.value)
                                            }
                                        />

                                        <CustomSelect
                                            options={COMPLAINTS_TYPES}
                                            label="Complaint Type"
                                            placeholder="Select complaint type"
                                            value={form.complaint_type}
                                            onChange={(val: any) =>
                                                handleChange("complaint_type", val)
                                            }
                                        />

                                        <CustomSelect
                                            options={COMPLAINTS_SOURCE}
                                            label="Complaint Source"
                                            placeholder="Select complaint source"
                                            value={form.source}
                                            onChange={(val: any) =>
                                                handleChange("source", val)
                                            }
                                        />
                                    </div>

                                    <div className="body_section">
                                        <InputField
                                            type="text"
                                            label="Phone"
                                            placeHolder="Enter phone number"
                                            value={isReadOnly ? details?.phone || "" : form.phone}
                                            onChange={(e: any) =>
                                                handleChange("phone", e.target.value)
                                            }
                                        />

                                        <InputField
                                            type="email"
                                            label="Email"
                                            placeHolder="Enter email address"
                                            value={isReadOnly ? details?.email || "" : form.email}
                                            onChange={(e: any) =>
                                                handleChange("email", e.target.value)
                                            }
                                        />

                                        <CustomSelect
                                            options={COMPLAINTS_STATUS}
                                            label="Status"
                                            placeholder="Select status"
                                            value={form.status || "pending"}
                                            onChange={(val: any) =>
                                                handleChange("status", val)
                                            }
                                        />
                                    </div>

                                    <div className="body_section">
                                        <InputField
                                            type="text"
                                            label="Description"
                                            placeHolder="Enter complaint description"
                                            value={
                                                isReadOnly
                                                    ? details?.message || ""
                                                    : form.message
                                            }
                                            onChange={(e: any) =>
                                                handleChange("message", e.target.value)
                                            }
                                        />
                                    </div>

                                </div>
                            )}

                            {!isReadOnly && (
                                <div className="buttons">
                                    <SecondaryButton
                                        title="Cancel"
                                        onClick={handleClose}
                                    />

                                    <PrimaryButton
                                        title={popupMode === "edit" ? "Update" : "Save"}
                                        onClick={handleSubmit}
                                        disabled={isSaving}
                                        isLoading={isSaving}
                                    />
                                </div>
                            )}

                            {isReadOnly && (
                                <div className="buttons">
                                    <SecondaryButton
                                        title="Close"
                                        onClick={handleClose}
                                    />
                                </div>
                            )}
                        </div>
                    </PopupScreen>
                )}

                {/* Complaints Table */}
                <TableWrapper
                    isAddButton
                    isSearchBar
                    title="Complaints"
                    onClick={handleAddComplaint}
                >
                    {isLoading ? (
                        <p>Loading complaints...</p>
                    ) : isError ? (
                        <p>Unable to load complaints. Please try again.</p>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={tableData}
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={(p) => setPage(p)}

                            progress={(status) => (
                                <div className="actions">
                                    <StatusBar status={status} />
                                </div>
                            )}

                            actions={(row: ComplaintItem) => (
                                <div className="actions">
                                    <button onClick={() => handleView(row)}>
                                        <img src="/svgs/eye_open.svg" alt="View" />
                                    </button>

                                    <button onClick={() => handleEdit(row)}>
                                        <img src="/svgs/edit.svg" alt="Edit" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(row.id)}
                                        disabled={removeComplaint.isPending}
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

export default Complaint;


// import { useState } from "react";
// import type { Column } from "../../../components/DataTable/DataTable";
// import TableWrapper from "../../../components/TableWrapper"
// import DataTable from "../../../components/DataTable/DataTable";
// import PopupScreen from "../../../components/PopupScreen/PopupScreen";
// import { InputField } from "../../../components/InputFields/InputFields";
// import { CustomSelect, StatusBar } from "../../../components/InputFields/CustomSelect";
// import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
// import "./Complaint.scss"

// const Complaint = () => {
//     const [page, setPage] = useState(1);
//     const columns: Column[] = [
//         { key: "sl", title: "SL" },
//         { key: "complaint_by", title: "Complaint By" },
//         { key: "complaint_type", title: "Complaint Type" },
//         { key: "source", title: "Source" },
//         { key: "phone", title: "Phone" },
//         { key: "date", title: "Date" },
//         // { key: "progress", title: "Progress" },
//     ];

//     const sampleData = [
//         {
//             sl: "1",
//             complaint_by: "John Smith",
//             complaint_type: "Service Delay",
//             source: "Email.",
//             phone: "9876543210",
//             date: "03-04-2025",
//             progress: "Active",
//         },
//         {
//             sl: "1",
//             complaint_by: "John Smith",
//             complaint_type: "Service Delay",
//             source: "Email.",
//             phone: "9876543210",
//             date: "03-04-2025",
//             progress: "Under Review",
//         },
//         {
//             sl: "1",
//             complaint_by: "John Smith",
//             complaint_type: "Service Delay",
//             source: "Email.",
//             phone: "9876543210",
//             date: "03-04-2025",
//             progress: "In Progress",
//         },
//         {
//             sl: "1",
//             complaint_by: "John Smith",
//             complaint_type: "Service Delay",
//             source: "Email.",
//             phone: "9876543210",
//             date: "03-04-2025",
//             progress: "Resolved",
//         },
//         {
//             sl: "1",
//             complaint_by: "John Smith",
//             complaint_type: "Service Delay",
//             source: "Email.",
//             phone: "9876543210",
//             date: "03-04-2025",
//             progress: "Closed",
//         },
//     ];

//     const [isAddComplaint, setIsAddComplaint] = useState(false)
//     const handleAddComplaint = () => {
//         setIsAddComplaint(!isAddComplaint)
//     }
//     return (
//         <div className="page_wrapper">
//             <div className="complaint_page" >
//                 {isAddComplaint && <PopupScreen title="Add Complaint" onClick={handleAddComplaint} >
//                     <div className="popup_body" >
//                         <div className="fields_wrapper" >

//                             <div className="body_section" >
//                                 <InputField type="text" label="Complaint By" placeHolder="Enter complainant's name" />
//                                 <CustomSelect label="Complaint Type" placeholder="Select complaint type" onChange={(val) => console.log("Selected:", val)} />
//                                 <CustomSelect label="Complaint Source" placeholder="Select complaint source" onChange={(val) => console.log("Selected:", val)} />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="text" label="Phone" placeHolder="Enter phone number" />
//                                 <InputField type="date" label="Date" placeHolder="Select date" />
//                                 <CustomSelect label="Actions Taken" placeholder="Enter actions taken" onChange={(val) => console.log("Selected:", val)} />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="text" label="Address" placeHolder="Enter address" />
//                             </div>
//                             <div className="body_section" >
//                                 <InputField type="text" label="Discription" placeHolder="Enter discription" />
//                             </div>

//                             <div className="body_section" >
//                                 <input type="file" name="" id="" />
//                             </div>
//                         </div>

//                         <div className="buttons">
//                             <SecondaryButton />
//                             <PrimaryButton title="Save" />
//                         </div>
//                     </div>
//                 </PopupScreen>}

//                 <TableWrapper isAddButton isSearchBar title="Complaints" onClick={handleAddComplaint} >
//                     <DataTable
//                         columns={columns}
//                         data={sampleData}
//                         currentPage={page}
//                         totalPages={21}
//                         onPageChange={(p) => setPage(p)}
//                         progress={(row) => (
//                             <div className="actions"> <StatusBar status={row} /> </div>
//                         )}
//                         actions={() => (
//                             <div className="actions">
//                                 <button><img src="/svgs/eye_open.svg" alt="" /></button>
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

// export default Complaint
