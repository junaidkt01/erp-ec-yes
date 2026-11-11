// src/pages/UsersAndAccess/UserPermissions/UserPermissions.tsx

import React, { useMemo } from "react";
import {
  useFetchUserAccess,
  normalizeRoleNames,
  normalizePermissionNames,
} from "../../../hooks/useRolesAndAccess";
import { UserRolesSection } from "./UserRolesSection";
import { DirectPermissionsSection } from "./DirectPermissionsSection";
import "./UserPermissions.scss";

interface UserPermissionsProps {
  userId: number;
  fallbackUser?: {
    name?: string;
    email?: string;
    details?: string;
    type?: string;
  };
}

export const UserPermissions: React.FC<UserPermissionsProps> = ({
  userId,
  fallbackUser,
}) => {
  const {
    data: userAccessData,
    isLoading,
    isError,
    refetch,
  } = useFetchUserAccess(userId);

  // Extracted user details
  const userName =
    userAccessData?.user?.name ||
    fallbackUser?.name ||
    `User #${userId}`;

  const userEmail =
    userAccessData?.user?.email ||
    fallbackUser?.email ||
    (fallbackUser?.details && fallbackUser.details.includes("@")
      ? fallbackUser.details
      : null);

  const assignedRoles = useMemo(
    () => normalizeRoleNames(userAccessData?.roles),
    [userAccessData?.roles]
  );

  const directPermissions = useMemo(
    () => normalizePermissionNames(userAccessData?.direct_permissions),
    [userAccessData?.direct_permissions]
  );

  const allPermissions = useMemo(
    () => normalizePermissionNames(userAccessData?.all_permissions),
    [userAccessData?.all_permissions]
  );

  const userInitials = useMemo(() => {
    if (!userName) return "U";
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  }, [userName]);

  if (isLoading) {
    return (
      <div className="user_permissions_container">
        <div className="custom_role_empty_state">
          <p>Loading user permissions and roles...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="user_permissions_container">
        <div className="custom_role_empty_state">
          <h3>Failed to load user permissions</h3>
          <p>
            An error occurred while fetching roles and permissions for this user.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              backgroundColor: "#2950DA",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user_permissions_container">
      {/* 1. User Information Card */}
      <div className="user_info_card">
        <div className="user_info_left">
          <div className="user_avatar">{userInitials}</div>

          <div className="user_details">
            <div className="user_name_row">
              <h2>{userName}</h2>
              <span className="user_id_badge">ID: #{userId}</span>
              {fallbackUser?.type && (
                <span className="user_id_badge" style={{ backgroundColor: "#EEF2FF", color: "#2950DA" }}>
                  {fallbackUser.type}
                </span>
              )}
            </div>
            {userEmail && <p className="user_email">{userEmail}</p>}
          </div>
        </div>

        <div className="user_info_roles">
          <span className="roles_label">Currently Assigned Roles</span>
          <div className="roles_pills">
            {assignedRoles.length === 0 ? (
              <span className="no_roles_pill">No roles assigned</span>
            ) : (
              assignedRoles.map((r) => (
                <span key={r} className="role_pill">
                  {r}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Content Card containing Roles & Permissions Sections */}
      <div className="permissions_content_card">
        {/* Roles Assignment */}
        <UserRolesSection
          userId={userId}
          assignedRoles={assignedRoles}
        />

        {/* Direct & Effective Permissions Assignment */}
        <DirectPermissionsSection
          userId={userId}
          directPermissions={directPermissions}
          allPermissions={allPermissions}
        />
      </div>
    </div>
  );
};

