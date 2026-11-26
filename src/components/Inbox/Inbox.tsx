import React, { useState, useRef, useEffect } from "react";
import { X, Check, User } from "lucide-react";
import "./Inbox.scss";

export interface InboxItem {
  id: string | number;
  sender: string;
  role: "Student" | "Teacher" | "Parents" | "Staffs";
  message: string;
  time: string;
  isUnread?: boolean;
  avatar?: string | null;
}

export interface InboxProps {
  onClose?: () => void;
  items?: InboxItem[];
  onMarkAllAsRead?: () => void;
  onItemClick?: (item: InboxItem) => void;
  className?: string;
  isStandalone?: boolean;
}

const DEFAULT_INBOX_ITEMS: InboxItem[] = [
  {
    id: 1,
    sender: "Rohith Sharma",
    role: "Teacher",
    message: "Lorem Ipsum is simply dummy text of the printing an...",
    time: "10:40 AM",
    isUnread: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  },
  {
    id: 2,
    sender: "Virat Kohli",
    role: "Teacher",
    message: "Lorem Ipsum is simply dummy text of the printing an...",
    time: "10:40 AM",
    isUnread: false,
    avatar: null, // Renders the exact user silhouette avatar from the screenshot
  },
  {
    id: 3,
    sender: "Rohith Sharma",
    role: "Teacher",
    message: "Lorem Ipsum is simply dummy text of the printing an...",
    time: "10:40 AM",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
  },
  {
    id: 4,
    sender: "Rohith Sharma",
    role: "Student",
    message: "Lorem Ipsum is simply dummy text of the printing an...",
    time: "10:40 AM",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
  },
  {
    id: 5,
    sender: "Rohith Sharma",
    role: "Parents",
    message: "Lorem Ipsum is simply dummy text of the printing an...",
    time: "10:40 AM",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=faces",
  },
  {
    id: 6,
    sender: "Rohith Sharma",
    role: "Staffs",
    message: "Lorem Ipsum is simply dummy text of the printing an...",
    time: "10:40 AM",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
  },
  {
    id: 7,
    sender: "Rohith Sharma",
    role: "Teacher",
    message: "Lorem Ipsum is simply dummy text of the printing an...",
    time: "10:40 AM",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
  },
  {
    id: 8,
    sender: "Rohith Sharma",
    role: "Staffs",
    message: "Lorem Ipsum is simply dummy text of the printing an...",
    time: "10:40 AM",
    isUnread: false,
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=faces",
  },
];

type FilterCategory = "Unread" | "Student" | "Teacher" | "Parents" | "Staffs";

export const Inbox: React.FC<InboxProps> = ({
  onClose,
  items = DEFAULT_INBOX_ITEMS,
  onMarkAllAsRead,
  onItemClick,
  className = "",
  isStandalone = false,
}) => {
  const [inboxList, setInboxList] = useState<InboxItem[]>(items);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // In the reference image, "Teacher" is initially checked
  const [selectedFilters, setSelectedFilters] = useState<FilterCategory[]>(["Teacher"]);

  const popoverRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);

  // Close filter popover on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleMarkAllRead = () => {
    setInboxList((prev) =>
      prev.map((item) => ({ ...item, isUnread: false }))
    );
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleItemClick = (item: InboxItem) => {
    setInboxList((prev) =>
      prev.map((msg) => (msg.id === item.id ? { ...msg, isUnread: false } : msg))
    );
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const toggleFilter = (category: FilterCategory) => {
    setSelectedFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Filter messages based on active filters
  const filteredList = inboxList.filter((item) => {
    const isUnreadFilter = selectedFilters.includes("Unread");
    const roleFilters = selectedFilters.filter((f) => f !== "Unread") as Array<
      "Student" | "Teacher" | "Parents" | "Staffs"
    >;

    if (isUnreadFilter && !item.isUnread) {
      return false;
    }

    if (roleFilters.length > 0 && !roleFilters.includes(item.role)) {
      return false;
    }

    return true;
  });

  const filterOptions: FilterCategory[] = [
    "Unread",
    "Student",
    "Teacher",
    "Parents",
    "Staffs",
  ];

  return (
    <div
      className={`inbox-dropdown ${isStandalone ? "standalone" : ""} ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="inbox-header">
        <div className="inbox-header-left">
          <h2 className="inbox-title">Inbox</h2>
          <button
            type="button"
            className="mark-all-read-btn"
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </button>
        </div>

        <div className="inbox-header-right">
          {/* Filter button with three tapering lines */}
          <button
            ref={filterBtnRef}
            type="button"
            className={`inbox-filter-btn ${isFilterOpen ? "active" : ""}`}
            onClick={() => setIsFilterOpen((prev) => !prev)}
            aria-label="Filter inbox"
            title="Filter messages"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="3" y1="5" x2="17" y2="5" stroke="#605dec" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="10" x2="14" y2="10" stroke="#605dec" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="15" x2="11" y2="15" stroke="#605dec" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {onClose && (
            <button
              type="button"
              className="inbox-close-btn"
              onClick={onClose}
              aria-label="Close inbox"
            >
              <X size={18} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Filter Popover Dropdown */}
        {isFilterOpen && (
          <div ref={popoverRef} className="inbox-filter-popover">
            <h3 className="filter-heading">Filter</h3>
            <div className="filter-divider" />
            <div className="filter-options-list">
              {filterOptions.map((opt) => {
                const isChecked = selectedFilters.includes(opt);
                return (
                  <div
                    key={opt}
                    className="filter-option-item"
                    onClick={() => toggleFilter(opt)}
                  >
                    <span className="filter-label">{opt}</span>
                    <div className={`filter-checkbox ${isChecked ? "checked" : ""}`}>
                      {isChecked && <Check className="check-icon" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="inbox-list">
        {filteredList.length === 0 ? (
          <div className="inbox-empty">No messages found</div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className={`inbox-card ${item.isUnread ? "unread" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="inbox-avatar">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.sender}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={22} />
                  </div>
                )}
              </div>

              <div className="inbox-content">
                <div className="inbox-card-top">
                  <span className="inbox-sender-name">{item.sender}</span>
                  <span className="inbox-time">{item.time}</span>
                </div>
                <p className="inbox-snippet">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inbox;
