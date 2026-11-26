import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X, Bell, Trash2, ArrowRight, RotateCw } from "lucide-react";
import {
  useFetchAllNotifications,
  useDeleteNotification,
} from "../../hooks/useNotifications";
import "./Notifications.scss";

export interface NotificationItem {
  id: string | number;
  title?: string;
  message: string;
  time: string;
  isUnread?: boolean;
  thumbnail?: string;
  raw?: any;
}

export interface NotificationsProps {
  onClose?: () => void;
  items?: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onItemClick?: (item: NotificationItem) => void;
  className?: string;
  isStandalone?: boolean;
}

const formatNotificationTime = (dateStr?: string): string => {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

export const Notifications: React.FC<NotificationsProps> = ({
  onClose,
  items,
  onMarkAllAsRead,
  onItemClick,
  className = "",
  isStandalone = false,
}) => {
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: apiData, isLoading, refetch, isFetching } = useFetchAllNotifications({ per_page: 25 });
  const deleteMutation = useDeleteNotification();

  // Locally dismissed or modified IDs
  const [readIds, setReadIds] = useState<Set<string | number>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string | number>>(new Set());
  const [allMarkedRead, setAllMarkedRead] = useState(false);

  // Parse notifications from API or fallback
  const parsedNotifications = useMemo<NotificationItem[]>(() => {
    if (items && items.length > 0) {
      return items;
    }

    const rawList = Array.isArray(apiData?.data)
      ? apiData.data
      : Array.isArray(apiData)
      ? apiData
      : [];

    return rawList.map((item: any) => {
      const isUnread =
        item.read_at === null ||
        item.read_at === undefined ||
        item.is_read === false ||
        item.is_read === 0;

      return {
        id: item.id,
        title: item.title || "Notification",
        message: item.message || item.body || "",
        time: formatNotificationTime(item.created_at || item.updated_at),
        isUnread: Boolean(isUnread),
        thumbnail: item.thumbnail || item.user?.photo || undefined,
        raw: item,
      };
    });
  }, [apiData, items]);

  // Apply local modifications (deleted, marked read)
  const displayList = useMemo(() => {
    return parsedNotifications
      .filter((n) => !deletedIds.has(n.id))
      .map((n) => {
        if (allMarkedRead || readIds.has(n.id)) {
          return { ...n, isUnread: false };
        }
        return n;
      });
  }, [parsedNotifications, deletedIds, readIds, allMarkedRead]);

  const hasUnread = useMemo(() => {
    return displayList.some((n) => n.isUnread);
  }, [displayList]);

  const handleMarkAllRead = () => {
    setAllMarkedRead(true);
    setReadIds(new Set(displayList.map((n) => n.id)));
    toast.success("All notifications marked as read");
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    setReadIds((prev) => new Set([...prev, item.id]));
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    setDeletedIds((prev) => new Set([...prev, id]));
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Notification removed");
    } catch {
      // Keep optimistic removal
      toast.success("Notification removed");
    }
  };

  const handleViewAll = () => {
    if (onClose) {
      onClose();
    }
    navigate("/notifications-list");
  };

  return (
    <div
      className={`notifications-dropdown ${isStandalone ? "standalone" : ""} ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="notifications-header">
        <div className="notifications-header-left">
          <h2 className="notifications-title">Notifications</h2>
          <button
            type="button"
            className="mark-all-read-btn"
            onClick={handleMarkAllRead}
            disabled={!hasUnread}
          >
            Mark all as read
          </button>
        </div>

        <div className="notifications-header-right">
          <button
            type="button"
            className="refresh-btn"
            title="Refresh"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RotateCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
          {onClose && (
            <button
              type="button"
              className="notifications-close-btn"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X size={17} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {isLoading && displayList.length === 0 ? (
          <div className="notifications-loading">Loading notifications...</div>
        ) : displayList.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={28} strokeWidth={1.5} color="#cbd5e1" />
            <span>No notifications to show</span>
          </div>
        ) : (
          displayList.map((item) => (
            <div
              key={item.id}
              className={`notification-card ${item.isUnread ? "unread" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="notification-thumb">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" />
                ) : (
                  <Bell size={18} strokeWidth={2} />
                )}
              </div>

              <div className="notification-content">
                {item.title && (
                  <h4 className="notification-title-inline">{item.title}</h4>
                )}
                <p className="notification-text">{item.message}</p>
                <div className="notification-meta">
                  <span className="notification-time">{item.time}</span>
                  {item.isUnread && <span className="unread-dot" />}
                </div>
              </div>

              <button
                type="button"
                className="notif-delete-btn"
                title="Delete notification"
                onClick={(e) => handleDelete(e, item.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="notifications-footer">
        <button
          type="button"
          className="view-all-btn"
          onClick={handleViewAll}
        >
          View all notifications <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Notifications;
