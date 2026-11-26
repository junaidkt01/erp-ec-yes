import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bell, Send } from "lucide-react";
import TableWrapper from "../../components/TableWrapper";
import DataTable, { type Column } from "../../components/DataTable/DataTable";
import PopupScreen from "../../components/PopupScreen/PopupScreen";
import { InputField } from "../../components/InputFields/InputFields";
import { CustomSelect } from "../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import { useFetchAllStaff } from "../../hooks/useStaff";
import {
  useFetchAllNotifications,
  useAddNotification,
  useDeleteNotification,
  type NotificationRecord,
} from "../../hooks/useNotifications";

const ITEMS_PER_PAGE = 10;

const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: apiData } = useFetchAllNotifications({ page, per_page: ITEMS_PER_PAGE, search: searchTerm });
  const addNotificationMutation = useAddNotification();
  const deleteNotificationMutation = useDeleteNotification();

  // Fetch users/staff for target recipient dropdown
  const { data: staffData } = useFetchAllStaff(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string>("1");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<NotificationRecord | null>(null);

  const userOptions = useMemo(() => {
    const rawStaff: any[] = Array.isArray(staffData?.data)
      ? staffData.data
      : Array.isArray(staffData?.data?.data)
        ? staffData.data.data
        : Array.isArray(staffData)
          ? staffData
          : [];

    if (rawStaff.length === 0) {
      return [
        { label: "Admin User (ID: 1)", value: "1" },
        { label: "Staff - Jhon Martin (ID: 10)", value: "10" },
        { label: "Teacher - Robert Smith (ID: 11)", value: "11" },
      ];
    }

    return rawStaff.map((s: any) => ({
      label: `${s.full_name || s.name || "Staff"} (ID: ${s.id || s.user_id})`,
      value: String(s.user_id || s.id),
    }));
  }, [staffData]);

  const rawList: NotificationRecord[] = useMemo(() => {
    if (apiData?.data && Array.isArray(apiData.data)) return apiData.data;
    if (Array.isArray(apiData)) return apiData;
    return []
  }, [apiData]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter(
      (n) => n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q)
    );
  }, [rawList, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "title", title: "Title" },
    { key: "message", title: "Message" },
    { key: "recipient", title: "Recipient / User ID" },
    { key: "date", title: "Created At" },
  ];

  const tableData = useMemo(() => {
    const paginated = filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return paginated.map((item, index) => ({
      id: item.id,
      sl: (page - 1) * ITEMS_PER_PAGE + index + 1,
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 500, color: "#1e293b" }}>
          <Bell size={16} color="#605dec" />
          <span>{item.title}</span>
        </div>
      ),
      message: (
        <div style={{ maxWidth: "400px", color: "#475569", fontSize: "13px" }}>
          {item.message}
        </div>
      ),
      recipient: item.user?.full_name || item.user?.name || `User #${item.user_id || "All"}`,
      date: item.created_at ? new Date(item.created_at).toLocaleString() : "-",
      full_data: item,
    }));
  }, [filteredList, page]);

  const handleOpenAddModal = () => {
    setTitle("");
    setMessage("");
    setTargetUserId("1");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setMessage("");
    setErrors({});
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = "Notification title is required";
    if (!message.trim()) errs.message = "Notification message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendNotification = async () => {
    if (!validate()) return;

    try {
      await addNotificationMutation.mutateAsync({
        user_id: Number(targetUserId) || 1,
        title: title.trim(),
        message: message.trim(),
      });
      toast.success("Notification sent successfully via POST /api/notifications");
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send notification");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNotificationMutation.mutateAsync(deleteTarget.id);
      toast.success("Notification deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete notification");
    }
  };

  return (
    <div className="page_wrapper">
      <div className="notifications_mgmt_page">
        {/* Send Notification Modal */}
        {isModalOpen && (
          <PopupScreen
            className="notification_popup_modal"
            title="Create Notification"
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div style={{ display: "grid", gap: "16px" }}>
                <CustomSelect
                  label="Target User"
                  placeholder="Select recipient user"
                  options={userOptions}
                  value={targetUserId}
                  onChange={(v: any) => setTargetUserId(String(v))}
                />

                <InputField
                  type="text"
                  label="Title"
                  placeHolder="Enter notification title"
                  value={title}
                  error={errors.title}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setTitle(val);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                />

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter notification message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                    }}
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      border: errors.message ? "1px solid #ef4444" : "1px solid #e2e8f0",
                      padding: "12px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      backgroundColor: "#fff",
                    }}
                  />
                  {errors.message && (
                    <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>
                      {errors.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Cancel" onClick={handleCloseModal} />
                <PrimaryButton
                  title={addNotificationMutation.isPending ? "Sending..." : "Send Notification"}
                  icon={<Send size={16} />}
                  onClick={handleSendNotification}
                  disabled={addNotificationMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Modal */}
        {deleteTarget && (
          <PopupScreen
            className="notification_popup_modal"
            title="Delete Notification"
            onClick={() => setDeleteTarget(null)}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>Are you sure you want to delete notification <strong>"{deleteTarget.title}"</strong>?</p>
              </div>
              <div className="buttons">
                <SecondaryButton onClick={() => setDeleteTarget(null)} title="Cancel" />
                <PrimaryButton
                  onClick={handleDelete}
                  title={deleteNotificationMutation.isPending ? "Deleting..." : "Delete"}
                  disabled={deleteNotificationMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Notifications Table */}
        <TableWrapper
          title="Notifications List"
          addButtonTitle="New Notification"
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          onClick={handleOpenAddModal}
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
                  className="delete_btn hvr_zm_out"
                  title="Delete Notification"
                  onClick={() => setDeleteTarget(row.full_data)}
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

export default NotificationsPage;
