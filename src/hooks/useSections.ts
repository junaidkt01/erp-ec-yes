//useSections.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import type { ClassItem } from "./useStudentClass";
import { section } from "../api/endpoints";



const SECTIONS_KEY = ["sections"]; 



// Fetch All Sections
export interface SectionItem {
  id: number;
  class_id: string;
  name: string;
  class?: ClassItem;
}

interface SectionsResponse {
  data: SectionItem[];
}

export const useFetchAllStudentClasses = () => {
  return useQuery<SectionItem[]>({
    queryKey: SECTIONS_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<SectionsResponse>(
        `${section.sections}`,
      );
      return res.data.data;
    },
  });
};

// Add Section  api

interface CreateSectionPayload {
  name: string;
  class_id: number | string;
}

export const useAddSection = () => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSectionPayload) => {
      const res = await axiosInstance.post(
        `${section.sections}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SECTIONS_KEY,
      });
    },
  });
};

//update Section api

export interface UpdateSectionPayload {
  id: number;
  name: string;
class_id: number | string;
}

export const useUpdateSection = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateSectionPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${section.sections}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SECTIONS_KEY,
      });
    },
  });
};

//remove class api
export const useRemoveSection = () => {

    const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${section.sections}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SECTIONS_KEY,
      });
    },
  });
};