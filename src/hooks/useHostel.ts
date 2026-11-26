import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { dormitory } from "../api/endpoints";

// Query keys
export const HOSTEL_KEYS = {
  dormitories: ["dormitories"] as const,
  dormitoryDetail: (id: number | string) => ["dormitories", id] as const,
  rooms: ["dormitory-rooms"] as const,
  roomDetail: (id: number | string) => ["dormitory-rooms", id] as const,
  roomTypes: ["room-types"] as const,
  roomTypeDetail: (id: number | string) => ["room-types", id] as const,
};

// ========================
// 1. DORMITORY (HOSTEL)
// ========================
export type DormitoryType = "Boys" | "Girls" | "Mixed";

export interface DormitoryItem {
  id: number | string;
  name: string;
  type: DormitoryType | string;
  address?: string | null;
  intake?: number | string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateDormitoryPayload {
  name: string;
  type: string;
  address?: string;
  intake?: number | string;
  description?: string;
}

export interface UpdateDormitoryPayload extends Partial<CreateDormitoryPayload> {
  id: number | string;
}

export const useFetchAllDormitories = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery<any>({
    queryKey: [...HOSTEL_KEYS.dormitories, params],
    queryFn: async () => {
      const res = await axiosInstance.get(dormitory.dormitories, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useFetchDormitoryById = (id?: number | string) => {
  return useQuery<any>({
    queryKey: HOSTEL_KEYS.dormitoryDetail(id || ""),
    queryFn: async () => {
      const res = await axiosInstance.get(`${dormitory.dormitories}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useAddDormitory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDormitoryPayload) => {
      const res = await axiosInstance.post(dormitory.dormitories, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.dormitories });
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};

export const useUpdateDormitory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateDormitoryPayload) => {
      const res = await axiosInstance.put(`${dormitory.dormitories}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.dormitories });
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};

export const useDeleteDormitory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${dormitory.dormitories}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.dormitories });
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};

// ========================
// 2. ROOM TYPE
// ========================
export interface RoomTypeItem {
  id: number | string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateRoomTypePayload {
  name: string;
  description?: string;
}

export interface UpdateRoomTypePayload extends Partial<CreateRoomTypePayload> {
  id: number | string;
}

export const useFetchAllRoomTypes = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery<any>({
    queryKey: [...HOSTEL_KEYS.roomTypes, params],
    queryFn: async () => {
      const res = await axiosInstance.get(dormitory.roomTypes, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useFetchRoomTypeById = (id?: number | string) => {
  return useQuery<any>({
    queryKey: HOSTEL_KEYS.roomTypeDetail(id || ""),
    queryFn: async () => {
      const res = await axiosInstance.get(`${dormitory.roomTypes}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useAddRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRoomTypePayload) => {
      const res = await axiosInstance.post(dormitory.roomTypes, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.roomTypes });
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};

export const useUpdateRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateRoomTypePayload) => {
      const res = await axiosInstance.put(`${dormitory.roomTypes}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.roomTypes });
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};

export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${dormitory.roomTypes}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.roomTypes });
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};

// ========================
// 3. DORMITORY ROOM
// ========================
export interface DormitoryRoomItem {
  id: number | string;
  dormitory_id: number | string;
  room_number: string;
  room_type_id: number | string;
  number_of_bed: number | string;
  cost_per_bed: number | string;
  description?: string | null;
  dormitory?: DormitoryItem | any;
  room_type?: RoomTypeItem | any;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateDormitoryRoomPayload {
  dormitory_id: number | string;
  room_number: string;
  room_type_id: number | string;
  number_of_bed: number | string;
  cost_per_bed: number | string;
  description?: string;
}

export interface UpdateDormitoryRoomPayload extends Partial<CreateDormitoryRoomPayload> {
  id: number | string;
}

export interface DormitoryRoomFilter {
  page?: number;
  per_page?: number;
  search?: string;
  dormitory_id?: number | string;
  room_type_id?: number | string;
}

export const useFetchAllDormitoryRooms = (filters?: DormitoryRoomFilter) => {
  return useQuery<any>({
    queryKey: [...HOSTEL_KEYS.rooms, filters],
    queryFn: async () => {
      const res = await axiosInstance.get(dormitory.rooms, {
        params: {
          page: filters?.page || undefined,
          per_page: filters?.per_page || undefined,
          search: filters?.search || undefined,
          dormitory_id: filters?.dormitory_id || undefined,
          room_type_id: filters?.room_type_id || undefined,
        },
      });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useFetchDormitoryRoomById = (id?: number | string) => {
  return useQuery<any>({
    queryKey: HOSTEL_KEYS.roomDetail(id || ""),
    queryFn: async () => {
      const res = await axiosInstance.get(`${dormitory.rooms}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useAddDormitoryRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDormitoryRoomPayload) => {
      const res = await axiosInstance.post(dormitory.rooms, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};

export const useUpdateDormitoryRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateDormitoryRoomPayload) => {
      const res = await axiosInstance.put(`${dormitory.rooms}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};

export const useDeleteDormitoryRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${dormitory.rooms}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTEL_KEYS.rooms });
    },
  });
};
