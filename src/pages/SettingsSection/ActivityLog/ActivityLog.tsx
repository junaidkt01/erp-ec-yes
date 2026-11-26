import React, { useMemo, useState } from "react";
import { Globe, Terminal } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import LoadingOverlay from "../../../components/Loadingoverlay";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useFetchUserActivities,
  type UserActivityItem,
  type UserActivityFilters,
} from "../../../hooks/useUserActivities";
import { parseUserAgent } from "../../../utils/userAgentParser";
import "./ActivityLog.scss";

const ACTIVITY_TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "API Call", value: "api_call" },
  { label: "Login", value: "login" },
  { label: "Logout", value: "logout" },
];

const HTTP_METHOD_OPTIONS = [
  { label: "All Methods", value: "" },
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PUT", value: "PUT" },
  { label: "DELETE", value: "DELETE" },
];

const PER_PAGE_OPTIONS = [
  { label: "10 per page", value: 10 },
  { label: "25 per page", value: 25 },
  { label: "50 per page", value: 50 },
  { label: "100 per page", value: 100 },
];

interface FilterState {
  activity_type: string;
  method: string;
  date_from: Date | null;
  date_to: Date | null;
  search: string;
  per_page: number;
}

const initialFilterState: FilterState = {
  activity_type: "",
  method: "",
  date_from: null,
  date_to: null,
  search: "",
  per_page: 25,
};

// Date -> "YYYY-MM-DD" for API
const formatDateToApi = (date: Date | null): string | undefined => {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const ActivityLog: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [tableSearch, setTableSearch] = useState<string>("");
  const debouncedTableSearch = useDebounce(tableSearch, 400);

  // Form input state in "Select Criteria"
  const [filterForm, setFilterForm] = useState<FilterState>(initialFilterState);

  // Applied criteria state (updated on "Search" click)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilterState);

  // Popup detail modal state
  const [selectedLog, setSelectedLog] = useState<UserActivityItem | null>(null);

  // Query filters passed to GET /api/user-activities
  const queryFilters: UserActivityFilters = useMemo(() => {
    const activeSearch = debouncedTableSearch.trim() || appliedFilters.search.trim() || undefined;

    return {
      page,
      per_page: appliedFilters.per_page || 25,
      search: activeSearch,
      activity_type: appliedFilters.activity_type || undefined,
      method: appliedFilters.method || undefined,
      date_from: formatDateToApi(appliedFilters.date_from),
      date_to: formatDateToApi(appliedFilters.date_to),
    };
  }, [page, appliedFilters, debouncedTableSearch]);

  const { data: response, isLoading, isFetching } = useFetchUserActivities(queryFilters);

  // Extract raw log list
  const activityLogs: UserActivityItem[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    return [];
  }, [response]);

  // Extract total pages from Laravel pagination
  const totalPages: number = useMemo(() => {
    if (!response) return 1;
    const lastPage =
      (response as any).last_page ??
      (response as any).meta?.last_page ??
      (response as any).data?.last_page ??
      (response as any).pagination?.last_page;
    if (typeof lastPage === "number" && lastPage > 0) return lastPage;
    return 1;
  }, [response]);

  // Handle Search click
  const handleSearch = () => {
    setAppliedFilters({ ...filterForm });
    setPage(1);
  };

  // Handle Reset click
  const handleReset = () => {
    setFilterForm(initialFilterState);
    setAppliedFilters(initialFilterState);
    setTableSearch("");
    setPage(1);
  };

  // Table columns matching requested titles
  const columns: Column[] = [
    { key: "user", title: "User" },
    { key: "role", title: "Role" },
    { key: "ip_address", title: "IP Address" },
    { key: "activity", title: "Activity" },
    { key: "activity_time", title: "Activity Time" },
    { key: "user_agent", title: "User Agent" },
  ];

  // Helper for HTTP method badge class
  const getMethodClass = (m?: string, type?: string) => {
    const val = (m || type || "").toLowerCase();
    if (val.includes("get")) return "method_get";
    if (val.includes("post")) return "method_post";
    if (val.includes("put") || val.includes("patch")) return "method_put";
    if (val.includes("delete")) return "method_delete";
    if (val.includes("login")) return "method_login";
    if (val.includes("logout")) return "method_logout";
    return "";
  };

  // Helper for status code class
  const getStatusClass = (code?: number) => {
    if (!code) return "";
    if (code >= 200 && code < 300) return "status_2xx";
    if (code >= 400 && code < 500) return "status_4xx";
    if (code >= 500) return "status_5xx";
    return "";
  };

  // Helper for role badge class
  const getRoleBadgeClass = (role?: string) => {
    const r = (role || "").toLowerCase();
    if (r.includes("super-admin") || r.includes("super admin")) return "role_super_admin";
    if (r.includes("admin")) return "role_admin";
    if (r.includes("teacher")) return "role_teacher";
    if (r.includes("student")) return "role_student";
    if (r.includes("parent")) return "role_parent";
    return "";
  };

  // Format table rows
  const tableData = useMemo(() => {
    return activityLogs.map((item) => {
      const parsedUa = parseUserAgent(item.user_agent);
      const userName = item.user_name || item.user?.full_name || item.user?.name || "System";
      const userEmail = item.user_email || item.user?.email || "";
      const userPhoto = item.user?.photo;
      const roleName = item.role || item.user?.roles?.[0]?.name || "N/A";
      const methodLabel = item.method || (item.activity_type ? item.activity_type.toUpperCase() : "");

      return {
        id: item.id,
        raw: item,

        // 1. User column
        user: (
          <div className="user_cell">
            <div className="user_avatar">
              {userPhoto ? (
                <img src={userPhoto} alt={userName} />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="user_info">
              <span className="name">{userName}</span>
              {userEmail && <span className="email">{userEmail}</span>}
            </div>
          </div>
        ),

        // 2. Role column
        role: (
          <span className={`role_badge ${getRoleBadgeClass(roleName)}`}>
            {roleName.replace(/[-_]/g, " ")}
          </span>
        ),

        // 3. IP Address column
        ip_address: (
          <span className="ip_badge" title={`IP: ${item.ip_address || "N/A"}`}>
            <Globe size={12} />
            {item.ip_address || "N/A"}
          </span>
        ),

        // 4. Activity column
        activity: (
          <div className="activity_cell">
            <div className="activity_top">
              {methodLabel && (
                <span className={`method_badge ${getMethodClass(item.method, item.activity_type)}`}>
                  {methodLabel}
                </span>
              )}
              {item.status_code && (
                <span className={`status_badge ${getStatusClass(item.status_code)}`}>
                  {item.status_code}
                </span>
              )}
            </div>
            <span className="activity_desc" title={item.description || item.url || item.activity_type}>
              {item.description || item.url || item.activity_type}
            </span>
          </div>
        ),

        // 5. Activity Time column
        activity_time: (
          <div className="time_cell">
            <span className="time_primary">
              {item.time_formatted || item.time || (item.created_at ? new Date(item.created_at).toLocaleString() : "-")}
            </span>
            {item.time_ago && <span className="time_ago">{item.time_ago}</span>}
          </div>
        ),

        // 6. User Agent (which browser) column
        user_agent: (
          <div className="browser_cell" title={item.user_agent || "No User Agent data"}>
            <span className="browser_name">
              <Terminal size={13} color="#4b5563" />
              {parsedUa.browserDisplay}
            </span>
            <span className="browser_os">{parsedUa.os}</span>
          </div>
        ),
      };
    });
  }, [activityLogs]);

  return (
    <div className="page_wrapper">
      <div className="activity_log">
        {isLoading && <LoadingOverlay />}

        {/* 1. Select Criteria Filter Component inside TableWrapper */}
        <TableWrapper title="Manage Activity Log">
          <div className="search_screen">
            <p className="search_screen_title">Select Criteria</p>
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    label="Activity Type"
                    placeholder="Select activity type"
                    options={ACTIVITY_TYPE_OPTIONS}
                    value={filterForm.activity_type}
                    onChange={(val) =>
                      setFilterForm((prev) => ({ ...prev, activity_type: val }))
                    }
                  />

                  <CustomSelect
                    label="HTTP Method"
                    placeholder="Select method"
                    options={HTTP_METHOD_OPTIONS}
                    value={filterForm.method}
                    onChange={(val) =>
                      setFilterForm((prev) => ({ ...prev, method: val }))
                    }
                  />

                  <CustomSelect
                    label="Records Per Page"
                    placeholder="Select per page"
                    options={PER_PAGE_OPTIONS}
                    value={filterForm.per_page}
                    onChange={(val) =>
                      setFilterForm((prev) => ({ ...prev, per_page: val }))
                    }
                  />
                </div>

                <div className="body_section">
                  <InputField
                    type="date"
                    label="Date From"
                    placeHolder="Select start date"
                    value={filterForm.date_from}
                    onChange={(date: Date | null) =>
                      setFilterForm((prev) => ({ ...prev, date_from: date }))
                    }
                  />

                  <InputField
                    type="date"
                    label="Date To"
                    placeHolder="Select end date"
                    value={filterForm.date_to}
                    onChange={(date: Date | null) =>
                      setFilterForm((prev) => ({ ...prev, date_to: date }))
                    }
                  />

                  <InputField
                    type="text"
                    label="Search (Name / Email / IP / URL)"
                    placeHolder="Enter search query"
                    value={filterForm.search}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFilterForm((prev) => ({ ...prev, search: val }));
                    }}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Reset" onClick={handleReset} />
                <PrimaryButton
                  isLoading={isFetching}
                  title="Search"
                  onClick={handleSearch}
                />
              </div>
            </div>
          </div>
        </TableWrapper>

        {/* 2. Results DataTable inside TableWrapper */}
        <TableWrapper
          isSearchBar
          searchValue={tableSearch}
          searchOnchange={(val: string) => {
            setTableSearch(val);
            setPage(1);
          }}
          title="Activity Log List"
        >
          <DataTable
            columns={columns}
            data={tableData}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p: number) => setPage(p)}
            emptyMessage={
              isLoading ? "Loading activity logs..." : "No user activity records found"
            }
            actions={(row: any) => (
              <div className="actions">
                <button
                  type="button"
                  className="hvr_zm_out"
                  title="View Details"
                  onClick={() => setSelectedLog(row.raw)}
                >
                  <img src="/svgs/eye_open.svg" alt="View" />
                </button>
              </div>
            )}
          />
        </TableWrapper>

        {/* View Details Popup Screen */}
        {selectedLog && (
          <PopupScreen
            title={`Activity Log Details #${selectedLog.id}`}
            onClick={() => setSelectedLog(null)}
          >
            <div className="activity_details_modal">
              {/* User Details */}
              <div className="details_section">
                <div className="section_title">User Information</div>
                <div className="detail_grid">
                  <div className="detail_row">
                    <span className="detail_label">User Name</span>
                    <span className="detail_value">
                      {selectedLog.user_name ||
                        selectedLog.user?.name ||
                        "System / Unauthenticated"}
                    </span>
                  </div>
                  <div className="detail_row">
                    <span className="detail_label">Email</span>
                    <span className="detail_value">
                      {selectedLog.user_email || selectedLog.user?.email || "N/A"}
                    </span>
                  </div>
                  <div className="detail_row">
                    <span className="detail_label">Role</span>
                    <span className="detail_value">
                      <span
                        className={`role_badge ${getRoleBadgeClass(
                          selectedLog.role || selectedLog.user?.roles?.[0]?.name
                        )}`}
                      >
                        {selectedLog.role ||
                          selectedLog.user?.roles?.[0]?.name ||
                          "N/A"}
                      </span>
                    </span>
                  </div>
                  <div className="detail_row">
                    <span className="detail_label">User ID</span>
                    <span className="detail_value">
                      {selectedLog.user_id ?? "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Info */}
              <div className="details_section">
                <div className="section_title">Activity & Request</div>
                <div className="detail_grid">
                  <div className="detail_row">
                    <span className="detail_label">Activity Type</span>
                    <span className="detail_value">
                      {selectedLog.activity_type}
                    </span>
                  </div>
                  <div className="detail_row">
                    <span className="detail_label">HTTP Method / Status</span>
                    <span className="detail_value">
                      {selectedLog.method && (
                        <span
                          className={`method_badge ${getMethodClass(
                            selectedLog.method,
                            selectedLog.activity_type
                          )}`}
                        >
                          {selectedLog.method}
                        </span>
                      )}
                      {selectedLog.status_code && (
                        <span
                          className={`status_badge ${getStatusClass(
                            selectedLog.status_code
                          )}`}
                          style={{ marginLeft: "6px" }}
                        >
                          {selectedLog.status_code}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail_row full_width">
                    <span className="detail_label">Description</span>
                    <span className="detail_value">
                      {selectedLog.description || "N/A"}
                    </span>
                  </div>
                  {selectedLog.url && (
                    <div className="detail_row full_width">
                      <span className="detail_label">Target URL</span>
                      <span className="detail_value mono">
                        {selectedLog.url}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client & Device Info */}
              <div className="details_section">
                <div className="section_title">Client & Browser Details</div>
                <div className="detail_grid">
                  <div className="detail_row">
                    <span className="detail_label">IP Address</span>
                    <span className="detail_value mono">
                      {selectedLog.ip_address || "N/A"}
                    </span>
                  </div>
                  <div className="detail_row">
                    <span className="detail_label">Activity Time</span>
                    <span className="detail_value">
                      {selectedLog.time_formatted ||
                        selectedLog.time ||
                        selectedLog.created_at}
                      {selectedLog.time_ago && ` (${selectedLog.time_ago})`}
                    </span>
                  </div>
                  <div className="detail_row">
                    <span className="detail_label">Detected Browser</span>
                    <span className="detail_value">
                      {parseUserAgent(selectedLog.user_agent).browser}{" "}
                      {parseUserAgent(selectedLog.user_agent).browserVersion || ""}
                    </span>
                  </div>
                  <div className="detail_row">
                    <span className="detail_label">Operating System</span>
                    <span className="detail_value">
                      {parseUserAgent(selectedLog.user_agent).os}
                    </span>
                  </div>
                  <div className="detail_row full_width">
                    <span className="detail_label">Full User Agent String</span>
                    <span className="detail_value mono">
                      {selectedLog.user_agent || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Request Payload */}
              {selectedLog.request_payload && (
                <div className="details_section">
                  <div className="section_title">Request Payload</div>
                  <pre className="payload_box">
                    {typeof selectedLog.request_payload === "object"
                      ? JSON.stringify(selectedLog.request_payload, null, 2)
                      : String(selectedLog.request_payload)}
                  </pre>
                </div>
              )}
            </div>
          </PopupScreen>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
