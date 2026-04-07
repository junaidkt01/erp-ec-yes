//useStudentClass.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import type { AcademicYear } from "./useAcademicYear";
import { classes } from "../api/endpoints";


const CLASSES_KEY = ["student-classes"]; 

export interface Section {
  id: number;
  class_id: string;
  name: string;
}

// Fetch All Classes
export interface ClassItem {
  id: number;
  name: string;
  branch_id: number;
  academic_year_id: number;
  academic_year: AcademicYear;
}

interface ClassesResponse {
  data: ClassItem[];
}

export const useFetchAllStudentClasses = () => {
  return useQuery<ClassItem[]>({
    queryKey: CLASSES_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<ClassesResponse>(
        `${classes.classes}`,
      );
      return res.data.data;
    },
  });
};

// Add Student class api

interface CreateClassPayload {
  name: string;
  branch_id: string;
  academic_year_id: number;
}

export const useAddStudentClass = () => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateClassPayload) => {
      const res = await axiosInstance.post(
        `${classes.classes}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSES_KEY,
      });
    },
  });
};

//update class api

export interface UpdateClassPayload {
  id: number;
  name: string;
  branch_id: string;
  academic_year_id: string;
}

export const useUpdateStudentClass = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateClassPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${classes.classes}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSES_KEY,
      });
    },
  });
};

//remove class api
export const useRemoveStudentClass = () => {

    const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${classes.classes}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSES_KEY,
      });
    },
  });
};