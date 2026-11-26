import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { notification } from "../api/endpoints";

export const NOTIFICATIONS_KEY = ["notifications"];

export interface NotificationRecord {
  id: number | string;
  user_id?: number | string | null;
  user?: {
    id: number | string;
    name?: string;
    full_name?: string;
    email?: string;
  } | null;
  title: string;
  message: string;
  read_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateNotificationPayload {
  user_id?: number | string | null;
  title: string;
  message: string;
}

export const useFetchAllNotifications = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery<any>({
    queryKey: [...NOTIFICATIONS_KEY, params],
    queryFn: async () => {
      const res = await axiosInstance.get(notification.notifications, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateNotificationPayload) => {
      const res = await axiosInstance.post(notification.notifications, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${notification.notifications}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};
