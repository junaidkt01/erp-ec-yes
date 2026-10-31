import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { homework } from "../api/endpoints";

export const HOMEWORK_KEY = ["homeworks"];
export const HOMEWORK_REPORT_KEY = ["homework-report"];
export const EVALUATION_SUMMARY_KEY = ["evaluation-summary"];

export interface HomeworkItem {
  id: number;
  class_id: number;
  section_id: number;
  subject_id: number;
  homework_date: string;
  submission_date: string;
  evaluation_date?: string | null;
  marks: number;
  description: string;
  file?: string | null;
  file_url?: string | null;
  created_by?: string | { id: number; name: string } | any;
  class?: { id: number; name: string; [key: string]: any };
  section?: { id: number; name: string; [key: string]: any };
  subject?: { id: number; name: string; [key: string]: any };
  status?: string;
  submissions_count?: number;
  evaluated_count?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface HomeworkFilterParams {
  class_id?: number | string;
  section_id?: number | string;
  subject_id?: number | string;
  homework_date?: string;
  submission_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface HomeworkListResponse {
  success?: boolean;
  data: HomeworkItem[] | { data: HomeworkItem[]; meta?: any; last_page?: number; total?: number; [key: string]: any };
  meta?: any;
  message?: string;
  [key: string]: any;
}

export interface CreateHomeworkPayload {
  class_id: number | string;
  section_id: number | string;
  subject_id: number | string;
  homework_date: string;
  submission_date: string;
  marks: number | string;
  description: string;
  file?: File | null;
}

export interface UpdateHomeworkPayload {
  id: number | string;
  class_id?: number | string;
  section_id?: number | string;
  subject_id?: number | string;
  homework_date?: string;
  submission_date?: string;
  marks?: number | string;
  description?: string;
  file?: File | null;
}

export interface HomeworkReportFilterParams {
  class_id?: number | string;
  section_id?: number | string;
  subject_id?: number | string;
  homework_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface HomeworkReportItem {
  id?: number | string;
  submission_id?: number | string;
  student_id: number | string;
  student?: {
    id: number;
    full_name?: string;
    name?: string;
    admission_no?: string;
    roll_no?: string;
    photo?: string;
    [key: string]: any;
  };
  student_name?: string;
  admission_no?: string;
  roll_no?: string;
  homework_id?: number | string;
  homework?: HomeworkItem;
  status?: string;
  marks?: number | null;
  submission_date?: string;
  evaluation_date?: string | null;
  evaluated_by?: string | any;
  document?: string | null;
  description?: string | null;
  [key: string]: any;
}

export interface EvaluateHomeworkPayload {
  id: number | string; // homework_id
  student_id: number | string;
  marks: number | string;
  description?: string;
  status?: "completed" | "evaluated" | string;
}

// 1. GET /api/homeworks - List all homework assignments
export const useFetchAllHomeworks = (params: HomeworkFilterParams = {}) => {
  return useQuery<any>({
    queryKey: [...HOMEWORK_KEY, params],
    queryFn: async () => {
      const cleanParams: Record<string, any> = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== null) {
          cleanParams[k] = v;
        }
      });

      const res = await axiosInstance.get(homework.homeworks, {
        params: Object.keys(cleanParams).length ? cleanParams : undefined,
      });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

// 2. GET /api/homeworks/{id} - Get homework details by ID
export const useFetchHomeworkById = (id?: number | string, enabled = true) => {
  return useQuery<any>({
    queryKey: [...HOMEWORK_KEY, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await axiosInstance.get(`${homework.homeworks}/${id}`);
      return res.data?.data ?? res.data;
    },
    enabled: Boolean(id) && enabled,
  });
};

// 3. POST /api/homeworks - Create a new homework assignment
export const useCreateHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateHomeworkPayload) => {
      const formData = new FormData();
      formData.append("class_id", String(payload.class_id));
      formData.append("section_id", String(payload.section_id));
      formData.append("subject_id", String(payload.subject_id));
      formData.append("homework_date", payload.homework_date);
      formData.append("submission_date", payload.submission_date);
      formData.append("marks", String(payload.marks));
      formData.append("description", payload.description);

      if (payload.file instanceof File) {
        formData.append("file", payload.file);
      }

      const res = await axiosInstance.post(homework.homeworks, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOMEWORK_KEY });
      queryClient.invalidateQueries({ queryKey: HOMEWORK_REPORT_KEY });
    },
  });
};

// 4. POST /api/homeworks/{id} - Update homework details
export const useUpdateHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateHomeworkPayload) => {
      const { id, ...rest } = payload;
      const formData = new FormData();

      if (rest.class_id !== undefined) formData.append("class_id", String(rest.class_id));
      if (rest.section_id !== undefined) formData.append("section_id", String(rest.section_id));
      if (rest.subject_id !== undefined) formData.append("subject_id", String(rest.subject_id));
      if (rest.homework_date) formData.append("homework_date", rest.homework_date);
      if (rest.submission_date) formData.append("submission_date", rest.submission_date);
      if (rest.marks !== undefined) formData.append("marks", String(rest.marks));
      if (rest.description !== undefined) formData.append("description", rest.description);

      if (rest.file instanceof File) {
        formData.append("file", rest.file);
      }

      const res = await axiosInstance.post(`${homework.homeworks}/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HOMEWORK_KEY });
      queryClient.invalidateQueries({ queryKey: [...HOMEWORK_KEY, "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: HOMEWORK_REPORT_KEY });
    },
  });
};

// 5. DELETE /api/homeworks/{id} - Delete a homework assignment
export const useDeleteHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${homework.homeworks}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOMEWORK_KEY });
      queryClient.invalidateQueries({ queryKey: HOMEWORK_REPORT_KEY });
    },
  });
};

// 6. GET /api/homework-report - Get Homework Report List (Student-wise)
export const useFetchHomeworkReport = (params: HomeworkReportFilterParams = {}) => {
  return useQuery<any>({
    queryKey: [...HOMEWORK_REPORT_KEY, params],
    queryFn: async () => {
      const cleanParams: Record<string, any> = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== null) {
          cleanParams[k] = v;
        }
      });

      const res = await axiosInstance.get(homework.report, {
        params: Object.keys(cleanParams).length ? cleanParams : undefined,
      });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

// 7. GET /api/homework-report/evaluation/{submission_id} - Get Evaluation Summary modal details
export const useFetchEvaluationSummary = (submissionId?: number | string, enabled = true) => {
  return useQuery<any>({
    queryKey: [...EVALUATION_SUMMARY_KEY, submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const res = await axiosInstance.get(`${homework.evaluation}/${submissionId}`);
      return res.data?.data ?? res.data;
    },
    enabled: Boolean(submissionId) && enabled,
  });
};

// 8. POST /api/homeworks/{id}/evaluate - Evaluate a student's homework submission
export const useEvaluateHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EvaluateHomeworkPayload) => {
      const { id, ...data } = payload;
      const res = await axiosInstance.post(homework.evaluate(id), {
        student_id: Number(data.student_id),
        marks: Number(data.marks),
        description: data.description || "",
        status: data.status || "completed",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOMEWORK_KEY });
      queryClient.invalidateQueries({ queryKey: HOMEWORK_REPORT_KEY });
      queryClient.invalidateQueries({ queryKey: EVALUATION_SUMMARY_KEY });
    },
  });
};
