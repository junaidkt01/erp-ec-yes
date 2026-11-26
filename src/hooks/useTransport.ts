import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { transport } from "../api/endpoints";

// Query keys
export const TRANSPORT_KEYS = {
  routes: ["transport", "routes"] as const,
  routeDetail: (id: number | string) => ["transport", "routes", id] as const,
  vehicles: ["transport", "vehicles"] as const,
  vehicleDetail: (id: number | string) => ["transport", "vehicles", id] as const,
  assignVehicles: ["transport", "assignVehicles"] as const,
};

// ========================
// 1. ROUTE TYPES & HOOKS
// ========================
export interface RouteItem {
  id: number | string;
  title: string;
  fare: number | string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateRoutePayload {
  title: string;
  fare: number | string;
}

export interface UpdateRoutePayload {
  id: number | string;
  title: string;
  fare: number | string;
}

export const useFetchAllRoutes = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery<any>({
    queryKey: [...TRANSPORT_KEYS.routes, params],
    queryFn: async () => {
      const res = await axiosInstance.get(transport.routes, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useFetchRouteById = (id?: number | string) => {
  return useQuery<any>({
    queryKey: TRANSPORT_KEYS.routeDetail(id || ""),
    queryFn: async () => {
      const res = await axiosInstance.get(`${transport.routes}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useAddRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRoutePayload) => {
      const res = await axiosInstance.post(transport.routes, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.routes });
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateRoutePayload) => {
      const res = await axiosInstance.put(`${transport.routes}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.routes });
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${transport.routes}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.routes });
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};

// ========================
// 2. VEHICLE TYPES & HOOKS
// ========================
export interface VehicleItem {
  id: number | string;
  vehicle_no: string;
  vehicle_model?: string;
  model_no?: string;
  year_made: string | number;
  driver_id?: number | string | null;
  driver_name?: string | null;
  driver_contact?: string | null;
  driver_phone?: string | null;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateVehiclePayload {
  vehicle_no: string;
  vehicle_model: string;
  year_made: string | number;
  driver_id?: number | string;
  driver_name?: string;
  driver_contact?: string;
  note?: string;
}

export interface UpdateVehiclePayload extends Partial<CreateVehiclePayload> {
  id: number | string;
}

export const useFetchAllVehicles = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery<any>({
    queryKey: [...TRANSPORT_KEYS.vehicles, params],
    queryFn: async () => {
      const res = await axiosInstance.get(transport.vehicles, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useFetchVehicleById = (id?: number | string) => {
  return useQuery<any>({
    queryKey: TRANSPORT_KEYS.vehicleDetail(id || ""),
    queryFn: async () => {
      const res = await axiosInstance.get(`${transport.vehicles}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useAddVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateVehiclePayload) => {
      const res = await axiosInstance.post(transport.vehicles, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.vehicles });
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateVehiclePayload) => {
      const res = await axiosInstance.put(`${transport.vehicles}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.vehicles });
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${transport.vehicles}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.vehicles });
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};

// ========================
// 3. ASSIGN VEHICLE TYPES & HOOKS
// ========================
export interface AssignVehicleItem {
  id: number | string;
  route_id?: number | string;
  vehicle_id?: number | string;
  route?: any;
  vehicle?: any;
  route_title?: string;
  vehicle_no?: string;
  [key: string]: any;
}

export interface AssignVehicleFilter {
  page?: number;
  per_page?: number;
  route_id?: number | string;
  vehicle_id?: number | string;
  search?: string;
}

export interface CreateAssignVehiclePayload {
  route_id: number | string;
  vehicle_id: number | string;
}

export interface UpdateAssignVehiclePayload {
  id: number | string;
  route_id: number | string;
  vehicle_id: number | string;
}

export const useFetchAllAssignVehicles = (filters?: AssignVehicleFilter) => {
  return useQuery<any>({
    queryKey: [...TRANSPORT_KEYS.assignVehicles, filters],
    queryFn: async () => {
      const res = await axiosInstance.get(transport.assignVehicles, {
        params: {
          page: filters?.page || undefined,
          per_page: filters?.per_page || undefined,
          route_id: filters?.route_id || undefined,
          vehicle_id: filters?.vehicle_id || undefined,
          search: filters?.search || undefined,
        },
      });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddAssignVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAssignVehiclePayload) => {
      const res = await axiosInstance.post(transport.assignVehicles, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};

export const useUpdateAssignVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateAssignVehiclePayload) => {
      const res = await axiosInstance.put(`${transport.assignVehicles}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};

export const useDeleteAssignVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${transport.assignVehicles}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.assignVehicles });
    },
  });
};
