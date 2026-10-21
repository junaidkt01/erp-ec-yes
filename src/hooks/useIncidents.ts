import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { incident } from "../api/endpoints";

export const INCIDENTS_KEY = ["incidents"];

export interface Incident {
  id: number | string;
  title: string;
  point: number;
  is_negative: boolean | number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateIncidentPayload {
  title: string;
  point: number;
  is_negative: boolean;
  description: string;
}

export interface UpdateIncidentPayload extends CreateIncidentPayload {
  id: number | string;
}

// Fetch all incidents with pagination and optional search filter
export const useFetchAllIncidents = (page = 1, search = "") => {
  return useQuery<any>({
    queryKey: [...INCIDENTS_KEY, page, search],
    queryFn: async () => {
      const res = await axiosInstance.get<any>(incident.incidents, {
        params: {
          page,
          search: search || undefined,
        },
      });
      return res.data;
    },
    placeholderData: (prev:any) => prev,
  });
};

// Add new incident
export const useAddIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateIncidentPayload) => {
      const res = await axiosInstance.post(incident.incidents, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INCIDENTS_KEY,
      });
    },
  });
};

// Update existing incident
export const useUpdateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateIncidentPayload) => {
      const { id, ...data } = payload;
      try {
        const res = await axiosInstance.put(`${incident.incidents}/${id}`, data);
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405) {
          const res = await axiosInstance.post(`${incident.incidents}/${id}`, data);
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INCIDENTS_KEY,
      });
    },
  });
};

// Delete incident
export const useRemoveIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${incident.incidents}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INCIDENTS_KEY,
      });
    },
  });
};
