// src/hooks/useTimetable.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { timeTable } from "../api/endpoints";

export const TIMETABLE_KEY = ["timetables"];

export interface TimetableRow {
  id: number;
  class_id: number;
  section_id: number | null;
  subject_id: number;
  teacher_id: number | null;
  day: string;
  start_time: string;
  end_time: string;
  class_name: string;
  section_name: string;
  subject_name: string;
  teacher_name: string;
  raw?: any;
  resolved_class_name?: string;
  resolved_section_name?: string;
  resolved_subject_name?: string;
  resolved_teacher_name?: string;
}

export interface CreateTimetablePayload {
  class_id: number;
  section_id?: number | null;
  subject_id: number;
  teacher_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export interface UpdateTimetablePayload extends CreateTimetablePayload {
  id: number;
}

function extractTeacherName(item: any): string {
  const teacher = item.teacher ?? item.staff ?? {};
  const user = teacher.user ?? item.user ?? {};
  return (
    user.full_name ||
    user.name ||
    teacher.full_name ||
    teacher.name ||
    (teacher.first_name ? `${teacher.first_name} ${teacher.last_name ?? ""}`.trim() : "") ||
    item.teacher_name ||
    (item.teacher_id ? `Teacher #${item.teacher_id}` : "-")
  );
}

function extractSubjectName(item: any): string {
  const subject = item.subject ?? item.subjects ?? {};
  return (
    subject.name ||
    item.subject_name ||
    (item.subject_id ? `Subject #${item.subject_id}` : "-")
  );
}

function extractClassName(item: any, fallbackName?: string): string {
  const cls = item.class ?? item.classes ?? item.student_class ?? item.studentClass ?? {};
  return (
    cls.name ||
    fallbackName ||
    item.class_name ||
    (item.class_id ? `Class ${item.class_id}` : "-")
  );
}

function extractSectionName(item: any, fallbackName?: string): string {
  const sec = item.section ?? item.sections ?? {};
  return (
    sec.name ||
    fallbackName ||
    item.section_name ||
    (item.section_id ? `Section ${item.section_id}` : "-")
  );
}

function flattenTimetableResponse(data: any): TimetableRow[] {
  if (!data) return [];

  // Handle nested: classes → sections → timetables or flat list
  const classesList: any[] = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.timetables)
    ? data.timetables
    : Array.isArray(data)
    ? data
    : [];

  const rows: TimetableRow[] = [];

  for (const cls of classesList) {
    // If it already looks like a flat timetable entry
    if (cls.day !== undefined || cls.start_time !== undefined || (cls.class_id !== undefined && cls.subject_id !== undefined)) {
      rows.push({
        id: cls.id,
        class_id: cls.class_id,
        section_id: cls.section_id ?? null,
        subject_id: cls.subject_id,
        teacher_id: cls.teacher_id ?? null,
        day: cls.day ?? "-",
        start_time: cls.start_time ?? "-",
        end_time: cls.end_time ?? "-",
        class_name: extractClassName(cls),
        section_name: extractSectionName(cls),
        subject_name: extractSubjectName(cls),
        teacher_name: extractTeacherName(cls),
        raw: cls,
      });
      continue;
    }

    const parentClassName = cls.name || (cls.id ? `Class ${cls.id}` : "-");

    // Check direct timetables on class
    const directTimetables: any[] = Array.isArray(cls.timetables)
      ? cls.timetables
      : Array.isArray(cls.time_tables)
      ? cls.time_tables
      : Array.isArray(cls.class_timetables)
      ? cls.class_timetables
      : [];

    for (const tt of directTimetables) {
      rows.push({
        id: tt.id,
        class_id: tt.class_id ?? cls.id,
        section_id: tt.section_id ?? null,
        subject_id: tt.subject_id,
        teacher_id: tt.teacher_id ?? null,
        day: tt.day ?? "-",
        start_time: tt.start_time ?? "-",
        end_time: tt.end_time ?? "-",
        class_name: parentClassName,
        section_name: extractSectionName(tt),
        subject_name: extractSubjectName(tt),
        teacher_name: extractTeacherName(tt),
        raw: tt,
      });
    }

    // Nested: sections → timetables
    const sections: any[] = Array.isArray(cls.sections) ? cls.sections : [];
    for (const sec of sections) {
      const sectionName = sec.name || (sec.id ? `Section ${sec.id}` : "-");
      const timetables: any[] = Array.isArray(sec.timetables)
        ? sec.timetables
        : Array.isArray(sec.time_tables)
        ? sec.time_tables
        : Array.isArray(sec.class_timetables)
        ? sec.class_timetables
        : Array.isArray(sec.class_time_tables)
        ? sec.class_time_tables
        : [];

      for (const tt of timetables) {
        rows.push({
          id: tt.id,
          class_id: tt.class_id ?? cls.id,
          section_id: tt.section_id ?? sec.id,
          subject_id: tt.subject_id,
          teacher_id: tt.teacher_id ?? null,
          day: tt.day ?? "-",
          start_time: tt.start_time ?? "-",
          end_time: tt.end_time ?? "-",
          class_name: parentClassName,
          section_name: sectionName,
          subject_name: extractSubjectName(tt),
          teacher_name: extractTeacherName(tt),
          raw: tt,
        });
      }
    }
  }

  return rows;
}

export interface FetchTimetablesParams {
  class_id?: number | string | null;
  section_id?: number | string | null;
  teacher_id?: number | string | null;
  subject_id?: number | string | null;
  day?: string | null;
}

// GET /api/timetables
export const useFetchAllTimetables = (params?: FetchTimetablesParams) => {
  return useQuery<TimetableRow[]>({
    queryKey: [
      ...TIMETABLE_KEY,
      params?.class_id,
      params?.section_id,
      params?.teacher_id,
      params?.subject_id,
      params?.day,
    ],
    queryFn: async () => {
      const cleanParams: Record<string, any> = {};
      if (params?.class_id) cleanParams.class_id = params.class_id;
      if (params?.section_id) cleanParams.section_id = params.section_id;
      if (params?.teacher_id) cleanParams.teacher_id = params.teacher_id;
      if (params?.subject_id) cleanParams.subject_id = params.subject_id;
      if (params?.day) cleanParams.day = params.day;

      const res = await axiosInstance.get<any>(timeTable.timetables, {
        params: Object.keys(cleanParams).length ? cleanParams : undefined,
      });
      return flattenTimetableResponse(res.data);
    },
  });
};

// GET /api/timetables/{id}
export const useFetchTimetableById = (id: number | null | undefined) => {
  return useQuery({
    queryKey: [...TIMETABLE_KEY, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await axiosInstance.get(`/timetables/${id}`);
      return res.data?.data ?? res.data;
    },
    enabled: !!id,
  });
};

// POST /api/timetables
export const useCreateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTimetablePayload) => {
      const res = await axiosInstance.post("/timetables", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMETABLE_KEY });
    },
  });
};

// PUT /api/timetables/{id}
export const useUpdateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateTimetablePayload) => {
      const { id, ...data } = payload;
      try {
        const res = await axiosInstance.put(`/timetables/${id}`, data);
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405) {
          const res = await axiosInstance.post(`/timetables/${id}`, data);
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TIMETABLE_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: [...TIMETABLE_KEY, "detail", variables.id],
        });
      }
    },
  });
};

// DELETE /api/timetables/{id}
export const useDeleteTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`/timetables/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMETABLE_KEY });
    },
  });
};
