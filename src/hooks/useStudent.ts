//useStudent.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import {  student } from "../api/endpoints";

const STUDENTS_KEY = ["students"];

export interface Student {
  id: number;
  admission_no: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: string;
  phone: string;
  email: string;
  class_id: number;
  section_id: number;

  class: {
    id: number;
    name: string;
  };

  section: {
    id: number;
    name: string;
  };
}

interface Pagination<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
  last_page: number;
};

interface StudentsResponse {
data: Pagination<Student>;
}

// Fetch All Students
export const useFetchAllStudents = (page: number = 1) => {
  return useQuery<Pagination<Student>>({
    queryKey: [...STUDENTS_KEY, page],
    queryFn: async () => {
      const res = await axiosInstance.get<StudentsResponse>(
        `${student.students}?page=${page}`,
      );
      return res.data.data;
    },
    
 placeholderData: (previousData) => previousData, //keep previous data, show skeleton data,show partial data
  });
};

// Add Student  api

interface CreateStudentPayload {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  class_id: number;
  section_id: number;
};

export const useAddStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentPayload) => {
      const res = await axiosInstance.post(`${student.students}`, payload);
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENTS_KEY,
      });
    },
  });
};

//update Student api

export interface UpdateStudentPayload {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  class_id: number;
  section_id: number;
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateStudentPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${student.students}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENTS_KEY,
      });
    },
  });
};

//remove class api
export const useRemoveStudent  = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`${student.students}/${id}`);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENTS_KEY,
      });
    },
  });
};
