//useExam.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { exam } from "../api/endpoints";


const EXAM_KEY  = ["exams"];

export interface Exam{
 id: number;
  name: string;
  academic_year_id: number;
}

interface ExamResponse {
  data: Exam[];
}

// Fetch All exams

export const useFetchAllExams = () => {
  return useQuery<Exam[]>({
    queryKey: EXAM_KEY,

    queryFn: async () => {
      const res = await axiosInstance.get<ExamResponse>(
        exam.exams
      );

      return res.data.data;
    },
  });
};


// Add exams  api

interface CreateExamPayload  {
   name: string;
  academic_year_id: number;
}


export const useAddExam   = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExamPayload) => {
      const res = await axiosInstance.post(
        exam.exams,
        payload
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EXAM_KEY,
      });
    },
  });
};

//update exams api

interface UpdateExamPayload  {
  id: number;
  name?: string;
  academic_year_id?: number;
}

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateExamPayload) => {
      const { id, ...data } = payload;

      const res = await axiosInstance.put(
        `${exam.exams}/${id}`,
        data
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EXAM_KEY,
      });
    },
  });
};

//remove exams api
export const useRemoveExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`${exam.exams}/${id}`);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EXAM_KEY,
      });
    },
  });
};