import React, { useState } from "react";
import { X } from "lucide-react";
import "./Notifications.scss";

export interface NotificationItem {
  id: string | number;
  message: string;
  time: string;
  isUnread?: boolean;
  thumbnail?: string;
}

export interface NotificationsProps {
  onClose?: () => void;
  items?: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onItemClick?: (item: NotificationItem) => void;
  className?: string;
  isStandalone?: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    message: "Student Aarav Sharma was marked absent. Please review the attendance summary.",
    time: "Today 10:40 AM",
    isUnread: true,
  },
  {
    id: 2,
    message: "Homework uploaded for Class 5A",
    time: "20 July 10:10 PM",
    isUnread: false,
  },
  {
    id: 3,
    message: "Homework uploaded for Class 5A",
    time: "20 July 10:10 PM",
    isUnread: false,
  },
  {
    id: 4,
    message: "Homework uploaded for Class 5A",
    time: "20 July 10:10 PM",
    isUnread: false,
  },
  {
    id: 5,
    message: "Homework uploaded for Class 5A",
    time: "20 July 10:10 PM",
    isUnread: false,
  },
  {
    id: 6,
    message: "Homework uploaded for Class 5A",
    time: "20 July 10:10 PM",
    isUnread: false,
  },
  {
    id: 7,
    message: "Homework uploaded for Class 5A",
    time: "20 July 10:10 PM",
    isUnread: false,
  },
  {
    id: 8,
    message: "Homework uploaded for Class 5A",
    time: "20 July 10:10 PM",
    isUnread: false,
  },
  {
    id: 9,
    message: "Homework uploaded for Class 5A",
    time: "20 July 10:10 PM",
    isUnread: false,
  },
];

export const Notifications: React.FC<NotificationsProps> = ({
  onClose,
  items = DEFAULT_NOTIFICATIONS,
  onMarkAllAsRead,
  onItemClick,
  className = "",
  isStandalone = false,
}) => {
  const [notificationList, setNotificationList] = useState<NotificationItem[]>(items);

  const handleMarkAllRead = () => {
    setNotificationList((prev) =>
      prev.map((item) => ({ ...item, isUnread: false }))
    );
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
    );
    if (onItemClick) {
      onItemClick(item);
    }
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
          >
            Mark all as read
          </button>
        </div>
        {onClose && (
          <button
            type="button"
            className="notifications-close-btn"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <X size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notificationList.length === 0 ? (
          <div className="notifications-empty">No notifications</div>
        ) : (
          notificationList.map((item) => (
            <div
              key={item.id}
              className={`notification-card ${item.isUnread ? "unread" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="notification-thumb">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" />
                ) : null}
              </div>
              <div className="notification-content">
                <p className="notification-text">{item.message}</p>
                <span className="notification-time">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
