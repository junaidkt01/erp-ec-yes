import { useEffect, useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import { useNavigate } from "react-router-dom"
import LoadingOverlay from "../../../components/Loadingoverlay"
import { useBlockStaff, useFetchAllStaff, useRemoveStaff } from "../../../hooks/useStaff"
import { useDebounce } from "../../../hooks/useDebounce"
import { toast } from "sonner"

const StaffList = () => {
    const navigate = useNavigate()
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: sampleData, isLoading } = useFetchAllStaff(page, {
        search: debouncedSearch,
    });

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "staff_code", title: "Staff ID" },
        { key: "name", title: "Name" },
        { key: "category", title: "Category" },
        { key: "role", title: "Role" },
        { key: "designation", title: "Designation" },
        { key: "phone", title: "Phone" },
        { key: "gender", title: "Gender" },
    ];

    const [staffList, setStaffList] = useState<any>([]);

    useEffect(() => {
        if (!sampleData) return;

        const rawList = Array.isArray(sampleData) ? sampleData : (sampleData?.data || []);

        const mappedData = rawList?.map((staffItem: any, index: number) => ({
            sl: index + 1,
            staff_code: staffItem.staff_code || staffItem.staff_no || "",
            name: staffItem.full_name || `${staffItem.first_name || ""} ${staffItem.last_name || ""}`.trim() || staffItem.name || "",
            category: staffItem.category || "-",
            role: staffItem.role || "-",
            designation: staffItem.designation || "-",
            phone: staffItem.phone || "-",
            gender: staffItem.gender || "-",

            full_data: staffItem,
        }));

        setStaffList(mappedData);
    }, [sampleData]);

    // Delete Staff
    const [deleteStaff, setDeleteStaff] = useState({ id: "", name: "" });
    const handleDeleteStaff = (staffId: string, staffName: string) => {
        setDeleteStaff({ id: staffId, name: staffName });
    }
    const { mutate: removeStaff, isPending: isDeletePending } = useRemoveStaff();
    const handleConfirmDeleteStaff = (staffId: string) => {
        removeStaff(staffId, {
            onSuccess: () => {
                setDeleteStaff({ id: "", name: "" });
                toast.success('Staff deleted successfully');
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to delete staff");
            },
        });
    };
    const handleCancelDeleteStaff = () => {
        setDeleteStaff({ id: "", name: "" });
    }

    // Block Staff
    const [blockStaff, setBlockStaff] = useState({ id: "", name: "", reason: "" });
    const handleBlockStaff = (staffId: string, staffName: string, reason: string) => {
        setBlockStaff({ id: staffId, name: staffName, reason: reason });
    }

    const { mutate: updateStaffBlock, isPending: isBlockPending } = useBlockStaff();
    const [blockingReason, setBlockingReason] = useState("");

    const handleConfirmBlockStaff = (staffId: string) => {
        const isCurrentlyDisabled = blockStaff.reason ? 0 : 1;
        updateStaffBlock(
            {
                staffId: staffId,
                data: {
                    disable_reason: blockingReason || null,
                    is_disabled: isCurrentlyDisabled as 0 | 1,
                },
            },
            {
                onSuccess: () => {
                    toast.success(isCurrentlyDisabled ? 'Staff blocked successfully' : 'Staff unblocked successfully');
                    setBlockStaff({ id: "", name: "", reason: "" });
                    setBlockingReason("");
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Failed to update staff status");
                }
            }
        );
    };

    const handleCancelBlockStaff = () => {
        setBlockStaff({ id: "", name: "", reason: "" });
    }

    if (isLoading) {
        return <LoadingOverlay isLoading={true} />
    }

    const totalPages = sampleData?.meta?.total
        ? Math.ceil(Number(sampleData?.meta?.total) / Number(sampleData?.meta?.per_page || 10))
        : 1;

    return (
        <div className="page_wrapper" >
            <div className="student_list" >
                {blockStaff.id && <PopupScreen title={`Block ${blockStaff.name}`} onClick={handleCancelBlockStaff} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            <InputField value={blockingReason || blockStaff.reason} onChange={(e) => setBlockingReason(e.target.value)} type="text" label="Type reason to block this staff" placeHolder="Enter reason" />
                        </div>

                        <div className="buttons" >
                            <SecondaryButton onClick={handleCancelBlockStaff} title="Cancel" />
                            <PrimaryButton onClick={() => handleConfirmBlockStaff(blockStaff.id)} disabled={isBlockPending} title={isBlockPending ? "Updating..." : "Confirm"} />
                        </div>
                    </div>
                </PopupScreen>}

                {deleteStaff.id && <PopupScreen title={`Delete ${deleteStaff.name}`} onClick={handleCancelDeleteStaff} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            <p>Are you sure you want to delete this staff record?</p>
                        </div>

                        <div className="buttons">
                            <SecondaryButton onClick={handleCancelDeleteStaff} title="Cancel" />
                            <PrimaryButton onClick={() => handleConfirmDeleteStaff(deleteStaff.id)} disabled={isDeletePending} title={isDeletePending ? "Deleting..." : "Delete"} />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton onClick={() => navigate("/human-resource/add-staff")} isSearchBar searchValue={searchTerm} searchOnchange={setSearchTerm} title="Staff List" >
                    <DataTable
                        columns={columns}
                        data={staffList}
                        currentPage={sampleData?.meta?.current_page || page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                        actions={(row) => (
                            <div className="actions">
                                <button className="hvr_zm_out" onClick={() => navigate(`/human-resource/profile/${row?.full_data?.id}`)} ><img src="/svgs/eye_open.svg" alt="" /></button>
                                <button className="hvr_zm_out" onClick={() => navigate(`/human-resource/add-staff/${row?.full_data?.id}`)} ><img src="/svgs/edit.svg" alt="" /></button>
                                <button className="hvr_zm_out" onClick={() => handleDeleteStaff(row?.full_data?.id, `${row?.full_data?.first_name || ""} ${row?.full_data?.last_name || ""}`.trim() || row?.full_data?.name || "Staff")} ><img src="/svgs/delete.svg" alt="" /></button>
                                <button className="hvr_zm_out" onClick={() => handleBlockStaff(row?.full_data?.id, `${row?.full_data?.first_name || ""} ${row?.full_data?.last_name || ""}`.trim() || row?.full_data?.name || "Staff", row?.full_data?.disable_reason)} >{row?.full_data?.is_disabled ? <img src="/svgs/enable.svg" alt="" /> : <img src="/svgs/block.svg" alt="" />}</button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default StaffList;