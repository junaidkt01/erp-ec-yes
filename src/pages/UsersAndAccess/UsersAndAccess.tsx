import { useMemo, useState } from "react";
import { toast } from "sonner";
import TableWrapper from "../../components/TableWrapper";
import PopupScreen from "../../components/PopupScreen/PopupScreen";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import { highlightText } from "../../utils/utils";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearchUsers } from "../../hooks/useSearchUsers";
import { useDeleteRole, useFetchAllUsers, useFetchRolesAndAccess, type Role } from "../../hooks/useRolesAndAccess";
import { useTranslation } from "../../i18n/LanguageContext";
import DataTable, { type Column } from "../../components/DataTable/DataTable";
import { AddRolePopup, EditRolePermissionsPopup, ViewRolePermissionsPopup } from "./RolePermissionPopups";
import RoleAccessToggle, { type RoleType } from "../../components/RoleAccessToggle";
import { UserPermissions } from "./UserPermissions/UserPermissions";
import axiosInstance from "../../api/axiosInstance";
import "./UsersAndAccess.scss";

export const UsersAndAccess = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { t } = useTranslation();

    const debouncedSearch = useDebounce(searchTerm, 400);
    const { data: searchData, isLoading: isSearchLoading } = useSearchUsers(debouncedSearch);

    // Selected user for Custom Role view
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUserMeta, setSelectedUserMeta] = useState<{
        name?: string;
        email?: string;
        details?: string;
        type?: string;
    } | null>(null);
    const [isResolvingUser, setIsResolvingUser] = useState(false);

    // Default vs Custom role view toggle
    const [roleType, setRoleType] = useState<RoleType>("default");

    // Resolve accurate user_id from various search result item types
    const resolveUserId = async (item: any): Promise<number | null> => {
        if (item.user_id) return Number(item.user_id);
        if (item.user?.id) return Number(item.user.id);

        if (item.type === "Student" && item.student_id) {
            try {
                const res = await axiosInstance.get(`/students/${item.student_id}`);
                const s = res.data?.data ?? res.data;
                if (s?.user_id) return Number(s.user_id);
            } catch (e) {
                console.warn("Could not resolve student user_id", e);
            }
        }

        if ((item.type === "Staff" || item.type === "Teacher") && item.staff_id) {
            try {
                const res = await axiosInstance.get(`/staff/${item.staff_id}`);
                const st = res.data?.data ?? res.data;
                if (st?.user_id) return Number(st.user_id);
            } catch (e) {
                console.warn("Could not resolve staff user_id", e);
            }
        }

        if (item.id && !item.student_id && !item.staff_id) {
            return Number(item.id);
        }

        return item.id ? Number(item.id) : null;
    };

    const handleSearchResultClick = async (item: any) => {
        setSearchTerm("");
        setIsResolvingUser(true);
        try {
            const resolvedId = await resolveUserId(item);
            if (!resolvedId) {
                toast.error("Could not find a valid user account for this record.");
                return;
            }
            setSelectedUserId(resolvedId);
            setSelectedUserMeta({
                name: item.name || item.full_name,
                email: item.email || (item.details && item.details.includes("@") ? item.details : undefined),
                details: item.details,
                type: item.type,
            });
        } catch (e) {
            toast.error("Failed to select user.");
        } finally {
            setIsResolvingUser(false);
        }
    };

    const SearchResults = () => {
        if (!searchTerm) return null;

        return (
            <div className={`header_selection_bar ${searchTerm ? "has" : ""}`}>
                {isSearchLoading ? (
                    <div className="selection_item">
                        <p className="details">Searching users...</p>
                    </div>
                ) : !searchData?.data?.length ? (
                    <div className="selection_item">
                        <p className="details">No users found for "{searchTerm}"</p>
                    </div>
                ) : (
                    searchData.data.map((item: any, i: number) => (
                        <div
                            key={item.id ?? i}
                            className="selection_item"
                            onClick={() => handleSearchResultClick(item)}
                        >
                            <img src="/header_icons/profile_pic.png" alt="" />
                            <div className="selection_details">
                                <p className="name">
                                    {highlightText(item.name || item.full_name || "User", searchTerm)}
                                </p>
                                <p className="details">
                                    {item.type ? `[${item.type}] ` : ""}
                                    {highlightText(item.details || item.email || "", searchTerm)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    // Default Roles management table
    const { data, isLoading, isError } = useFetchRolesAndAccess();
    const deleteRoleMutation = useDeleteRole();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
    const [viewTarget, setViewTarget] = useState<Role | null>(null);
    const [permissionsTarget, setPermissionsTarget] = useState<Role | null>(null);

    const handleCancelDelete = () => {
        if (!deleteRoleMutation.isPending) setDeleteTarget(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteRoleMutation.mutateAsync(deleteTarget.id);
            toast.success("Role deleted successfully");
            setDeleteTarget(null);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete role"
            );
        }
    };

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "roles", title: "Roles" },
        { key: "users", title: "Users" },
        { key: "permissions", title: "Permissions" },
    ];

    const tableData = useMemo(
        () =>
            (data?.data ?? []).map((r, i) => ({
                id: r.id,
                sl: i + 1,
                roles: r.display_name || r.name,
                users: r.users_count ?? 0,
                permissions: r.permissions?.length ?? 0,
                raw: r,
            })),
        [data]
    );


    const { data: usersData, isLoading: isUsersLoading, isError: isUsersError } = useFetchAllUsers();

    const usersColumns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "full_name", title: "Full Name" },
        { key: "email", title: "Email" },
        { key: "roles", title: "Roles" },
    ];

    const [userSearch, setUserSearch] = useState("");

    const users = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        return (usersData ?? [])
            .map((u) => ({
                id: u.id,
                full_name: u.full_name || u.name,
                email: u.email,
                roles: u.roles?.map((r) => r.name).join(", ") || "-",
                raw: u,
            }))
            .filter(
                (u) =>
                    !q ||
                    u.full_name?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q) ||
                    u.roles.toLowerCase().includes(q)
            )
            .map((u, i) => ({ ...u, sl: i + 1 }));
    }, [usersData, userSearch]);

    const usersEmptyMessage = isUsersLoading
        ? "Loading users..."
        : isUsersError
            ? "Failed to load users"
            : userSearch
                ? `No users found for "${userSearch}"`
                : "No users found";

    const emptyMessage = isLoading
        ? "Loading roles..."
        : isError
            ? "Failed to load roles"
            : "No roles found";

    return (
        <div className="page_wrapper">
            <div className="users_and_access_page">
                {/* Header Controls: Toggle between Default role and Custom role, with user search when in Custom mode */}
                <div className="header_wrapper">
                    <div className="header">
                        <RoleAccessToggle value={roleType} onChange={setRoleType} />

                        {/* {roleType === "custom" && (
                            <div className="search_selection_wrapper hvr_zm_in">
                                <div className={`search_bar_wrapper ${searchTerm ? "has" : ""}`}>
                                    <div className="search_bar">
                                        <span className="search_icon">
                                            <img src="/header_icons/search_icon.svg" alt="search" />
                                        </span>
                                        <input
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            value={searchTerm}
                                            type="text"
                                            placeholder={t(
                                                "header.search_placeholder",
                                                "Search user by name, email, admission..."
                                            )}
                                        />
                                    </div>
                                    <div className="search_sort_close">
                                        {searchTerm && (
                                            <span
                                                className="search_icon"
                                                onClick={() => setSearchTerm("")}
                                            >
                                                <img src="/header_icons/search_close.svg" alt="clear" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <SearchResults />
                            </div>
                        )} */}

                    </div>
                </div>

                {/* 1. Default Role View: Full existing Roles management table */}
                {roleType === "default" ? (
                    <TableWrapper
                        title="Users and Access"
                        addButtonTitle="Add Role"
                        isAddButton
                        onClick={() => setIsAddOpen(true)}
                    >
                        <DataTable
                            columns={columns}
                            data={tableData}
                            currentPage={1}
                            totalPages={1}
                            onPageChange={() => { }}
                            emptyMessage={emptyMessage}
                            actions={(row) => (
                                <div className="actions">
                                    <button
                                        onClick={() => setViewTarget(row.raw)}
                                        title="View permissions"
                                    >
                                        <img src="/svgs/eye_open.svg" alt="View" />
                                    </button>
                                    <button
                                        onClick={() => setPermissionsTarget(row.raw)}
                                        title="Edit permissions"
                                    >
                                        <img src="/svgs/edit.svg" alt="Edit" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(row.raw)}
                                        title="Delete role"
                                    >
                                        <img src="/svgs/delete.svg" alt="Delete" />
                                    </button>
                                </div>
                            )}
                        />
                    </TableWrapper>
                ) : (
                    /* 2. Custom Role View: User specific roles & permissions management */
                    <div className="custom_role_view">
                        {isResolvingUser ? (
                            <div className="user_permissions_container">
                                <div className="custom_role_empty_state">
                                    <p>Resolving user account details...</p>
                                </div>
                            </div>
                        ) : selectedUserId ? (
                            <UserPermissions
                                key={selectedUserId}
                                userId={selectedUserId}
                                fallbackUser={selectedUserMeta || undefined}
                            />
                        ) : (
                            <TableWrapper
                                isSearchBar
                                title="Users and Access"
                                searchValue={userSearch}
                                searchOnchange={setUserSearch}
                            >
                                <DataTable
                                    columns={usersColumns}
                                    data={users}
                                    currentPage={1}
                                    totalPages={1}
                                    onPageChange={() => { }}
                                    emptyMessage={usersEmptyMessage}
                                    actions={(row) => (
                                        <div className="actions">
                                            <button
                                                onClick={() => {
                                                    setSelectedUserId(row.raw.id);
                                                    setSelectedUserMeta({
                                                        name: row.raw.full_name || row.raw.name,
                                                        email: row.raw.email,
                                                    });
                                                }}
                                                title="Manage permissions"
                                            >
                                                <img src="/svgs/edit.svg" alt="Edit" />
                                            </button>
                                        </div>
                                    )}
                                />
                            </TableWrapper>
                            // <div className="user_permissions_container">
                            //     <div className="custom_role_empty_state">
                            //         <img src="/header_icons/search_icon.svg" alt="Search" />
                            //         <h3>Search & Select a User</h3>
                            //         <p>
                            //             Use the search bar above to select a student, staff member, or user
                            //             to view and configure their customized roles and direct permissions.
                            //         </p>
                            //     </div>
                            // </div>
                        )}
                    </div>
                )}

                {/* Popups for Default Role view */}
                {viewTarget && (
                    <ViewRolePermissionsPopup
                        role={viewTarget}
                        onClose={() => setViewTarget(null)}
                    />
                )}

                {permissionsTarget && (
                    <EditRolePermissionsPopup
                        role={permissionsTarget}
                        onClose={() => setPermissionsTarget(null)}
                    />
                )}

                {isAddOpen && (
                    <AddRolePopup onClose={() => setIsAddOpen(false)} />
                )}

                {/* Delete Confirmation Popup */}
                {deleteTarget && (
                    <PopupScreen title="Delete Role" onClick={handleCancelDelete}>
                        <div className="popup_body">
                            <div className="body_section">
                                <p>
                                    Are you sure you want to delete role{" "}
                                    <strong>"{deleteTarget.display_name || deleteTarget.name}"</strong>?
                                </p>
                                {!!deleteTarget.users_count && (
                                    <p>
                                        {deleteTarget.users_count} user(s) currently have this role.
                                    </p>
                                )}
                            </div>

                            <div className="buttons">
                                <SecondaryButton
                                    onClick={handleCancelDelete}
                                    title="Cancel"
                                    disable={deleteRoleMutation.isPending}
                                />
                                <PrimaryButton
                                    onClick={handleConfirmDelete}
                                    disabled={deleteRoleMutation.isPending}
                                    isLoading={deleteRoleMutation.isPending}
                                    title={deleteRoleMutation.isPending ? "Deleting..." : "Delete"}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}
            </div>
        </div>
    );
};

export default UsersAndAccess;
