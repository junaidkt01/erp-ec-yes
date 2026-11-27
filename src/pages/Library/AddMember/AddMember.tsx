import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
    useFetchAllLibraryMembers,
    useAddLibraryMember,
    useUpdateLibraryMember,
    useDeleteLibraryMember,
    type LibraryMemberItem,
} from "../../../hooks/useBooks";
import { toast } from "sonner";
import "./AddMember.scss";

const AddMember = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isAddMember, setIsAddMember] = useState(false);
    const [editingMember, setEditingMember] = useState<LibraryMemberItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<LibraryMemberItem | null>(null);

    // Form fields
    const [memberType, setMemberType] = useState("Super Admin");
    const [memberId, setMemberId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const { data: membersData, isLoading } = useFetchAllLibraryMembers({
        page,
        per_page: 6,
        search,
    });

    const addMemberMutation = useAddLibraryMember();
    const updateMemberMutation = useUpdateLibraryMember();
    const deleteMemberMutation = useDeleteLibraryMember();

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "name", title: "Name" },
        { key: "member_type", title: "Member Type" },
        { key: "member_id", title: "Member ID" },
        { key: "email", title: "Email" },
        { key: "mobile", title: "Mobile" },
    ];

    const rawList: LibraryMemberItem[] = membersData?.data || [];
    const totalPages: number = membersData?.meta?.last_page || 1;

    const tableData = rawList.map((item: any, index: number) => ({
        sl: (page - 1) * 6 + index + 1,
        name: typeof item.name === "object" && item.name !== null ? item.name.name || item.name.title : item.name,
        member_type:
            typeof item.member_type === "object" && item.member_type !== null
                ? item.member_type.name || item.member_type.title
                : item.member_type || "Student",
        member_id: item.member_id || "--",
        email: item.email || "--",
        mobile: item.mobile || item.phone || "--",
        raw: item,
    }));

    const handleOpenAdd = () => {
        setEditingMember(null);
        setMemberType("Super Admin");
        setMemberId("");
        setName("");
        setEmail("");
        setPhone("");
        setIsAddMember(true);
    };

    const handleOpenEdit = (member: LibraryMemberItem) => {
        setEditingMember(member);
        setMemberType(member.member_type || "Super Admin");
        setMemberId(member.member_id || "");
        setName(member.name || "");
        setEmail(member.email || "");
        setPhone(member.phone || member.mobile || "");
        setIsAddMember(true);
    };

    const handleCloseModal = () => {
        setIsAddMember(false);
        setEditingMember(null);
        setMemberType("Super Admin");
        setMemberId("");
        setName("");
        setEmail("");
        setPhone("");
    };

    const handleSaveMember = async () => {
        if (!name.trim()) {
            toast.error("Please enter member name");
            return;
        }
        if (!memberId.trim()) {
            toast.error("Please enter member ID");
            return;
        }

        try {
            const payload = {
                member_type: memberType,
                member_id: memberId.trim(),
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
            };

            if (editingMember) {
                await updateMemberMutation.mutateAsync({
                    id: editingMember.id,
                    ...payload,
                });
                toast.success("Library member updated successfully");
            } else {
                await addMemberMutation.mutateAsync(payload);
                toast.success("Library member created successfully");
            }
            handleCloseModal();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to save member");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMemberMutation.mutateAsync(deleteTarget.id);
            toast.success("Library member deleted successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to delete member");
        }
    };

    const isPending = addMemberMutation.isPending || updateMemberMutation.isPending;

    return (
        <div className="page_wrapper">
            <div className="add_member_page">
                {/* Add / Edit Member Popup */}
                {isAddMember && (
                    <PopupScreen
                        title={editingMember ? "Edit Member" : "Add Member"}
                        onClick={handleCloseModal}
                    >
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        label="Member Type"
                                        placeholder="Select member type"
                                        value={memberType}
                                        options={[
                                            { label: "Super Admin", value: "Super Admin" },
                                            { label: "Admin", value: "Admin" },
                                            { label: "Staff", value: "Staff" },
                                            { label: "Student", value: "Student" },
                                        ]}
                                        onChange={(val: any) => setMemberType(val)}
                                    />
                                    <InputField
                                        type="text"
                                        label="Member ID"
                                        placeHolder="Enter member id"
                                        value={memberId}
                                        onChange={(e: any) => setMemberId(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Full Name"
                                        placeHolder="Enter full name"
                                        value={name}
                                        onChange={(e: any) => setName(e.target.value)}
                                    />
                                    <InputField
                                        type="email"
                                        label="Email"
                                        placeHolder="Enter email address"
                                        value={email}
                                        onChange={(e: any) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Mobile"
                                        placeHolder="Enter mobile number"
                                        value={phone}
                                        onChange={(e: any) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton
                                    title="Reset"
                                    onClick={() => {
                                        setMemberId("");
                                        setName("");
                                        setEmail("");
                                        setPhone("");
                                    }}
                                />
                                <PrimaryButton
                                    title={
                                        isPending
                                            ? "Saving..."
                                            : editingMember
                                            ? "Update Member"
                                            : "Save Member"
                                    }
                                    disabled={isPending}
                                    isLoading={isPending}
                                    onClick={handleSaveMember}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <PopupScreen title="Delete Member" onClick={() => setDeleteTarget(null)}>
                        <div className="popup_body">
                            <p style={{ margin: "16px 0", fontSize: "15px", color: "#374151" }}>
                                Are you sure you want to delete member <strong>{deleteTarget.name}</strong>?
                            </p>
                            <div className="buttons">
                                <SecondaryButton title="Cancel" onClick={() => setDeleteTarget(null)} />
                                <PrimaryButton
                                    title={deleteMemberMutation.isPending ? "Deleting..." : "Delete"}
                                    disabled={deleteMemberMutation.isPending}
                                    isLoading={deleteMemberMutation.isPending}
                                    onClick={handleDelete}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isAddButton
                    isSearchBar
                    title="Members"
                    addButtonTitle="Add Member"
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
                        emptyMessage={isLoading ? "Loading members..." : "No members found."}
                        actions={(row: any) => (
                            <div className="actions">
                                <button
                                    type="button"
                                    title="Edit Member"
                                    onClick={() => handleOpenEdit(row.raw)}
                                >
                                    <img src="/svgs/edit.svg" alt="Edit" />
                                </button>
                                <button
                                    type="button"
                                    title="Delete Member"
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

export default AddMember;
