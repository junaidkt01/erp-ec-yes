// src/hooks/useRolesAndAccess.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { permission, role, user } from "../api/endpoints";
import { ROLES_KEY, type Permission, type Role } from "./useRoles";

// Role CRUD + role permissions (already implemented in useRoles.ts)
//   POST   /api/roles                -> useCreateRole
//   GET    /api/roles/{id}           -> useFetchRoleById
//   PUT    /api/roles/{id}           -> useUpdateRole
//   DELETE /api/roles/{id}           -> useDeleteRole
//   GET    /api/roles/{id}/permissions -> useFetchRolePermissions
export {
  ROLES_KEY,
  useFetchAllRoles,
  useCreateRole,
  useFetchRoleById,
  useUpdateRole,
  useDeleteRole,
  useFetchRolePermissions,
  type Role,
  type Permission,
  type CreateRolePayload,
  type UpdateRolePayload,
} from "./useRoles";

export const PERMISSIONS_KEY = ["permissions"];
export const USER_ACCESS_KEY = ["user-access"];

const unwrap = (res: any) => res.data?.data ?? res.data;

/* ------------------------------------------------------------------ */
/* Roles list                                                          */
/* ------------------------------------------------------------------ */

export interface RolesAndAccessResponse {
  success: boolean;
  total: number;
  data: Role[];
}

// GET /api/roles?search= — all roles with user counts and assigned permissions
export const getRolesAndAccessApi = async (
  search?: string
): Promise<RolesAndAccessResponse> => {
  const res = await axiosInstance.get(role.roles, {
    params: search ? { search } : undefined,
  });

  const data = res.data?.data;
  const list: Role[] = Array.isArray(data) ? data : [];

  return {
    success: res.data?.success ?? true,
    total: res.data?.total ?? list.length,
    data: list,
  };
};

export const useFetchRolesAndAccess = (search?: string) => {
  return useQuery<RolesAndAccessResponse>({
    // Nested under ROLES_KEY so role create/update/delete mutations refresh this list
    queryKey: [...ROLES_KEY, "list", search ?? ""],
    queryFn: () => getRolesAndAccessApi(search),
    placeholderData: (prev) => prev, // keep previous results while typing a search
  });
};

/* ------------------------------------------------------------------ */
/* Role permissions sync                                               */
/* ------------------------------------------------------------------ */

export interface SyncRolePermissionsPayload {
  id: number | string;
  permissions: (string | number)[]; // permission names or ids
}

// POST /api/roles/{id}/permissions — assign / sync permissions for a role
export const syncRolePermissionsApi = async ({
  id,
  permissions,
}: SyncRolePermissionsPayload) => {
  const res = await axiosInstance.post(`${role.roles}/${id}/permissions`, {
    permissions,
  });
  return unwrap(res);
};

export const useSyncRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncRolePermissionsApi,
    onSuccess: (res) => {
      console.log("permissions:01 res", res);
      // refreshes roles list, role detail, role permissions, active session auth & menus
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: USER_ACCESS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-menus"] });
      queryClient.invalidateQueries({ queryKey: ["raw-sidebar-menus"] });
    },
    onError: (error) => {
      console.log("permissions:01 error", error);
    },
  });
};

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

// GET /api/permissions — all system permissions
// Accepts [..], { data: [..] } or { permissions: [..] }; items may be objects or plain names
export const toPermissionArray = (data: any): Permission[] => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.permissions)
        ? data.permissions
        : [];
  return list.map((p: any, i: number) => (typeof p === "string" ? { id: i, name: p } : p));
};

export const getPermissionsApi = async (): Promise<Permission[]> => {
  return toPermissionArray(unwrap(await axiosInstance.get(permission.permissions)));
};

export const useFetchAllPermissions = () => {
  return useQuery<Permission[]>({
    queryKey: PERMISSIONS_KEY,
    queryFn: getPermissionsApi,
    staleTime: 5 * 60 * 1000,
  });
};

export interface CreatePermissionPayload {
  name: string;
  guard_name?: string;
}

// POST /api/permissions — create a permission
export const createPermissionApi = async (payload: CreatePermissionPayload) => {
  return unwrap(await axiosInstance.post(permission.permissions, payload));
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPermissionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: USER_ACCESS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

export interface UpdatePermissionPayload {
  id: number | string;
  name: string;
  guard_name?: string;
}

// PUT /api/permissions/{id} — update a permission
export const updatePermissionApi = async ({ id, ...payload }: UpdatePermissionPayload) => {
  const res = await axiosInstance.put(`${permission.permissions}/${id}`, payload);
  return unwrap(res);
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePermissionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: USER_ACCESS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

// DELETE /api/permissions/{id} — delete a permission
export const deletePermissionApi = async (id: number | string) => {
  const res = await axiosInstance.delete(`${permission.permissions}/${id}`);
  return res.data;
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: USER_ACCESS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

/* ------------------------------------------------------------------ */
/* User roles & permissions                                            */
/* ------------------------------------------------------------------ */

export interface UserPermissionsUser {
  id: number;
  name: string;
  email: string;
  [key: string]: any;
}

export interface UserPermissionsData {
  user: UserPermissionsUser;
  roles: (string | Role)[];
  direct_permissions: (string | Permission)[];
  all_permissions: (string | Permission)[];
}

export interface UserAccess extends UserPermissionsData {
  permissions?: (Permission | string)[];
  [key: string]: any;
}

export const normalizeRoleNames = (roles?: (Role | string)[]): string[] => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((r) => (typeof r === "string" ? r : r.name))
    .filter(Boolean);
};

export const normalizePermissionNames = (permissions?: (Permission | string)[]): string[] => {
  if (!Array.isArray(permissions)) return [];
  return permissions
    .map((p) => (typeof p === "string" ? p : p.name))
    .filter(Boolean);
};

// GET /api/users/{id}/permissions — a user's roles and permissions
export const getUserAccessApi = async (
  id: number | string
): Promise<UserPermissionsData> => {
  const res = await axiosInstance.get(`${user.users}/${id}/permissions`);
  const raw = res.data?.data ?? res.data;
  return {
    user: raw?.user ?? { id: Number(id), name: "", email: "" },
    roles: Array.isArray(raw?.roles) ? raw.roles : [],
    direct_permissions: Array.isArray(raw?.direct_permissions) ? raw.direct_permissions : [],
    all_permissions: Array.isArray(raw?.all_permissions) ? raw.all_permissions : [],
  };
};

export const useFetchUserAccess = (id?: number | string | null) => {
  return useQuery<UserPermissionsData>({
    queryKey: [...USER_ACCESS_KEY, id ? String(id) : ""],
    queryFn: () => getUserAccessApi(id!),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: true,
  });
};

export interface AssignUserPermissionsPayload {
  id: number | string;
  permissions: (string | number)[];
}

// POST /api/users/{id}/permissions — assign direct permissions to a user
export const assignUserPermissionsApi = async ({
  id,
  permissions,
}: AssignUserPermissionsPayload) => {
  const res = await axiosInstance.post(`${user.users}/${id}/permissions`, { permissions });
  return unwrap(res);
};

export const useAssignUserPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignUserPermissionsApi,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...USER_ACCESS_KEY, String(id)] });
      queryClient.invalidateQueries({ queryKey: USER_ACCESS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-menus"] });
      queryClient.invalidateQueries({ queryKey: ["raw-sidebar-menus"] });
    },
  });
};

export interface AssignUserRolesPayload {
  id: number | string;
  roles: (string | number)[]; // role names or ids
}

// POST /api/users/{id}/roles — assign roles to a user
export const assignUserRolesApi = async ({ id, roles }: AssignUserRolesPayload) => {
  const res = await axiosInstance.post(`${user.users}/${id}/roles`, { roles });
  return unwrap(res);
};

export const useAssignUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignUserRolesApi,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...USER_ACCESS_KEY, String(id)] });
      queryClient.invalidateQueries({ queryKey: USER_ACCESS_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_KEY }); // users_count changes
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-menus"] });
      queryClient.invalidateQueries({ queryKey: ["raw-sidebar-menus"] });
    },
  });
};

/* ------------------------------------------------------------------ */
/* Users list                                                          */
/* ------------------------------------------------------------------ */

export interface UserListItem {
  id: number;
  name: string;
  full_name?: string;
  email: string;
  phone?: string | null;
  is_active?: number;
  roles?: { id: number; name: string }[];
}

export const USERS_KEY = ["users"];

export const useFetchAllUsers = () =>
  useQuery<UserListItem[]>({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get(user.users);
      return unwrap(res) ?? [];
    },
  });
