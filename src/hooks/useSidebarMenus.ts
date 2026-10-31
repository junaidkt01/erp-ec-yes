import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { sidebarMenus } from "../api/endpoints";
import { useAuth, getStoredAuth } from "../auth/useAuth";
import {
  // sidebar_menus,
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
      console.log("sidebars: ", res.data);

      // Handle raw array response or wrapped { data: [...] } response
      if (Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      }

      // Convert the flat items (with `section`) into SidebarMenuGroup[]
      return formatSidebarMenus(rawData);
    },
    enabled: options?.enabled !== undefined ? options.enabled && isLoggedIn : isLoggedIn,
    // placeholderData: sidebar_menus,
  });
};

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

export interface UpdateSidebarMenuPayload {
  section?: string;
  title?: string;
  icon?: string;
  path?: string;
  order?: number;
  is_active?: boolean;
  sub_menus?: SubMenuItem[];
}

export interface UpdateSidebarMenusArgs {
  menus: RawSidebarMenuItem[];
  initialMenus?: RawSidebarMenuItem[];
}

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

export const updateSubMenuStatus = async (
  id: number,
  is_active: boolean
) => {
  const res = await axiosInstance.patch(
    `${sidebarMenus.subMenus}/${id}/status`,
    { is_active }
  );
  return res.data;
};

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
    },
  });
};

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
      // Collect submenus that changed
      const changedSubmenus: { id: number; is_active: boolean }[] = [];

      for (const item of itemsToUpdate) {
        if (!item.id) continue;
        const initial = initialMap.get(item.id);

        const parentChanged =
          !initial ||
          parseIsActive(item.is_active) !== parseIsActive(initial.is_active);

        if (parentChanged) {
          changedParents.push(item);
        }

        const currentSubs = item.sub_menus || [];
        const initialSubs = initial?.sub_menus || [];

        for (const sub of currentSubs) {
          if (!sub.id) continue;
          const initialSub = initialSubs.find(
            (s) => s.id === sub.id || s.title === sub.title
          );
          const subChanged =
            !initialSub ||
            parseIsActive(sub.is_active) !== parseIsActive(initialSub.is_active);

          if (subChanged) {
            changedSubmenus.push({
              id: sub.id,
              is_active: parseIsActive(sub.is_active),
            });
          }
        }
      }

      if (changedParents.length === 0 && changedSubmenus.length === 0) {
        return [];
      }

      const results = [];

      // 1. Update changed parent menus via PUT /api/sidebar-menus/{id}
      for (const item of changedParents) {
        if (!item.id) continue;

        const updateData: UpdateSidebarMenuPayload = {
          section: item.section,
          title: item.title,
          icon: item.icon,
          path: item.path,
          order: item.order,
          is_active: parseIsActive(item.is_active),
        };

        const res = await axiosInstance.put(
          `${sidebarMenus.update}/${item.id}`,
          updateData
        );
        results.push(res.data);
      }

      // 2. Update changed submenus via PATCH /api/sidebar-sub-menus/{id}/status
      for (const sub of changedSubmenus) {
        const res = await axiosInstance.patch(
          `${sidebarMenus.subMenus}/${sub.id}/status`,
          { is_active: sub.is_active }
        );
        results.push(res.data);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
    },
  });
};

