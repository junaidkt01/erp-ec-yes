// src/pages/UsersAndAccess/UserPermissions/DirectPermissionsSection.tsx

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import InputCheckbox from "../../../components/InputCheckbox/InputCheckbox";
import {
  useFetchAllPermissions,
  useAssignUserPermissions,
  type Permission,
} from "../../../hooks/useRolesAndAccess";

interface DirectPermissionsSectionProps {
  userId: number;
  directPermissions: string[]; // only direct permissions
  allPermissions: string[]; // effective permissions (read-only)
  onPermissionsUpdated?: (newPermissions: string[]) => void;
}

export const DirectPermissionsSection: React.FC<DirectPermissionsSectionProps> = ({
  userId,
  directPermissions,
  allPermissions,
  onPermissionsUpdated,
}) => {
  const {
    data: systemPermissions = [],
    isLoading: isPermissionsLoading,
    isError: isPermissionsError,
  } = useFetchAllPermissions();

  const assignPermissionsMutation = useAssignUserPermissions();

  // Local state for direct permissions search & selection
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    () => new Set(directPermissions)
  );

  // Sync only when directPermissions or userId changes from outside
  useEffect(() => {
    setSelectedPermissions(new Set(directPermissions));
  }, [directPermissions, userId]);

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permName)) {
        next.delete(permName);
      } else {
        next.add(permName);
      }
      return next;
    });
  };

  // Filtered system permissions based on user search
  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) return systemPermissions;
    const q = searchTerm.trim().toLowerCase();
    return systemPermissions.filter((p: Permission) =>
      p.name.toLowerCase().includes(q)
    );
  }, [systemPermissions, searchTerm]);

  // Handle Select All / Deselect All for visible/filtered items
  const handleToggleSelectAll = () => {
    const allFilteredSelected = filteredPermissions.every((p) =>
      selectedPermissions.has(p.name)
    );

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        // Deselect all currently filtered
        filteredPermissions.forEach((p) => next.delete(p.name));
      } else {
        // Select all currently filtered
        filteredPermissions.forEach((p) => next.add(p.name));
      }
      return next;
    });
  };

  const handleReset = () => {
    setSelectedPermissions(new Set(directPermissions));
  };

  const isDirty = useMemo(() => {
    if (selectedPermissions.size !== directPermissions.length) return true;
    for (const p of directPermissions) {
      if (!selectedPermissions.has(p)) return true;
    }
    return false;
  }, [selectedPermissions, directPermissions]);

  const handleSavePermissions = async () => {
    const permissionsArray = Array.from(selectedPermissions);
    try {
      await assignPermissionsMutation.mutateAsync({
        id: userId,
        permissions: permissionsArray,
      });
      toast.success("Direct permissions updated successfully");
      onPermissionsUpdated?.(permissionsArray);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user permissions";
      toast.error(errorMsg);
    }
  };

  // Effective permissions set for fast lookup
  const directSet = useMemo(() => new Set(directPermissions), [directPermissions]);

  return (
    <>
      {/* 1. Direct Permissions Management Section */}
      <div className="section_card">
        <div className="section_header">
          <div className="section_title_box">
            <h3>
              Direct Permissions
              <span className="count_badge">
                {selectedPermissions.size} selected
              </span>
            </h3>
            <p>
              Assign permissions directly to this user (independent of role
              permissions)
            </p>
          </div>

          <div className="section_actions">
            <SecondaryButton
              title="Reset"
              onClick={handleReset}
              disable={!isDirty || assignPermissionsMutation.isPending}
            />
            <PrimaryButton
              title={
                assignPermissionsMutation.isPending
                  ? "Saving..."
                  : "Save Permissions"
              }
              onClick={handleSavePermissions}
              disabled={assignPermissionsMutation.isPending || !isDirty}
              isLoading={assignPermissionsMutation.isPending}
            />
          </div>
        </div>

        {/* Search & Bulk Select Toolbar */}
        <div className="toolbar_row">
          <div className="filter_input_box">
            <img
              src="/header_icons/search_icon.svg"
              alt="Search"
              className="search_icon"
            />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredPermissions.length > 0 && (
            <button
              type="button"
              className="select_all_btn"
              onClick={handleToggleSelectAll}
            >
              {filteredPermissions.every((p) =>
                selectedPermissions.has(p.name)
              )
                ? "Deselect All Filtered"
                : "Select All Filtered"}
            </button>
          )}
        </div>

        {isPermissionsLoading ? (
          <p className="empty_state">Loading permissions...</p>
        ) : isPermissionsError ? (
          <p className="empty_state">Failed to load permissions list.</p>
        ) : filteredPermissions.length === 0 ? (
          <p className="empty_state">
            {searchTerm
              ? `No permissions match "${searchTerm}"`
              : "No permissions available in system."}
          </p>
        ) : (
          <div className="permissions_grid">
            {filteredPermissions.map((perm: Permission) => {
              const isChecked = selectedPermissions.has(perm.name);
              return (
                <InputCheckbox
                  key={perm.id || perm.name}
                  label={perm.name}
                  checked={isChecked}
                  onChange={() => togglePermission(perm.name)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Effective Permissions (Read-only) Section */}
      <div className="section_card">
        <div className="section_header">
          <div className="section_title_box">
            <h3>
              Effective Permissions (Read-only)
              <span className="count_badge">
                {allPermissions.length} total
              </span>
            </h3>
            <p>
              Combined permissions the user has through their assigned roles and
              direct grants
            </p>
          </div>
        </div>

        {allPermissions.length === 0 ? (
          <p className="empty_state">
            No effective permissions found for this user.
          </p>
        ) : (
          <div className="effective_permissions_wrapper">
            {allPermissions.map((permName) => {
              const isDirect = directSet.has(permName);
              return (
                <span
                  key={permName}
                  className={`effective_pill ${isDirect ? "is_direct" : ""}`}
                  title={
                    isDirect
                      ? "Directly assigned permission"
                      : "Inherited from assigned role"
                  }
                >
                  <span className="badge_dot" />
                  {permName}
                  {isDirect && (
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>
                      (Direct)
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

