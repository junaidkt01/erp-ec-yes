// src/hooks/useStudentCategory.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { studentCategory } from "../api/endpoints";

export const STUDENT_CATEGORY_KEY = ["student-categories"];

export interface StudentCategory {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  [key: string]: any;
}

export interface StudentCategoryResponse {
  success?: boolean;
  data: StudentCategory[] | { data: StudentCategory[]; [key: string]: any };
  message?: string;
  [key: string]: any;
}

// Fetch All StudentCategories
export const useFetchAllStudentCategories = (page?: number, search?: string) => {
  return useQuery<any>({
    queryKey: [...STUDENT_CATEGORY_KEY, page, search],
    queryFn: async () => {
      const params: any = {};
      if (page) params.page = page;
      if (search) params.search = search;

      const res = await axiosInstance.get(
        `${studentCategory.student_Categories}`,
        {
          params: Object.keys(params).length ? params : undefined,
        }
      );

      return res.data;
    },
  });
};

// Add StudentCategory
export interface CreateStudentCategoryPayload {
  name: string;
  description?: string;
}

export const useAddStudentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentCategoryPayload) => {
      const res = await axiosInstance.post(
        studentCategory.student_Categories,
        payload
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_CATEGORY_KEY,
      });
    },
  });
};

// Update StudentCategory
export interface UpdateStudentCategoryPayload {
  id: number | string;
  name?: string;
  description?: string;
}

export const useUpdateStudentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateStudentCategoryPayload) => {
      const { id, ...data } = payload;
      try {
        const res = await axiosInstance.put(
          `${studentCategory.student_Categories}/${id}`,
          data
        );
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405) {
          const res = await axiosInstance.post(
            `${studentCategory.student_Categories}/${id}`,
            data
          );
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_CATEGORY_KEY,
      });
    },
  });
};

// Remove StudentCategory
export const useRemoveStudentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(
        `${studentCategory.student_Categories}/${id}`
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_CATEGORY_KEY,
      });
    },
  });
};