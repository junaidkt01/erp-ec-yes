// Renders children only when the logged-in user holds the required permission(s) or role(s).
// Uses the shared effective permissions from usePermissions (top-level, direct and every role's).
import type { ReactNode } from "react";
import { usePermissions, type PermissionMode } from "../../auth/usePermissions";

interface CanProps {
    /** A single permission name. */
    permission?: string;
    /** Several permission names, combined with `mode`. */
    permissions?: string[];
    /** A single role name. */
    role?: string;
    /** Several role names. */
    roles?: string[];
    /** "any" (default): at least one is required. "all": every one is required. */
    mode?: PermissionMode;
    /** Rendered when access is denied. Nothing is rendered while permissions are loading. */
    fallback?: ReactNode;
    children: ReactNode;
}

export const Can = ({
    permission,
    permissions,
    role,
    roles,
    mode = "any",
    fallback = null,
    children,
}: CanProps) => {
    const { hasPermissions, hasRole, isSuperUser, isLoading } = usePermissions();

    if (isLoading) return null;

    // Role check if specified — superadmin must also satisfy the role check
    if (role || roles?.length) {
        const roleList = [...(role ? [role] : []), ...(roles ?? [])];
        const roleMatch = mode === "all"
            ? roleList.every((r) => hasRole?.(r))
            : roleList.some((r) => hasRole?.(r));
        if (!roleMatch) return <>{fallback}</>;
    }

    // Super user always bypasses permission checks
    if (isSuperUser) {
        return <>{children}</>;
    }

    const required = [...(permission ? [permission] : []), ...(permissions ?? [])];

    // If no permission requirement specified, allow
    if (required.length === 0) {
        return <>{children}</>;
    }

    // With both props given, the single permission is always required alongside `permissions`.
    const allowed = permission && permissions?.length
        ? hasPermissions([permission], "all") && hasPermissions(permissions, mode)
        : hasPermissions(required, mode);

    return <>{allowed ? children : fallback}</>;
};

export default Can;
