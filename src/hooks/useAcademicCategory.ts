// src/hooks/useAcademicCategory.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { academicCategory } from "../api/endpoints";

export const ACADEMIC_CATEGORY_KEY = ["academic-categories"];

export interface AcademicCategory {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  [key: string]: any;
}

export interface AcademicCategoryResponse {
  success?: boolean;
  data: AcademicCategory[] | { data: AcademicCategory[]; [key: string]: any };
  message?: string;
  [key: string]: any;
}

// Fetch All AcademicCategories
export const useFetchAllAcademicCategories = (page?: number, search?: string) => {
  return useQuery<any>({
    queryKey: [...ACADEMIC_CATEGORY_KEY, page, search],
    queryFn: async () => {
      const params: any = {};
      if (page) params.page = page;
      if (search) params.search = search;

      const res = await axiosInstance.get(
        `${academicCategory.academic_Categories}`,
        {
          params: Object.keys(params).length ? params : undefined,
        }
      );

      return res.data;
    },
  });
};

// Add AcademicCategory
export interface CreateAcademicCategoryPayload {
  name: string;
  description?: string;
}

export const useAddAcademicCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAcademicCategoryPayload) => {
      const res = await axiosInstance.post(
        academicCategory.academic_Categories,
        payload
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_CATEGORY_KEY,
      });
    },
  });
};

// Update AcademicCategory
export interface UpdateAcademicCategoryPayload {
  id: number | string;
  name?: string;
  description?: string;
}

export const useUpdateAcademicCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAcademicCategoryPayload) => {
      const { id, ...data } = payload;
      try {
        const res = await axiosInstance.put(
          `${academicCategory.academic_Categories}/${id}`,
          data
        );
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405) {
          const res = await axiosInstance.post(
            `${academicCategory.academic_Categories}/${id}`,
            data
          );
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_CATEGORY_KEY,
      });
    },
  });
};

// Remove AcademicCategory
export const useRemoveAcademicCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(
        `${academicCategory.academic_Categories}/${id}`
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_CATEGORY_KEY,
      });
    },
  });
};