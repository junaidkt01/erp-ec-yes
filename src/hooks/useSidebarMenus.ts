import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { sidebarMenus } from "../api/endpoints";
import { useAuth, getStoredAuth } from "../auth/useAuth";
import {
  formatSidebarMenus,
  parseIsActive,
  type SidebarMenuGroup,
  type SidebarMenuItem,
  type SubMenuItem,
  type RawSidebarMenuItem,
} from "../utils";

export type { SidebarMenuGroup, SidebarMenuItem, SubMenuItem, RawSidebarMenuItem };
export { formatSidebarMenus, parseIsActive };

export const SIDEBAR_MENUS_KEY = ["sidebar-menus"];
export const RAW_SIDEBAR_MENUS_KEY = ["raw-sidebar-menus"];

export interface SidebarMenusApiResponse {
  data?: (RawSidebarMenuItem | SidebarMenuGroup)[];
  [key: string]: any;
}

export type SidebarMenusResponse =
  | SidebarMenusApiResponse
  | (RawSidebarMenuItem | SidebarMenuGroup)[];

// GET /api/sidebar-menus/items
export const useSidebarMenus = (options?: { enabled?: boolean }) => {
  const { data: authData } = useAuth();
  const isLoggedIn = Boolean(authData || getStoredAuth());

  return useQuery<SidebarMenuGroup[]>({
    queryKey: SIDEBAR_MENUS_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<SidebarMenusResponse>(
        sidebarMenus.items
      );

      let rawData: (RawSidebarMenuItem | SidebarMenuGroup)[] = [];

      // Handle raw array response or wrapped { data: [...] } response
      if (Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      }

      // Convert flat items (with `section`) into SidebarMenuGroup[]
      return formatSidebarMenus(rawData);
    },
    enabled: options?.enabled !== undefined ? options.enabled && isLoggedIn : isLoggedIn,
  });
};

// GET /api/sidebar-menus/items (Raw flat list for admin management)
export const useFetchRawSidebarMenus = (options?: { enabled?: boolean }) => {
  const { data: authData } = useAuth();
  const isLoggedIn = Boolean(authData || getStoredAuth());

  return useQuery<RawSidebarMenuItem[]>({
    queryKey: RAW_SIDEBAR_MENUS_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<SidebarMenusResponse>(
        sidebarMenus.items
      );

      let rawData: RawSidebarMenuItem[] = [];
      if (Array.isArray(res.data)) {
        rawData = res.data as RawSidebarMenuItem[];
      } else if (res.data && Array.isArray(res.data.data)) {
        rawData = res.data.data as RawSidebarMenuItem[];
      }

      return rawData;
    },
    enabled: options?.enabled !== undefined ? options.enabled && isLoggedIn : isLoggedIn,
  });
};

/* ------------------------------------------------------------------ */
/* Payloads & API functions for Sidebar Menus                          */
/* ------------------------------------------------------------------ */

export interface CreateSidebarMenuPayload {
  section: string;
  title: string;
  icon?: string;
  path: string;
  order?: number;
  is_active?: boolean;
  permission?: string | null;
  permission_id?: number | string | null;
  sub_menus?: SubMenuItem[];
}

export interface UpdateSidebarMenuPayload {
  section?: string;
  title?: string;
  icon?: string;
  path?: string;
  order?: number;
  is_active?: boolean;
  permission?: string | null;
  permission_id?: number | string | null;
  sub_menus?: SubMenuItem[];
}

// POST /api/sidebar-menus
export const createSidebarMenuItem = async (payload: CreateSidebarMenuPayload) => {
  const res = await axiosInstance.post(sidebarMenus.menus, payload);
  return res.data;
};

// PUT /api/sidebar-menus/{id}
export const updateSidebarMenuItem = async (
  id: number,
  payload: UpdateSidebarMenuPayload
) => {
  const res = await axiosInstance.put(
    `${sidebarMenus.update}/${id}`,
    payload
  );
  return res.data;
};

// DELETE /api/sidebar-menus/{id}
export const deleteSidebarMenuItem = async (id: number) => {
  const res = await axiosInstance.delete(`${sidebarMenus.menus}/${id}`);
  return res.data;
};

/* ------------------------------------------------------------------ */
/* Payloads & API functions for Sidebar Sub-Menus (New Endpoints)     */
/* ------------------------------------------------------------------ */

export interface CreateSidebarSubMenuPayload {
  sidebar_menu_id: number;
  title: string;
  path?: string;
  order?: number;
  is_active?: boolean;
  permission?: string | null;
  permission_id?: number | string | null;
}

export interface UpdateSidebarSubMenuPayload {
  id: number;
  sidebar_menu_id?: number;
  title?: string;
  path?: string;
  order?: number;
  is_active?: boolean;
  permission?: string | null;
  permission_id?: number | string | null;
}

export type SubMenuPayload = Omit<CreateSidebarSubMenuPayload, "sidebar_menu_id"> & {
  id?: number;
  sidebar_menu_id?: number;
};

// POST /api/sidebar-sub-menus
export const createSidebarSubMenuItem = async (payload: CreateSidebarSubMenuPayload) => {
  const res = await axiosInstance.post(sidebarMenus.subMenus, payload);
  return res.data;
};

// GET /api/sidebar-sub-menus/{id}
export const getSidebarSubMenuItem = async (id: number | string) => {
  const res = await axiosInstance.get(`${sidebarMenus.subMenus}/${id}`);
  return res.data;
};

// PUT /api/sidebar-sub-menus/{id}
export const updateSidebarSubMenuItem = async ({
  id,
  ...payload
}: UpdateSidebarSubMenuPayload) => {
  const res = await axiosInstance.put(`${sidebarMenus.subMenus}/${id}`, payload);
  return res.data;
};

// DELETE /api/sidebar-sub-menus/{id}
export const deleteSidebarSubMenuItem = async (id: number | string) => {
  const res = await axiosInstance.delete(`${sidebarMenus.subMenus}/${id}`);
  return res.data;
};

// PATCH /api/sidebar-sub-menus/{id}/status
export const updateSubMenuStatusById = async (
  id: number,
  is_active: boolean
) => {
  const res = await axiosInstance.patch(
    sidebarMenus.subMenuStatusById(id),
    { is_active }
  );
  return res.data;
};

// PATCH /api/sidebar-menus/{id}/sub-menu-status
export const updateSubMenuStatusByTitle = async (
  menuId: number,
  title: string,
  is_active: boolean
) => {
  const res = await axiosInstance.patch(
    sidebarMenus.subMenuStatusByTitle(menuId),
    { title, is_active }
  );
  return res.data;
};

// Backward-compatible alias
export const updateSubMenuStatus = updateSubMenuStatusById;

/* ------------------------------------------------------------------ */
/* React Query Mutation Hooks                                         */
/* ------------------------------------------------------------------ */

// Create Menu: POST /api/sidebar-menus
export const useCreateSidebarMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSidebarMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

// Update Menu: PUT /api/sidebar-menus/{id}
export const useUpdateSingleSidebarMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: number } & UpdateSidebarMenuPayload) => {
      return await updateSidebarMenuItem(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

// Delete Menu: DELETE /api/sidebar-menus/{id}
export const useDeleteSidebarMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSidebarMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

/* ── Standalone Sub-Menu Hooks (POST/GET/PUT/DELETE /api/sidebar-sub-menus) ── */

// Create Submenu: POST /api/sidebar-sub-menus
export const useCreateSidebarSubMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSidebarSubMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

// Fetch Submenu by ID: GET /api/sidebar-sub-menus/{id}
export const useFetchSidebarSubMenuById = (id?: number | string | null) => {
  return useQuery({
    queryKey: [...SIDEBAR_MENUS_KEY, "sub-menu", id],
    queryFn: () => (id ? getSidebarSubMenuItem(id) : null),
    enabled: Boolean(id),
  });
};

// Update Submenu: PUT /api/sidebar-sub-menus/{id}
export const useUpdateSidebarSubMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSidebarSubMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

// Delete Submenu: DELETE /api/sidebar-sub-menus/{id}
export const useDeleteSidebarSubMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSidebarSubMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

// Backward-compatible aliases
export const useAddSubMenu = useCreateSidebarSubMenu;
export const useUpdateSubMenu = useUpdateSidebarSubMenu;
export const useDeleteSubMenu = useDeleteSidebarSubMenu;

export interface UpdateSidebarMenusArgs {
  menus: RawSidebarMenuItem[];
  initialMenus?: RawSidebarMenuItem[];
}

// Batch Update: Handles bulk status toggling and updates using PUT /api/sidebar-menus/{id}
// and PATCH /api/sidebar-sub-menus/{id}/status / PATCH /api/sidebar-menus/{id}/sub-menu-status
export const useUpdateSidebarMenus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: RawSidebarMenuItem | RawSidebarMenuItem[] | UpdateSidebarMenusArgs
    ) => {
      let itemsToUpdate: RawSidebarMenuItem[] = [];
      const initialMap = new Map<number, RawSidebarMenuItem>();

      if (Array.isArray(payload)) {
        itemsToUpdate = payload;
      } else if ("menus" in payload && Array.isArray(payload.menus)) {
        itemsToUpdate = payload.menus;
        if (payload.initialMenus && Array.isArray(payload.initialMenus)) {
          payload.initialMenus.forEach((m) => {
            if (m.id) initialMap.set(m.id, m);
          });
        }
      } else {
        itemsToUpdate = [payload as RawSidebarMenuItem];
      }

      // Collect parent menus that changed
      const changedParents: RawSidebarMenuItem[] = [];
      // Collect submenus that changed status
      const changedSubmenusStatus: {
        id?: number;
        menuId: number;
        title: string;
        is_active: boolean;
      }[] = [];

      for (const item of itemsToUpdate) {
        if (!item.id) continue;
        const initial = initialMap.get(item.id);

        const currentSubs = item.sub_menus || [];
        const initialSubs = initial?.sub_menus || [];

        // Check if any submenu had metadata changes (permission, title, path, order)
        const hasSubMetadataChanges = currentSubs.some((sub) => {
          const initSub = initialSubs.find(
            (s) => (sub.id && s.id === sub.id) || s.title === sub.title
          );
          if (!initSub) return true;
          return (
            sub.permission !== initSub.permission ||
            sub.permission_id !== initSub.permission_id ||
            sub.title !== initSub.title ||
            sub.path !== initSub.path
          );
        });

        const parentChanged =
          !initial ||
          parseIsActive(item.is_active) !== parseIsActive(initial.is_active) ||
          item.permission !== initial.permission ||
          item.permission_id !== initial.permission_id ||
          item.title !== initial.title ||
          item.section !== initial.section ||
          item.path !== initial.path ||
          hasSubMetadataChanges;

        if (parentChanged) {
          changedParents.push(item);
        } else {
          // Check if only submenu statuses changed
          for (const sub of currentSubs) {
            const initSub = initialSubs.find(
              (s) => (sub.id && s.id === sub.id) || s.title === sub.title
            );
            if (!initSub) continue;
            if (parseIsActive(sub.is_active) !== parseIsActive(initSub.is_active)) {
              changedSubmenusStatus.push({
                id: sub.id,
                menuId: item.id,
                title: sub.title,
                is_active: parseIsActive(sub.is_active),
              });
            }
          }
        }
      }

      if (changedParents.length === 0 && changedSubmenusStatus.length === 0) {
        return [];
      }

      const results = [];

      // 1. Update changed parent menus (and their full sub_menus) via PUT /api/sidebar-menus/{id}
      for (const item of changedParents) {
        if (!item.id) continue;

        const updateData: UpdateSidebarMenuPayload = {
          section: item.section,
          title: item.title,
          icon: item.icon,
          path: item.path,
          order: item.order,
          is_active: parseIsActive(item.is_active),
          permission: item.permission ?? null,
          permission_id: item.permission_id ? Number(item.permission_id) : null,
          sub_menus: item.sub_menus?.map((s) => ({
            id: s.id,
            title: s.title,
            path: s.path ?? null,
            order: s.order ?? 1,
            is_active: parseIsActive(s.is_active),
            permission: s.permission ?? null,
            permission_id: s.permission_id ? Number(s.permission_id) : null,
          })),
        };

        const res = await axiosInstance.put(
          `${sidebarMenus.update}/${item.id}`,
          updateData
        );
        results.push(res.data);
      }

      // 2. Update standalone submenu status toggles via PATCH endpoints
      for (const sub of changedSubmenusStatus) {
        try {
          if (sub.id) {
            // PATCH /api/sidebar-sub-menus/{id}/status
            const res = await updateSubMenuStatusById(sub.id, sub.is_active);
            results.push(res);
          } else {
            // PATCH /api/sidebar-menus/{menuId}/sub-menu-status
            const res = await updateSubMenuStatusByTitle(sub.menuId, sub.title, sub.is_active);
            results.push(res);
          }
        } catch {
          // If status patch fails, fallback to updating via parent menu
          const parent = itemsToUpdate.find((m) => m.id === sub.menuId);
          if (parent?.id) {
            const res = await axiosInstance.put(
              `${sidebarMenus.update}/${parent.id}`,
              {
                section: parent.section,
                title: parent.title,
                icon: parent.icon,
                path: parent.path,
                order: parent.order,
                is_active: parseIsActive(parent.is_active),
                sub_menus: parent.sub_menus,
              }
            );
            results.push(res.data);
          }
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};
