// src/hooks/useEvents.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { events } from "../api/endpoints";

export const EVENTS_KEY = ["events"];

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  role: string;
  location: string;
  url?: string | null;
  color?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface EventsResponse {
  success?: boolean;
  data: CalendarEvent[];
  message?: string;
}

export interface SingleEventResponse {
  success?: boolean;
  data: CalendarEvent;
  message?: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  role: string;
  location: string;
  url?: string | null;
  color?: string | null;
}

export interface UpdateEventPayload {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  role: string;
  location: string;
  url?: string | null;
  color?: string | null;
}

// 1. GET: Fetch list of events (supports optional start & end query params)
export const getEventsApi = async (params?: { start?: string; end?: string }): Promise<CalendarEvent[]> => {
  const res = await axiosInstance.get(events.events, {
    params: params && Object.keys(params).length ? params : undefined,
  });
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data : [];
};

export const useFetchEvents = (start?: string, end?: string) => {
  return useQuery<CalendarEvent[]>({
    queryKey: [...EVENTS_KEY, start, end],
    queryFn: () => getEventsApi({ start, end }),
  });
};

// 2. GET by ID: Fetch specific event details
export const getEventByIdApi = async (id: number): Promise<CalendarEvent> => {
  const res = await axiosInstance.get(`${events.events}/${id}`);
  return res.data?.data ?? res.data;
};

export const useFetchEventById = (id?: number | null, enabled: boolean = true) => {
  return useQuery<CalendarEvent>({
    queryKey: [...EVENTS_KEY, "detail", id],
    queryFn: () => getEventByIdApi(id!),
    enabled: !!id && enabled,
  });
};

// 3. POST: Store new calendar event
export const createEventApi = async (payload: CreateEventPayload) => {
  const res = await axiosInstance.post(events.events, payload);
  return res.data?.data ?? res.data;
};

export const useAddEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEventApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EVENTS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};

// 4. PUT: Update existing calendar event
export const updateEventApi = async (updatePayload: UpdateEventPayload) => {
  const { id, ...data } = updatePayload;
  const res = await axiosInstance.put(`${events.events}/${id}`, data);
  return res.data?.data ?? res.data;
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventPayload) => updateEventApi(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: EVENTS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [...EVENTS_KEY, "detail", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};

// 5. DELETE: Delete existing calendar event
export const deleteEventApi = async (id: number) => {
  const res = await axiosInstance.delete(`${events.events}/${id}`);
  return res.data;
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteEventApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EVENTS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};
