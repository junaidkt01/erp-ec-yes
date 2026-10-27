// src/hooks/useRoles.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import { role } from "../api/endpoints";

export const ROLES_KEY = ["roles"];

export interface Permission {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string | null;
  updated_at?: string | null;
  pivot?: {
    role_id: number;
    permission_id: number;
  };
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  display_name: string;
  users_count?: number;
  permissions?: Permission[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RolesResponse {
  success: boolean;
  total?: number;
  data: Role[];
  message?: string;
}

export interface CreateRolePayload {
  name: string;
  guard_name?: string;
  permissions?: string[];
}

export interface UpdateRolePayload {
  id: number | string;
  name?: string;
  guard_name?: string;
  permissions?: string[];
}

// 1. Fetch all roles (GET /api/roles)
export const getRolesApi = async (): Promise<Role[]> => {
  const res = await axiosInstance.get(role.roles);
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : [];
};

export const useFetchAllRoles = () => {
  return useQuery<Role[]>({
    queryKey: ROLES_KEY,
    queryFn: getRolesApi,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};

// 2. Fetch single role details by ID or Name (GET /api/roles/{id})
export const getRoleByIdApi = async (id: number | string): Promise<Role> => {
  const res = await axiosInstance.get(`${role.roles}/${id}`);
  return res.data?.data ?? res.data;
};

export const useFetchRoleById = (id?: number | string | null, enabled: boolean = true) => {
  return useQuery<Role>({
    queryKey: [...ROLES_KEY, "detail", id],
    queryFn: () => getRoleByIdApi(id!),
    enabled: !!id && enabled,
  });
};

// 3. Fetch permissions for a specific role (GET /api/roles/{id}/permissions)
export const getRolePermissionsApi = async (id: number | string) => {
  const res = await axiosInstance.get(`${role.roles}/${id}/permissions`);
  return res.data?.data ?? res.data;
};

export const useFetchRolePermissions = (id?: number | string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...ROLES_KEY, "permissions", id],
    queryFn: () => getRolePermissionsApi(id!),
    enabled: !!id && enabled,
  });
};

// 4. Create new role (POST /api/roles)
export const createRoleApi = async (payload: CreateRolePayload) => {
  const res = await axiosInstance.post(role.roles, payload);
  return res.data?.data ?? res.data;
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRoleApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
};

// 5. Update existing role (PUT /api/roles/{id})
export const updateRoleApi = async (payload: UpdateRolePayload) => {
  const { id, ...data } = payload;
  const res = await axiosInstance.put(`${role.roles}/${id}`, data);
  return res.data?.data ?? res.data;
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => updateRoleApi(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: [...ROLES_KEY, "detail", variables.id] });
    },
  });
};

// 6. Delete role (DELETE /api/roles/{id})
export const deleteRoleApi = async (id: number | string) => {
  const res = await axiosInstance.delete(`${role.roles}/${id}`);
  return res.data;
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteRoleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
};

// 7. Convenient hook for Select options: { label, value, raw }
export const useRoleOptions = (includeAllOption: boolean = false) => {
  const { data: roles = [], isLoading, isError } = useFetchAllRoles();

  const options = useMemo(() => {
    const list = roles.map((r) => ({
      label: r.display_name || r.name,
      value: r.name,
      id: r.id,
      raw: r,
    }));

    if (includeAllOption) {
      return [{ label: "All Roles", value: "All", id: 0, raw: null }, ...list];
    }
    return list;
  }, [roles, includeAllOption]);

  return { options, roles, isLoading, isError };
};
