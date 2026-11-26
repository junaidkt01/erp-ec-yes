import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Send, Trash2, Eye } from "lucide-react";
import TableWrapper from "../../components/TableWrapper";
import DataTable, { type Column } from "../../components/DataTable/DataTable";
import PopupScreen from "../../components/PopupScreen/PopupScreen";
import { CustomSelect } from "../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import { useAuth } from "../../auth/useAuth";
import { useFetchAllStaff } from "../../hooks/useStaff";
import {
  useFetchAllMessages,
  useAddMessage,
  useDeleteMessage,
  type MessageRecord,
} from "../../hooks/useMessages";

const ITEMS_PER_PAGE = 10;

const defaultSampleMessages: MessageRecord[] = [
  {
    id: 1,
    sender_id: 10,
    receiver_id: 1,
    sender: { id: 10, name: "Rohith Sharma", role: "Teacher" },
    receiver: { id: 1, name: "Admin User", role: "Admin" },
    message: "Physics curriculum notes for Term 1 have been finalized and uploaded.",
    created_at: "2026-11-26T10:40:00Z",
    read_at: null,
    is_read: false,
  },
  {
    id: 2,
    sender_id: 11,
    receiver_id: 1,
    sender: { id: 11, name: "Virat Kohli", role: "Teacher" },
    receiver: { id: 1, name: "Admin User", role: "Admin" },
    message: "Requested room allocation for upcoming weekend sports assessment.",
    created_at: "2026-11-25T14:15:00Z",
    read_at: "2026-11-25T15:00:00Z",
    is_read: true,
  },
  {
    id: 3,
    sender_id: 12,
    receiver_id: 1,
    sender: { id: 12, name: "Sarah Connor", role: "Staffs" },
    receiver: { id: 1, name: "Admin User", role: "Admin" },
    message: "Transport route assignment for Route #4 has been updated with the replacement driver.",
    created_at: "2026-11-24T09:30:00Z",
    read_at: "2026-11-24T10:00:00Z",
    is_read: true,
  },
];

const MessagesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<MessageRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MessageRecord | null>(null);

  // Current logged in user
  const { data: authData } = useAuth();
  const currentUserId = authData?.user?.id || 1;

  // Form states for creating a message
  const [receiverId, setReceiverId] = useState<string | number>("");
  const [messageContent, setMessageContent] = useState("");
  const [formError, setFormError] = useState("");

  // Data fetching
  const { data: apiData } = useFetchAllMessages({ page, per_page: ITEMS_PER_PAGE, search: searchTerm });
  const { data: staffData } = useFetchAllStaff(1);

  const addMessageMutation = useAddMessage();
  const deleteMessageMutation = useDeleteMessage();

  // User options for recipient
  const recipientOptions = useMemo(() => {
    const raw = Array.isArray(staffData?.data) ? staffData.data : Array.isArray(staffData) ? staffData : [];
    if (raw.length === 0) {
      return [
        { label: "Rohith Sharma (Teacher)", value: "10" },
        { label: "Virat Kohli (Teacher)", value: "11" },
        { label: "Sarah Connor (Staff)", value: "12" },
        { label: "Jhon Martin (Driver/Staff)", value: "13" },
      ];
    }
    return raw.map((s: any) => ({
      label: `${s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || `User #${s.id}`} (${s.role?.name || s.designation?.name || "Staff"})`,
      value: String(s.id),
    }));
  }, [staffData]);

  // Messages list from API or fallback
  const rawList: MessageRecord[] = useMemo(() => {
    if (apiData?.data && Array.isArray(apiData.data) && apiData.data.length > 0) {
      return apiData.data;
    }
    if (Array.isArray(apiData) && apiData.length > 0) {
      return apiData;
    }
    return defaultSampleMessages;
  }, [apiData]);

  // Filter list by search query
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter(
      (item) =>
        item.message?.toLowerCase().includes(q) ||
        item.sender?.name?.toLowerCase().includes(q) ||
        item.sender?.full_name?.toLowerCase().includes(q) ||
        item.receiver?.name?.toLowerCase().includes(q) ||
        item.receiver?.full_name?.toLowerCase().includes(q)
    );
  }, [rawList, searchTerm]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));

  // Columns for the messages table
  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "sender", title: "Sender" },
    { key: "receiver", title: "Receiver" },
    { key: "message", title: "Message" },
    { key: "date", title: "Date & Time" },
    { key: "status", title: "Status" },
  ];

  // Paginated table data
  const tableData = useMemo(() => {
    const paginated = filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return paginated.map((item, index) => {
      const senderName = item.sender?.name || item.sender?.full_name || `User #${item.sender_id}`;
      const senderRole = item.sender?.role || "Staff";
      const receiverName = item.receiver?.name || item.receiver?.full_name || `User #${item.receiver_id}`;
      const isUnread = item.read_at === null || item.is_read === false;

      let formattedDate = "-";
      if (item.created_at) {
        try {
          formattedDate = new Date(item.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          formattedDate = item.created_at;
        }
      }

      return {
        id: item.id,
        sl: (page - 1) * ITEMS_PER_PAGE + index + 1,
        sender: (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#e0e7ff",
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              {senderName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13.5px" }}>{senderName}</div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: "#f1f5f9",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                {senderRole}
              </span>
            </div>
          </div>
        ),
        receiver: (
          <div>
            <span style={{ fontWeight: 500, color: "#334155", fontSize: "13.5px" }}>{receiverName}</span>
          </div>
        ),
        message: (
          <div
            style={{
              maxWidth: "380px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: isUnread ? "#0f172a" : "#64748b",
              fontWeight: isUnread ? 600 : 400,
              fontSize: "13px",
            }}
            title={item.message}
          >
            {item.message}
          </div>
        ),
        date: <span style={{ color: "#64748b", fontSize: "12.5px" }}>{formattedDate}</span>,
        status: (
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: isUnread ? "#eef2ff" : "#f1f5f9",
              color: isUnread ? "#605dec" : "#64748b",
            }}
          >
            {isUnread ? "Unread" : "Read"}
          </span>
        ),
        full_data: item,
      };
    });
  }, [filteredList, page]);

  // Open / Close modal
  const handleOpenCreateModal = () => {
    setReceiverId(recipientOptions[0]?.value || "10");
    setMessageContent("");
    setFormError("");
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setMessageContent("");
    setFormError("");
  };

  // Submit new message
  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setFormError("Message content cannot be empty");
      return;
    }
    if (!receiverId) {
      setFormError("Please select a recipient");
      return;
    }

    try {
      await addMessageMutation.mutateAsync({
        sender_id: currentUserId,
        receiver_id: receiverId,
        message: messageContent.trim(),
      });
      toast.success("Message sent successfully");
      handleCloseCreateModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMessageMutation.mutateAsync(deleteTarget.id);
      toast.success("Message deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete message");
    }
  };

  return (
    <div className="page_wrapper">
      <div className="messages_mgmt_page">
        {/* Create Message Popup Modal */}
        {isCreateModalOpen && (
          <PopupScreen
            className="message_create_popup"
            title="Send New Message"
            onClick={handleCloseCreateModal}
          >
            <div className="popup_body" style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gap: "18px" }}>
                <div>
                  <CustomSelect
                    label="Recipient *"
                    placeholder="Select recipient user"
                    options={recipientOptions}
                    value={receiverId}
                    onChange={(val: any) => setReceiverId(val)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Type your message here..."
                    value={messageContent}
                    onChange={(e) => {
                      setMessageContent(e.target.value);
                      if (formError) setFormError("");
                    }}
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      border: formError ? "1.5px solid #ef4444" : "1px solid #d1d5db",
                      padding: "12px 14px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {formError && (
                    <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                      {formError}
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "14px",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <SecondaryButton title="Cancel" onClick={handleCloseCreateModal} />
                <PrimaryButton
                  title={addMessageMutation.isPending ? "Sending..." : "Send Message"}
                  icon={<Send size={15} />}
                  onClick={handleSendMessage}
                  disabled={addMessageMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* View Message Details Modal */}
        {viewingMessage && (
          <PopupScreen
            className="message_view_popup"
            title="Message Details"
            onClick={() => setViewingMessage(null)}
          >
            <div className="popup_body" style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                      From:
                    </span>{" "}
                    <strong style={{ color: "#1e293b", fontSize: "14px" }}>
                      {viewingMessage.sender?.name || viewingMessage.sender?.full_name || `User #${viewingMessage.sender_id}`}
                    </strong>
                    {viewingMessage.sender?.role && (
                      <span style={{ marginLeft: "6px", fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#64748b" }}>
                        {viewingMessage.sender.role}
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {viewingMessage.created_at ? new Date(viewingMessage.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                    To:
                  </span>{" "}
                  <strong style={{ color: "#1e293b", fontSize: "14px" }}>
                    {viewingMessage.receiver?.name || viewingMessage.receiver?.full_name || `User #${viewingMessage.receiver_id}`}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  padding: "16px 18px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#334155",
                  whiteSpace: "pre-wrap",
                  minHeight: "100px",
                }}
              >
                {viewingMessage.message}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <PrimaryButton title="Close" onClick={() => setViewingMessage(null)} />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <PopupScreen
            className="delete_confirm_modal"
            title="Delete Message"
            onClick={() => setDeleteTarget(null)}
          >
            <div className="popup_body" style={{ padding: "24px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                }}
              >
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1e293b", marginBottom: "8px" }}>
                Confirm Delete Message?
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <SecondaryButton title="Cancel" onClick={() => setDeleteTarget(null)} />
                <PrimaryButton
                  title={deleteMessageMutation.isPending ? "Deleting..." : "Confirm Delete"}
                  onClick={handleConfirmDelete}
                  disabled={deleteMessageMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Main Table View */}
        <TableWrapper
          title="Messages / Inbox"
          addButtonTitle="New Message"
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          onClick={handleOpenCreateModal}
        >
          <DataTable
            columns={columns}
            data={tableData}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            actions={(row) => (
              <div className="actions">
                <button
                  type="button"
                  className="edit_btn hvr_zm_out"
                  title="View Message"
                  onClick={() => setViewingMessage(row.full_data || row)}
                  style={{ background: "#eef2ff", border: "none", borderRadius: "6px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#605dec" }}
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete Message"
                  onClick={() => setDeleteTarget(row.full_data || row)}
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

export default MessagesPage;
