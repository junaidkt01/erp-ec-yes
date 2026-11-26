import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { exam } from "../api/endpoints";

export const EXAM_KEYS = {
  all: ["exams"] as const,
  types: ["exam_types"] as const,
  typeDetail: (id: number | string) => ["exam_types", id] as const,
  setups: ["exam_setups"] as const,
  setupDetail: (id: number | string) => ["exam_setups", id] as const,
  schedules: ["exam_schedules"] as const,
  scheduleDetail: (id: number | string) => ["exam_schedules", id] as const,
  attendances: ["exam_attendances"] as const,
  marks: ["exam_marks"] as const,
  results: ["exam_results"] as const,
  grades: ["mark_grades"] as const,
  gradeDetail: (id: number | string) => ["mark_grades", id] as const,
};

// ==========================================
// 1. EXAM TYPE (/api/exam-types)
// ==========================================
export interface ExamTypeItem {
  id: number | string;
  name: string;
  is_group?: boolean;
  status?: boolean;
  average_passing_examination?: boolean;
  average_mark?: number | string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateExamTypePayload {
  name: string;
  is_group?: boolean;
  status?: boolean;
  average_passing_examination?: boolean;
  average_mark?: number | string | null;
}

export const useFetchAllExamTypes = (params?: any) => {
  return useQuery<any>({
    queryKey: [...EXAM_KEYS.types, params],
    queryFn: async () => {
      const res = await axiosInstance.get(exam.examTypes, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExamTypePayload) => {
      const res = await axiosInstance.post(exam.examTypes, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.types });
    },
  });
};

export const useUpdateExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number | string } & Partial<CreateExamTypePayload>) => {
      const res = await axiosInstance.put(`${exam.examTypes}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.types });
    },
  });
};

export const useDeleteExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${exam.examTypes}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.types });
    },
  });
};

// ==========================================
// 2. EXAM SETUP (/api/exam-setups)
// ==========================================
export interface MarkDistributionItem {
  title: string;
  mark: number | string;
}

export interface CreateExamSetupPayload {
  exam_title: string;
  exam_type_id: number | string;
  class_id: number | string;
  section_id: number | string;
  subject_id: number | string;
  teacher_id?: number | string;
  pass_mark?: number | string;
  total_mark?: number | string;
  mark_distributions: MarkDistributionItem[];
}

export const useFetchAllExamSetups = (params?: any) => {
  return useQuery<any>({
    queryKey: [...EXAM_KEYS.setups, params],
    queryFn: async () => {
      const res = await axiosInstance.get(exam.examSetups, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddExamSetup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExamSetupPayload) => {
      const res = await axiosInstance.post(exam.examSetups, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.setups });
    },
  });
};

export const useUpdateExamSetup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number | string } & Partial<CreateExamSetupPayload>) => {
      const res = await axiosInstance.put(`${exam.examSetups}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.setups });
    },
  });
};

export const useDeleteExamSetup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${exam.examSetups}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.setups });
    },
  });
};

// ==========================================
// 3. EXAM SCHEDULE (/api/exam-schedules)
// ==========================================
export interface CreateExamSchedulePayload {
  exam_id: number | string;
  class_id: number | string;
  section_id: number | string;
  subject_id: number | string;
  teacher_id?: number | string;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration?: string;
  room?: string;
}

export const useFetchAllExamSchedules = (params?: any) => {
  return useQuery<any>({
    queryKey: [...EXAM_KEYS.schedules, params],
    queryFn: async () => {
      const res = await axiosInstance.get(exam.examSchedules, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddExamSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExamSchedulePayload) => {
      const res = await axiosInstance.post(exam.examSchedules, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.schedules });
    },
  });
};

export const useDeleteExamSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${exam.examSchedules}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.schedules });
    },
  });
};

// ==========================================
// 4. EXAM ATTENDANCE (/api/exam-attendances)
// ==========================================
export interface StudentExamAttendanceEntry {
  student_id: number | string;
  status: "P" | "A" | "L" | "Present" | "Absent" | string;
  note?: string;
}

export interface StoreExamAttendancePayload {
  exam_id: number | string;
  class_id: number | string;
  section_id: number | string;
  subject_id: number | string;
  date?: string;
  attendances: StudentExamAttendanceEntry[];
}

export const useFetchExamAttendances = (params?: any) => {
  return useQuery<any>({
    queryKey: [...EXAM_KEYS.attendances, params],
    queryFn: async () => {
      const res = await axiosInstance.get(exam.examAttendances, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useStoreExamAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StoreExamAttendancePayload) => {
      const res = await axiosInstance.post(exam.examAttendances, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.attendances });
    },
  });
};

// ==========================================
// 5. MARK REGISTER / EXAM MARKS (/api/exam-marks)
// ==========================================
export interface StudentMarkEntry {
  student_id: number | string;
  marks_distribution?: Record<string, number | string>;
  total_marks?: number | string;
  grade?: string;
  gpa?: number | string;
  is_absent?: boolean;
  remarks?: string;
}

export interface StoreExamMarksPayload {
  exam_id: number | string;
  class_id: number | string;
  section_id: number | string;
  subject_id: number | string;
  exam_setup_id?: number | string;
  marks: StudentMarkEntry[];
}

export const useFetchExamMarks = (params?: any) => {
  return useQuery<any>({
    queryKey: [...EXAM_KEYS.marks, params],
    queryFn: async () => {
      const res = await axiosInstance.get(exam.examMarks, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useStoreExamMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StoreExamMarksPayload) => {
      const res = await axiosInstance.post(exam.examMarks, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.marks });
    },
  });
};

// ==========================================
// 6. MARK GRADE (/api/mark-grades)
// ==========================================
export interface MarkGradeItem {
  id: number | string;
  grade_name: string;
  gpa: number | string;
  percent_from: number | string;
  percent_to: number | string;
  gpa_from: number | string;
  gpa_to: number | string;
  description?: string;
}

export interface CreateMarkGradePayload {
  grade_name: string;
  gpa: number | string;
  percent_from: number | string;
  percent_to: number | string;
  gpa_from: number | string;
  gpa_to: number | string;
  description?: string;
}

export const useFetchMarkGrades = (params?: any) => {
  return useQuery<any>({
    queryKey: [...EXAM_KEYS.grades, params],
    queryFn: async () => {
      const res = await axiosInstance.get(exam.markGrades, { params });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useAddMarkGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMarkGradePayload) => {
      const res = await axiosInstance.post(exam.markGrades, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.grades });
    },
  });
};

export const useUpdateMarkGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number | string } & Partial<CreateMarkGradePayload>) => {
      const res = await axiosInstance.put(`${exam.markGrades}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.grades });
    },
  });
};

export const useDeleteMarkGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${exam.markGrades}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.grades });
    },
  });
};

// ==========================================
// 7. SEND MARKS VIA SMS (/api/exams/send-marks-sms)
// ==========================================
export interface SendMarksSmsPayload {
  exam_id: number | string;
  class_id: number | string;
  receiver: "students" | "parents" | "all" | string;
  custom_message?: string;
}

export const useSendMarksSms = () => {
  return useMutation({
    mutationFn: async (payload: SendMarksSmsPayload) => {
      const res = await axiosInstance.post(exam.sendMarksSms, payload);
      return res.data;
    },
  });
};

// ==========================================
// 8. EXAM RESULTS (/api/exam-results)
// ==========================================
export interface CreateExamResultPayload {
  student_id: number | string;
  exam_id: number | string;
  subject_id: number | string;
  marks: string | number;
}

export const useStoreExamResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExamResultPayload) => {
      const res = await axiosInstance.post(exam.examResults, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_KEYS.results });
    },
  });
};
