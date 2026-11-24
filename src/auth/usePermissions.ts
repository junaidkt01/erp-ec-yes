// Central permission check used by route guards and the sidebar.
// Permissions are collected from the logged-in session: top-level permissions,
// direct permissions, all_permissions, and every assigned role's permissions.
import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { useFetchRawSidebarMenus, type RawSidebarMenuItem } from "../hooks/useSidebarMenus";
import { slugify, type SubMenuItem } from "../utils";

// Checks whether a role name corresponds to a super admin (case and format insensitive)
const isSuperRole = (name?: string | null): boolean => {
    if (!name) return false;
    const normalized = String(name).toLowerCase().trim().replace(/[\s_]+/g, "-");
    return normalized === "super-admin" || normalized === "superadmin" || normalized === "super";
};

export interface PermissionRequirement {
    permission?: string | null;
    permission_id?: number | string | null;
    title?: string;
    path?: string;
}

type PermissionLike = string | number | { id?: number | string; name?: string } | null | undefined;

const addPermissions = (list: unknown, ids: Set<string>, names: Set<string>) => {
    if (!list) return;
    if (Array.isArray(list)) {
        (list as PermissionLike[]).forEach((p) => {
            if (p === null || p === undefined) return;
            if (typeof p === "number") ids.add(String(p));
            else if (typeof p === "string") names.add(p);
            else if (typeof p === "object") {
                if (p.id !== undefined && p.id !== null) ids.add(String(p.id));
                if (p.name) names.add(p.name);
            }
        });
    } else if (typeof list === "object") {
        Object.entries(list as Record<string, unknown>).forEach(([key, val]) => {
            if (val) names.add(key);
        });
    }
};

export const normalizePath = (path: string) => path.toLowerCase().replace(/\/+$/, "") || "/";

/** Helper to match a permission name against held permissions (exact or normalized). */
export const checkNameMatch = (names: Set<string>, name?: string | null): boolean => {
    if (!name) return false;
    if (names.has(name)) return true;
    const normalized = name.toLowerCase().trim().replace(/[\s-]+/g, "_");
    for (const held of names) {
        if (held.toLowerCase().trim().replace(/[\s-]+/g, "_") === normalized) {
            return true;
        }
    }
    return false;
};

/**
 * Builds candidate permission names for a submenu in case `sub.permission` was not explicitly set on the object.
 * e.g. "Student List" -> ["student-list", "student_list", "Student List", "view_student_list", ...]
 */
export const getSubmenuPermissionCandidates = (
    parent: { path?: string; title?: string } | null | undefined,
    sub: SubMenuItem
): string[] => {
    const list: string[] = [];
    const title = typeof sub === "string" ? sub : sub?.title;
    if (!title) return list;

    const subSlug = slugify(title);
    const subSnake = subSlug.replace(/-/g, "_");

    list.push(subSlug);
    list.push(subSnake);
    list.push(title);
    list.push(title.toLowerCase());

    list.push(`view_${subSnake}`);
    list.push(`manage_${subSnake}`);
    list.push(`view-${subSlug}`);
    list.push(`manage-${subSlug}`);

    if (sub.path) {
        const seg = normalizePath(sub.path).split("/").filter(Boolean).pop();
        if (seg) {
            list.push(seg);
            list.push(seg.replace(/-/g, "_"));
        }
    }

    if (parent?.title) {
        const parentSnake = slugify(parent.title).replace(/-/g, "_");
        list.push(`${parentSnake}_${subSnake}`);
    }

    return Array.from(new Set(list));
};

interface Access {
    ids: Set<string>;
    names: Set<string>;
    roles: Set<string>;
    isSuperUser: boolean;
}

const EMPTY_ACCESS: Access = { ids: new Set(), names: new Set(), roles: new Set(), isSuperUser: false };

const unwrapAuthData = (data: any) => {
    if (!data || typeof data !== "object") return null;
    if (data.data && typeof data.data === "object" && (data.data.user || data.data.roles || data.data.permissions || data.data.all_permissions)) {
        return data.data;
    }
    return data;
};

const buildAccess = (rawData: any): Access => {
    const data = unwrapAuthData(rawData);
    if (!data || typeof data !== "object") return EMPTY_ACCESS;

    const ids = new Set<string>();
    const names = new Set<string>();
    const roles = new Set<string>();
    let isSuperUser = false;

    const user = data?.user ?? data;

    // Collect permissions from all common response structures (direct, all_permissions, permissions)
    addPermissions(data?.permissions, ids, names);
    addPermissions(data?.all_permissions, ids, names);
    addPermissions(data?.direct_permissions, ids, names);

    addPermissions(user?.permissions, ids, names);
    addPermissions(user?.all_permissions, ids, names);
    addPermissions(user?.direct_permissions, ids, names);

    // Collect roles and role permissions
    const collectRoles = (roleList: unknown) => {
        if (!roleList) return;
        const list = Array.isArray(roleList) ? roleList : [roleList];
        list.forEach((r: any) => {
            if (!r) return;
            const roleName = typeof r === "string" ? r : r.name;
            if (roleName) {
                roles.add(roleName);
                if (isSuperRole(roleName)) isSuperUser = true;
            }
            if (typeof r === "object") {
                addPermissions(r?.permissions, ids, names);
                addPermissions(r?.all_permissions, ids, names);
            }
        });
    };

    collectRoles(data?.roles);
    collectRoles(data?.role);
    collectRoles(user?.roles);
    collectRoles(user?.role);

    return { ids, names, roles, isSuperUser };
};

export type PermissionMode = "any" | "all";

export const usePermissions = () => {
    const { data, isLoading } = useAuth();
    const access = useMemo(() => buildAccess(data), [data]);

    /** True when the item has no requirement, or the user holds it (by id or name). */
    const can = useCallback((req?: PermissionRequirement | null) => {
        if (access.isSuperUser || !req) return true;
        const hasId = req.permission_id !== undefined && req.permission_id !== null && req.permission_id !== "";
        const hasPerm = Boolean(req.permission);
        if (!hasId && !hasPerm) return true;
        return (hasId && access.ids.has(String(req.permission_id))) ||
            (hasPerm && checkNameMatch(access.names, req.permission!));
    }, [access]);

    /**
     * Validates that BOTH parent menu permission AND individual submenu permission are granted.
     * Both are MANDATORY. If either permission is missing, returns false.
     */
    const canSubmenu = useCallback((
        parent: PermissionRequirement | null | undefined,
        sub: SubMenuItem | null | undefined
    ) => {
        if (access.isSuperUser) return true;
        if (!sub) return false;

        // 1. Parent permission check (Mandatory)
        if (parent) {
            const parentHasId = parent.permission_id !== undefined && parent.permission_id !== null && parent.permission_id !== "";
            const parentHasPerm = Boolean(parent.permission);
            if (parentHasId || parentHasPerm) {
                const hasParent = (parentHasId && access.ids.has(String(parent.permission_id))) ||
                    (parentHasPerm && checkNameMatch(access.names, parent.permission!));
                if (!hasParent) return false;
            }
        }

        // 2. Individual submenu permission check (Mandatory)
        const subHasId = sub.permission_id !== undefined && sub.permission_id !== null && sub.permission_id !== "";
        const subHasPerm = Boolean(sub.permission);

        if (subHasId || subHasPerm) {
            return (subHasId && access.ids.has(String(sub.permission_id))) ||
                (subHasPerm && checkNameMatch(access.names, sub.permission!));
        }

        // Check derived candidate permission names for this submenu
        const candidates = getSubmenuPermissionCandidates(parent as any, sub);
        for (const cand of candidates) {
            if (checkNameMatch(access.names, cand)) {
                return true;
            }
        }

        return false;
    }, [access]);

    /** Whether the user holds a permission by name. Empty/undefined names are allowed. */
    const hasPermission = useCallback((name?: string | null) => {
        if (!name) return true;
        return access.isSuperUser || checkNameMatch(access.names, name);
    }, [access]);

    /** Check several permission names: "any" needs one of them, "all" needs every one. */
    const hasPermissions = useCallback((list?: (string | null | undefined)[] | null, mode: PermissionMode = "any") => {
        const valid = (list ?? []).filter((p): p is string => Boolean(p));
        if (!valid.length) return true;
        if (access.isSuperUser) return true;
        return mode === "all"
            ? valid.every((p) => checkNameMatch(access.names, p))
            : valid.some((p) => checkNameMatch(access.names, p));
    }, [access]);

    /** Whether the user holds a specific role (case/format-insensitive). */
    const hasRole = useCallback((roleName?: string | null) => {
        if (!roleName) return true;
        const target = roleName.toLowerCase().trim().replace(/[\s_]+/g, "-");
        return Array.from(access.roles).some((r) => {
            const normalized = r.toLowerCase().trim().replace(/[\s_]+/g, "-");
            if (normalized === target) return true;
            if (isSuperRole(target) && isSuperRole(normalized)) return true;
            return false;
        });
    }, [access]);

    return { ...access, can, canSubmenu, hasPermission, hasPermissions, hasRole, isLoading: isLoading && !data };
};

export interface MatchedRoute {
    parentMenu: RawSidebarMenuItem;
    submenu?: SubMenuItem;
    isExactParent: boolean;
}

/**
 * Resolves the parent menu and the matching submenu for a given pathname.
 */
export const findRouteMenuAndSubmenu = (
    menus: RawSidebarMenuItem[] | undefined,
    pathname: string
): MatchedRoute | undefined => {
    if (!menus?.length) return undefined;
    const current = normalizePath(pathname);

    // 1. Find the parent menu with the longest matching path prefix
    let parentMatch: RawSidebarMenuItem | undefined;
    let matchLength = -1;

    for (const menu of menus) {
        if (!menu.path) continue;
        const p = normalizePath(menu.path);
        if ((current === p || current.startsWith(`${p}/`)) && p.length > matchLength) {
            parentMatch = menu;
            matchLength = p.length;
        }
    }

    if (!parentMatch) return undefined;

    const parentPath = normalizePath(parentMatch.path);
    if (current === parentPath) {
        return { parentMenu: parentMatch, isExactParent: true };
    }

    // 2. Check if current path matches any submenu under parentMatch
    let matchingSubmenu: SubMenuItem | undefined;
    if (parentMatch.sub_menus && Array.isArray(parentMatch.sub_menus)) {
        for (const sub of parentMatch.sub_menus) {
            const subTitle = typeof sub === "string" ? sub : sub.title;
            const subSlug = slugify(subTitle);
            const subPath = sub.path
                ? normalizePath(sub.path.startsWith("/") ? sub.path : `${parentPath}/${sub.path}`)
                : `${parentPath}/${subSlug}`;

            if (current === subPath || current.startsWith(`${subPath}/`)) {
                matchingSubmenu = typeof sub === "string" ? { title: sub, is_active: true } : sub;
                break;
            }
        }
    }

    return {
        parentMenu: parentMatch,
        submenu: matchingSubmenu,
        isExactParent: false,
    };
};

/**
 * Backward compatibility: returns the matching parent menu or submenu item.
 */
export const findMenuForPath = (menus: RawSidebarMenuItem[] | undefined, pathname: string) => {
    const match = findRouteMenuAndSubmenu(menus, pathname);
    return match?.submenu || match?.parentMenu;
};

/**
 * Validates route access:
 * - If route is governed by a parent menu, parent permission is mandatory.
 * - If route is governed by a submenu, BOTH parent and individual submenu permissions are mandatory.
 * - Having access to parent does NOT automatically grant access to submenus.
 */
export const useRouteAccess = (pathname: string) => {
    const { can, canSubmenu, isSuperUser } = usePermissions();
    const { data: menus, isLoading, isError } = useFetchRawSidebarMenus();

    const routeMatch = useMemo(() => findRouteMenuAndSubmenu(menus, pathname), [menus, pathname]);

    const allowed = useMemo(() => {
        // Super user bypasses all checks
        if (isSuperUser) return true;

        // If menus can't be loaded or the route is not tied to any menu, do not block
        if (isError || !routeMatch) return true;

        const { parentMenu, submenu, isExactParent } = routeMatch;

        // 1. Parent menu permission is mandatory
        if (!parentMenu || !can(parentMenu)) {
            return false;
        }

        // 2. Exact parent menu path (no submenu)
        if (isExactParent) {
            return true;
        }

        // 3. Submenu route: BOTH parent permission AND individual submenu permission are mandatory!
        if (submenu) {
            return canSubmenu(parentMenu, submenu);
        }

        // 4. Nested sub-route not explicitly defined as a submenu item (e.g. details page like /profile/:id)
        return true;
    }, [isSuperUser, isError, routeMatch, can, canSubmenu]);

    return {
        isLoading,
        allowed,
    };
};
