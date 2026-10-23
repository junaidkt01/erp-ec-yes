// src/hooks/useSections.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import type { ClassItem } from "./useStudentClass";
import { section } from "../api/endpoints";

export const SECTIONS_KEY = ["sections"];

// Section Interface
export interface SectionItem {
  id: number;
  class_id?: number | string | null;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  class?: ClassItem;
  [key: string]: any;
}

export interface SectionsResponse {
  success?: boolean;
  data: SectionItem[];
  message?: string;
}

// Fetch All Sections
export const useFetchAllSections = (page?: number, search?: string) => {
  return useQuery<any>({
    queryKey: [...SECTIONS_KEY, page, search],
    queryFn: async () => {
      const params: any = {};
      if (page) params.page = page;
      if (search) params.search = search;

      const res = await axiosInstance.get(
        `${section.sections}`,
        {
          params: Object.keys(params).length ? params : undefined,
        }
      );
      // Return res.data.data if present (standard Laravel resource response), else res.data
      return res.data?.data ?? res.data;
    },
  });
};

// Add Section Payload & Hook
export interface CreateSectionPayload {
  name: string;
  class_id?: number | string | null;
}

export const useAddSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSectionPayload) => {
      const res = await axiosInstance.post(
        `${section.sections}`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SECTIONS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["student-classes"],
      });
    },
  });
};

// Update Section Payload & Hook
export interface UpdateSectionPayload {
  id: number | string;
  name: string;
  class_id?: number | string | null;
}

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatePayload: UpdateSectionPayload) => {
      const { id, ...updatedData } = updatePayload;

      try {
        const res = await axiosInstance.put(
          `${section.sections}/${id}`,
          updatedData
        );
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405) {
          const res = await axiosInstance.post(
            `${section.sections}/${id}`,
            updatedData
          );
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SECTIONS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["student-classes"],
      });
    },
  });
};

// Remove Section Hook
export const useRemoveSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(
        `${section.sections}/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SECTIONS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["student-classes"],
      });
    },
  });
};