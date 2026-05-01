//useStudentCategory.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { studentCategory } from "../api/endpoints";

const STUDENT_CATEGORY_KEY = ["student-categories"];

interface StudentCategory {
  id: number;
  name: string;
  description: string | null;
}

interface StudentCategoryResponse {
  data: StudentCategory[];
}
 

// Fetch All StudentCategories

export const useFetchAllStudentCategories = () => {
  return useQuery<StudentCategory[]>({
    queryKey: STUDENT_CATEGORY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<StudentCategoryResponse>(
        `${studentCategory.student_Categories}`,
      );

      return res.data.data;
    },
  });
};

// Add  StudentCategorie

interface CreateStudentCategoryPayload {
  name: string;
  description?: string;
}

export const useAddStudentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentCategoryPayload) => {
      const res = await axiosInstance.post(
        studentCategory.student_Categories,
        payload,
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

// update  StudentCategorie

interface UpdateStudentCategoryPayload {
  id: number;
  name?: string;
  description?: string;
}

export const useUpdateStudentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateStudentCategoryPayload) => {
      const { id, ...data } = payload;
      const res = await axiosInstance.put(
        `${studentCategory.student_Categories}/${id}`,
        data,
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

// remove  StudentCategorie

export const useRemoveStudentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
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