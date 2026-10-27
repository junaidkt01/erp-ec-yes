// src/hooks/useSubject.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { subject } from "../api/endpoints";

export const SUBJECT_KEY = ["subjects"];

export interface Subject {
  id: number;
  name: string;
  code: string;
  type: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface SubjectsResponse {
  success?: boolean;
  data: Subject[];
  message?: string;
}

// Fetch All Subjects
export const useFetchAllSubjects = (page?: number, search?: string) => {
  return useQuery<any>({
    queryKey: [...SUBJECT_KEY, page, search],
    queryFn: async () => {
      const params: any = {};
      if (page) params.page = page;
      if (search) params.search = search;

      const res = await axiosInstance.get(
        `${subject.subjects}`,
        {
          params: Object.keys(params).length ? params : undefined,
        }
      );
      return res.data?.data ?? res.data;
    },
  });
};

// Add Subject api
export interface CreateSubjectPayload {
  name: string;
  code?: string;
  type: string;
}

export const useAddSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSubjectPayload) => {
      const res = await axiosInstance.post(
        `${subject.subjects}`,
        payload,
      );
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_KEY,
      });
    },
  });
};

// Update Subject api
export interface UpdateSubjectPayload {
  id: number;
  name?: string;
  code?: string;
  type?: string;
}

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatePayload: UpdateSubjectPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${subject.subjects}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_KEY,
      });
    },
  });
};

// Remove Subject api
export const useRemoveSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${subject.subjects}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_KEY,
      });
    },
  });
};



