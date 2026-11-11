// src/pages/UsersAndAccess/UserPermissions/UserRolesSection.tsx

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import InputCheckbox from "../../../components/InputCheckbox/InputCheckbox";
import {
  useFetchAllRoles,
  useAssignUserRoles,
  type Role,
} from "../../../hooks/useRolesAndAccess";

interface UserRolesSectionProps {
  userId: number;
  assignedRoles: string[];
  onRolesUpdated?: (newRoles: string[]) => void;
}

export const UserRolesSection: React.FC<UserRolesSectionProps> = ({
  userId,
  assignedRoles,
  onRolesUpdated,
}) => {
  const { data: allRoles = [], isLoading: isRolesLoading, isError: isRolesError } =
    useFetchAllRoles();
  const assignRolesMutation = useAssignUserRoles();

  // Local state for selected roles (names)
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(
    () => new Set(assignedRoles)
  );

  // Sync when initial assignedRoles changes (e.g. after refetch or switching user)
  useEffect(() => {
    setSelectedRoles(new Set(assignedRoles));
  }, [assignedRoles, userId]);

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleName)) {
        next.delete(roleName);
      } else {
        next.add(roleName);
      }
      return next;
    });
  };

  const handleReset = () => {
    setSelectedRoles(new Set(assignedRoles));
  };

  const isDirty = useMemo(() => {
    if (selectedRoles.size !== assignedRoles.length) return true;
    for (const r of assignedRoles) {
      if (!selectedRoles.has(r)) return true;
    }
    return false;
  }, [selectedRoles, assignedRoles]);

  const handleSaveRoles = async () => {
    const rolesArray = Array.from(selectedRoles);
    try {
      await assignRolesMutation.mutateAsync({
        id: userId,
        roles: rolesArray,
      });
      toast.success("User roles updated successfully");
      onRolesUpdated?.(rolesArray);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user roles";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="section_card">
      <div className="section_header">
        <div className="section_title_box">
          <h3>
            Assigned Roles
            <span className="count_badge">
              {selectedRoles.size} of {allRoles.length}
            </span>
          </h3>
          <p>Assign or remove standard roles for this user</p>
        </div>

        <div className="section_actions">
          <SecondaryButton
            title="Reset"
            onClick={handleReset}
            disable={!isDirty || assignRolesMutation.isPending}
          />
          <PrimaryButton
            title={assignRolesMutation.isPending ? "Saving..." : "Save Roles"}
            onClick={handleSaveRoles}
            disabled={assignRolesMutation.isPending || !isDirty}
            isLoading={assignRolesMutation.isPending}
          />
        </div>
      </div>

      {isRolesLoading ? (
        <p className="empty_state">Loading roles...</p>
      ) : isRolesError ? (
        <p className="empty_state">Failed to load roles list.</p>
      ) : allRoles.length === 0 ? (
        <p className="empty_state">No roles found in system.</p>
      ) : (
        <div className="roles_grid">
          {allRoles.map((role: Role) => {
            const roleName = role.name;
            const displayName = role.display_name || role.name;
            const isChecked = selectedRoles.has(roleName);

            return (
              <InputCheckbox
                key={role.id || roleName}
                label={displayName}
                checked={isChecked}
                onChange={() => toggleRole(roleName)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

