// Central permission check used by route guards and the sidebar.
// Permissions are collected from the logged-in session: top-level permissions,
// the user's direct permissions, and every assigned role's permissions.
import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { useFetchRawSidebarMenus, type RawSidebarMenuItem } from "../hooks/useSidebarMenus";

// Roles that bypass every permission check
const SUPER_ROLES = ["super-admin"];

export interface PermissionRequirement {
    permission?: string | null;
    permission_id?: number | string | null;
}

type PermissionLike = string | number | { id?: number | string; name?: string } | null | undefined;

const addPermissions = (list: unknown, ids: Set<string>, names: Set<string>) => {
    if (!Array.isArray(list)) return;
    (list as PermissionLike[]).forEach((p) => {
        if (p === null || p === undefined) return;
        if (typeof p === "number") ids.add(String(p));
        else if (typeof p === "string") names.add(p);
        else {
            if (p.id !== undefined && p.id !== null) ids.add(String(p.id));
            if (p.name) names.add(p.name);
        }
    });
};

const normalizePath = (path: string) => path.toLowerCase().replace(/\/+$/, "") || "/";

export const usePermissions = () => {
    const { data } = useAuth();

    const access = useMemo(() => {
        const ids = new Set<string>();
        const names = new Set<string>();
        const roles = new Set<string>();
        const user = data?.user ?? data;

        addPermissions(data?.permissions, ids, names);
        addPermissions(user?.permissions, ids, names);
        (Array.isArray(data?.roles) ? data.roles : []).forEach((r: any) => roles.add(typeof r === "string" ? r : r?.name));
        (Array.isArray(user?.roles) ? user.roles : []).forEach((r: any) => {
            if (typeof r === "string") return roles.add(r);
            if (r?.name) roles.add(r.name);
            addPermissions(r?.permissions, ids, names);
        });

        return { ids, names, roles, isSuperUser: SUPER_ROLES.some((r) => roles.has(r)) };
    }, [data]);

    /** True when the item has no requirement, or the user holds it (by id or name). */
    const can = useCallback((req?: PermissionRequirement | null) => {
        if (access.isSuperUser || !req) return true;
        const hasId = req.permission_id !== undefined && req.permission_id !== null && req.permission_id !== "";
        if (!hasId && !req.permission) return true;
        return (hasId && access.ids.has(String(req.permission_id))) ||
            (Boolean(req.permission) && access.names.has(req.permission!));
    }, [access]);

    return { ...access, can };
};

/**
 * Resolves the sidebar menu that owns a URL (longest matching path prefix),
 * so `/student-info/student-list` is guarded by the `/student-info` menu.
 */
export const findMenuForPath = (menus: RawSidebarMenuItem[] | undefined, pathname: string) => {
    if (!menus?.length) return undefined;
    const current = normalizePath(pathname);
    let match: RawSidebarMenuItem | undefined;
    let matchLength = -1;
    for (const menu of menus) {
        if (!menu.path) continue;
        const p = normalizePath(menu.path);
        if ((current === p || current.startsWith(`${p}/`)) && p.length > matchLength) {
            match = menu;
            matchLength = p.length;
        }
    }
    return match;
};

/** Whether the current user may open a URL. Routes not tied to a menu are allowed. */
export const useRouteAccess = (pathname: string) => {
    const { can } = usePermissions();
    const { data: menus, isLoading, isError } = useFetchRawSidebarMenus();
    const menu = useMemo(() => findMenuForPath(menus, pathname), [menus, pathname]);

    return {
        isLoading,
        // If the menu list can't be loaded, don't lock users out; the API still enforces permissions.
        allowed: isError || can(menu),
    };
};
