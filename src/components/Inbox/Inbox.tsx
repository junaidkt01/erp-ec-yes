import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X, Check, User, Trash2, ArrowRight, RotateCw } from "lucide-react";
import {
  useFetchAllMessages,
  useDeleteMessage,
} from "../../hooks/useMessages";
import "./Inbox.scss";

export interface InboxItem {
  id: string | number;
  sender: string;
  role: "Student" | "Teacher" | "Parents" | "Staffs";
  message: string;
  time: string;
  isUnread?: boolean;
  avatar?: string | null;
  raw?: any;
}

export interface InboxProps {
  onClose?: () => void;
  items?: InboxItem[];
  onMarkAllAsRead?: () => void;
  onItemClick?: (item: InboxItem) => void;
  className?: string;
  isStandalone?: boolean;
}

type FilterCategory = "Unread" | "Student" | "Teacher" | "Parents" | "Staffs";

const formatMessageTime = (dateStr?: string): string => {
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
    if (diffHours < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const Inbox: React.FC<InboxProps> = ({
  onClose,
  items,
  onMarkAllAsRead,
  onItemClick,
  className = "",
  isStandalone = false,
}) => {
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: apiData, isLoading, refetch, isFetching } = useFetchAllMessages({ per_page: 25 });
  const deleteMutation = useDeleteMessage();

  // Local state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterCategory[]>([]);
  const [readIds, setReadIds] = useState<Set<string | number>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string | number>>(new Set());
  const [allMarkedRead, setAllMarkedRead] = useState(false);

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

  // Parse items from API or fallback
  const parsedItems = useMemo<InboxItem[]>(() => {
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

      const rawRole = item.sender?.role?.name || item.sender?.role || "Staffs";
      let normalizedRole: "Student" | "Teacher" | "Parents" | "Staffs" = "Staffs";
      if (rawRole.includes("Teach")) normalizedRole = "Teacher";
      else if (rawRole.includes("Stud")) normalizedRole = "Student";
      else if (rawRole.includes("Parent")) normalizedRole = "Parents";

      return {
        id: item.id,
        sender: item.sender?.name || item.sender?.full_name || `User #${item.sender_id}`,
        role: normalizedRole,
        message: item.message || "",
        time: formatMessageTime(item.created_at || item.updated_at),
        isUnread: Boolean(isUnread),
        avatar: item.sender?.photo || null,
        raw: item,
      };
    });
  }, [apiData, items]);

  // Apply local modifications
  const displayList = useMemo(() => {
    return parsedItems
      .filter((n) => !deletedIds.has(n.id))
      .map((n) => {
        if (allMarkedRead || readIds.has(n.id)) {
          return { ...n, isUnread: false };
        }
        return n;
      });
  }, [parsedItems, deletedIds, readIds, allMarkedRead]);

  // Filter messages based on active filters
  const filteredList = useMemo(() => {
    if (selectedFilters.length === 0) return displayList;

    return displayList.filter((item) => {
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
  }, [displayList, selectedFilters]);

  const hasUnread = useMemo(() => {
    return displayList.some((n) => n.isUnread);
  }, [displayList]);

  const handleMarkAllRead = () => {
    setAllMarkedRead(true);
    setReadIds(new Set(displayList.map((n) => n.id)));
    toast.success("All messages marked as read");
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleItemClick = (item: InboxItem) => {
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
      toast.success("Message removed");
    } catch {
      toast.success("Message removed");
    }
  };

  const toggleFilter = (category: FilterCategory) => {
    setSelectedFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleViewAll = () => {
    if (onClose) {
      onClose();
    }
    navigate("/messages");
  };

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
            disabled={!hasUnread}
          >
            Mark all as read
          </button>
        </div>

        <div className="inbox-header-right">
          <button
            type="button"
            className="refresh-btn"
            title="Refresh"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RotateCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>

          {/* Filter button */}
          <button
            ref={filterBtnRef}
            type="button"
            className={`inbox-filter-btn ${isFilterOpen || selectedFilters.length > 0 ? "active" : ""}`}
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
        {isLoading && displayList.length === 0 ? (
          <div className="inbox-loading">Loading messages...</div>
        ) : filteredList.length === 0 ? (
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

              <button
                type="button"
                className="inbox-delete-btn"
                title="Delete message"
                onClick={(e) => handleDelete(e, item.id)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="inbox-footer">
        <button
          type="button"
          className="view-all-btn"
          onClick={handleViewAll}
        >
          View all messages <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Inbox;
