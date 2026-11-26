import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { message } from "../api/endpoints";

export const MESSAGE_KEYS = {
  all: ["messages"] as const,
  list: (params?: any) => [...MESSAGE_KEYS.all, "list", params] as const,
  detail: (id: number | string) => [...MESSAGE_KEYS.all, "detail", id] as const,
};

export interface MessageUser {
  id: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: "Student" | "Teacher" | "Parents" | "Staffs" | string;
  photo?: string | null;
}

export interface MessageRecord {
  id: number | string;
  sender_id: number | string;
  receiver_id: number | string;
  message: string;
  sender?: MessageUser | null;
  receiver?: MessageUser | null;
  read_at?: string | null;
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateMessagePayload {
  sender_id: number | string;
  receiver_id: number | string;
  message: string;
}

export const useFetchAllMessages = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  sender_id?: number | string;
  receiver_id?: number | string;
}) => {
  return useQuery<any>({
    queryKey: MESSAGE_KEYS.list(params),
    queryFn: async () => {
      const res = await axiosInstance.get(message.messages, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMessagePayload) => {
      const res = await axiosInstance.post(message.messages, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.all });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${message.messages}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.all });
    },
  });
};
