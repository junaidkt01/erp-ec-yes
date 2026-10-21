import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { sidebarMenus } from "../api/endpoints";
import {
  // sidebar_menus,
  formatSidebarMenus,
  type SidebarMenuGroup,
  type SidebarMenuItem,
  type SubMenuItem,
  type RawSidebarMenuItem,
} from "../utils";

export type { SidebarMenuGroup, SidebarMenuItem, SubMenuItem, RawSidebarMenuItem };
export { formatSidebarMenus };

export const SIDEBAR_MENUS_KEY = ["sidebar-menus"];
export const RAW_SIDEBAR_MENUS_KEY = ["raw-sidebar-menus"];

export interface SidebarMenusApiResponse {
  data?: (RawSidebarMenuItem | SidebarMenuGroup)[];
  [key: string]: any;
}

export type SidebarMenusResponse =
  | SidebarMenusApiResponse
  | (RawSidebarMenuItem | SidebarMenuGroup)[];

export const useSidebarMenus = () => {
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
    // placeholderData: sidebar_menus,
  });
};

export const useFetchRawSidebarMenus = () => {
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
  });
};

export const useUpdateSidebarMenus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RawSidebarMenuItem[] | { items: RawSidebarMenuItem[] } | any) => {
      try {
        const res = await axiosInstance.post(sidebarMenus.update, payload);
        console.log("put res: 01", res, payload, sidebarMenus)
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405 || err?.response?.status === 404) {
          try {
            const res = await axiosInstance.post(sidebarMenus.update, payload);
            console.log("post res: 01", res, payload, sidebarMenus)
            return res.data;
          } catch (postErr: any) {
            if (postErr?.response?.status === 422) {
              const alt = Array.isArray(payload) ? { items: payload } : (payload.items || payload);
              const altRes = await axiosInstance.post(sidebarMenus.items, alt);
              return altRes.data;
            }
            throw postErr;
          }
        }
        if (err?.response?.status === 422) {
          const alt = Array.isArray(payload) ? { items: payload } : (payload.items || payload);
          const altRes = await axiosInstance.post(sidebarMenus.update, alt);
          console.log("alt: ",alt, altRes)
          return altRes.data;
        }
        console.log("alt: error",err)
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
      queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
    },
  });
};

