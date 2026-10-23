// src/hooks/useStudentClass.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import type { AcademicYear } from "./useAcademicYear";
import type { SectionItem } from "./useSections";
import { classes } from "../api/endpoints";

export const CLASSES_KEY = ["student-classes"];

export interface StudentCategoryInfo {
  id: number;
  name: string;
  [key: string]: any;
}

export interface ClassItem {
  id: number;
  name: string;
  branch_id?: number | null;
  academic_year_id?: number | null;
  category_id?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  academic_year?: AcademicYear | null;
  category?: StudentCategoryInfo | null;
  sections?: SectionItem[];
  [key: string]: any;
}

export interface ClassesResponse {
  success?: boolean;
  data: ClassItem[];
  message?: string;
}

// Fetch All Student Classes
export const useFetchAllStudentClasses = (page?: number, search?: string) => {
  return useQuery<any>({
    queryKey: [...CLASSES_KEY, page, search],
    queryFn: async () => {
      const params: any = {};
      if (page) params.page = page;
      if (search) params.search = search;

      const res = await axiosInstance.get(
        `${classes.classes}`,
        {
          params: Object.keys(params).length ? params : undefined,
        }
      );
      return res.data?.data ?? res.data;
    },
  });
};

// Add Student Class Payload & Hook
export interface CreateClassPayload {
  name: string;
  branch_id?: number | string | null;
  academic_year_id?: number | string | null;
  category_id?: number | string | null;
  sections?: (number | string)[];
  section_ids?: (number | string)[];
  [key: string]: any;
}

export const useAddStudentClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateClassPayload) => {
      const res = await axiosInstance.post(
        `${classes.classes}`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSES_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["sections"],
      });
    },
  });
};

// Update Student Class Payload & Hook
export interface UpdateClassPayload extends Partial<CreateClassPayload> {
  id: number | string;
}

export const useUpdateStudentClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatePayload: UpdateClassPayload) => {
      const { id, ...updatedData } = updatePayload;

      try {
        const res = await axiosInstance.put(
          `${classes.classes}/${id}`,
          updatedData
        );
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405) {
          const res = await axiosInstance.post(
            `${classes.classes}/${id}`,
            updatedData
          );
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSES_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["sections"],
      });
    },
  });
};

// Remove Student Class Hook
export const useRemoveStudentClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(
        `${classes.classes}/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSES_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["sections"],
      });
    },
  });
};