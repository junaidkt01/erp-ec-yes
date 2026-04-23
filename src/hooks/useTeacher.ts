//useTeacher.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { teacher } from "../api/endpoints";

const TEACHERS_KEY = ["teachers"];

export interface Teacher {
  id: number;
  user_id: number;
  designation: string;
  qualification: string;
  joining_date: string;

  user: {
    id: number;
    branch_id: number | null;
    name: string;
    email: string;
    is_active: number;
  };
}

interface TeachersResponse {
  data: Teacher[];
}

// Fetch All Teachers
export const useFetchAllTeacher = () => {
  return useQuery<Teacher[]>({
    queryKey: TEACHERS_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<TeachersResponse>(
        `${teacher.teachers}`,
      );
      return res.data.data;
    },
  });
};


// Add Teacher  api

interface CreateTeacherPayload {
 name: string;
  email: string;
  designation: string;
  qualification: string;
  joining_date: string;
}

export const useAddSection = () => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTeacherPayload) => {
      const res = await axiosInstance.post(
        `${teacher.teachers}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHERS_KEY,
      });
    },
  });
};

//update Teacher api

export interface UpdateTeacherPayload {
  id: number;
  designation: string;
  qualification: string;
  joining_date: string;
}

export const useUpdateSection = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateTeacherPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${teacher.teachers}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHERS_KEY,
      });
    },
  });
};

//remove class api
export const useRemoveTeacher = () => {

    const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${teacher.teachers}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHERS_KEY,
      });
    },
  });
};


