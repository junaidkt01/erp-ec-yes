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
    useFetchAllBooks,
    useIssueBook,
    useDeleteLibraryMember,
    type LibraryMemberItem,
    type BookItem,
} from "../../../hooks/useBooks";
import { toast } from "sonner";
import "./IssueReturnBook.scss";

const IssueReturnBook = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [issueTargetMember, setIssueTargetMember] = useState<LibraryMemberItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<LibraryMemberItem | null>(null);

    // Issue Book Modal states
    const [selectedBookId, setSelectedBookId] = useState<string | number>("");
    const [issueDate, setIssueDate] = useState("2026-11-27");
    const [dueDate, setDueDate] = useState("2026-12-15");
    const [note, setNote] = useState("");

    const { data: membersData, isLoading } = useFetchAllLibraryMembers({
        page,
        per_page: 7,
        search,
    });

    const { data: booksData } = useFetchAllBooks({ per_page: 50 });
    const issueBookMutation = useIssueBook();
    const deleteMemberMutation = useDeleteLibraryMember();

    const columns: Column[] = [
        { key: "member_id", title: "Member ID" },
        { key: "full_name", title: "Full Name" },
        { key: "member_type", title: "Member Type" },
        { key: "phone", title: "Phone" },
        { key: "email", title: "Email" },
    ];

    const rawMembers: LibraryMemberItem[] = membersData?.data || [];
    const totalPages: number = membersData?.meta?.last_page || 1;

    const tableData = rawMembers.map((m: any) => ({
        member_id: m.member_id || "--",
        full_name: typeof m.name === "object" && m.name !== null ? m.name.name || m.name.title : m.name || m.full_name,
        member_type:
            typeof m.member_type === "object" && m.member_type !== null
                ? m.member_type.name || m.member_type.title
                : m.member_type || "Admin",
        phone: m.phone || m.mobile || "--",
        email: m.email || "--",
        raw: m,
    }));

    const bookOptions = (booksData?.data || []).map((b: BookItem) => ({
        label: `${b.title} (Book No: ${b.book_no || "N/A"})`,
        value: b.id,
    }));

    const handleOpenIssue = (member: LibraryMemberItem) => {
        setIssueTargetMember(member);
        setSelectedBookId(bookOptions[0]?.value || "");
        setIssueDate("2026-11-27");
        setDueDate("2026-12-15");
        setNote("First edition copy");
    };

    const handleConfirmIssue = async () => {
        if (!issueTargetMember) return;
        if (!selectedBookId) {
            toast.error("Please select a book to issue");
            return;
        }

        const selectedBook = (booksData?.data || []).find(
            (b: BookItem) => String(b.id) === String(selectedBookId)
        );

        try {
            await issueBookMutation.mutateAsync({
                library_member_id: issueTargetMember.id,
                book_id: selectedBookId,
                issue_date: issueDate,
                due_date: dueDate,
                note: note.trim(),
                member_name: issueTargetMember.name,
                book_title: selectedBook?.title || "Ikigai",
                book_no: selectedBook?.book_no || "3232",
                isbn_no: selectedBook?.isbn_no || "5434",
                author: selectedBook?.author_name || "Thomas",
            });
            toast.success("Book issued successfully");
            setIssueTargetMember(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to issue book");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMemberMutation.mutateAsync(deleteTarget.id);
            toast.success("Member removed successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to remove member");
        }
    };

    return (
        <div className="page_wrapper">
            <div className="issue_return_book_page">
                {/* Issue Book Modal */}
                {issueTargetMember && (
                    <PopupScreen
                        title={`Issue Book to ${issueTargetMember.name}`}
                        onClick={() => setIssueTargetMember(null)}
                    >
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        label="Select Book"
                                        placeholder="Select book to issue"
                                        value={selectedBookId}
                                        options={
                                            bookOptions.length > 0
                                                ? bookOptions
                                                : [{ label: "Ikigai", value: 1 }]
                                        }
                                        onChange={(val: any) => setSelectedBookId(val)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="date"
                                        label="Issue Date"
                                        placeHolder="Select date"
                                        value={issueDate}
                                        onChange={(e: any) => setIssueDate(e.target.value)}
                                    />
                                    <InputField
                                        type="date"
                                        label="Due Date"
                                        placeHolder="Select date"
                                        value={dueDate}
                                        onChange={(e: any) => setDueDate(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Note"
                                        placeHolder="Enter note (e.g. First edition copy)"
                                        value={note}
                                        onChange={(e: any) => setNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton
                                    title="Cancel"
                                    onClick={() => setIssueTargetMember(null)}
                                />
                                <PrimaryButton
                                    title={issueBookMutation.isPending ? "Issuing..." : "Issue Book"}
                                    disabled={issueBookMutation.isPending}
                                    isLoading={issueBookMutation.isPending}
                                    onClick={handleConfirmIssue}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <PopupScreen title="Remove Member" onClick={() => setDeleteTarget(null)}>
                        <div className="popup_body">
                            <p style={{ margin: "16px 0", fontSize: "15px", color: "#374151" }}>
                                Are you sure you want to remove member <strong>{deleteTarget.name}</strong>?
                            </p>
                            <div className="buttons">
                                <SecondaryButton title="Cancel" onClick={() => setDeleteTarget(null)} />
                                <PrimaryButton
                                    title={deleteMemberMutation.isPending ? "Removing..." : "Remove"}
                                    disabled={deleteMemberMutation.isPending}
                                    isLoading={deleteMemberMutation.isPending}
                                    onClick={handleDelete}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isSearchBar
                    title="Issue Books"
                    searchValue={search}
                    searchOnchange={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
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
                                    title="Issue Book"
                                    onClick={() => handleOpenIssue(row.raw)}
                                >
                                    <img src="/svgs/edit.svg" alt="Issue Book" />
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

export default IssueReturnBook;
