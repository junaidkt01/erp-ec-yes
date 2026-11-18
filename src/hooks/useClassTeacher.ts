// src/hooks/useClassTeacher.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { classTeacher } from "../api/endpoints";

export const CLASS_TEACHERS_KEY = ["class-teachers"];

// A single row: one class_teachers record with its teacher detail
export interface ClassTeacherRow {
  id: number;             // class_teachers.id (used for DELETE)
  class_id: number;
  section_id: number;
  teacher_id: number;
  class_name: string;
  section_name: string;
  teacher_name: string;
  teacher_staff_code?: string | null;
  teacher_photo?: string | null;
  [key: string]: any;
}

export interface AssignClassTeacherPayload {
  class_id: number;
  section_id: number;
  teacher_ids: number[];
}

// ─── Helper: flatten nested API response ────────────────────────────────────
// Response shape:  { data: [ { id, name, sections: [ { id, name, class_teachers: [...] } ] } ] }
export function flattenClassTeacherResponse(rawData: any[]): ClassTeacherRow[] {
  const rows: ClassTeacherRow[] = [];
  for (const cls of rawData) {
    const className: string = cls.name || `Class ${cls.id}`;
    for (const section of cls.sections ?? []) {
      const sectionName: string = section.name || `Section ${section.id}`;
      for (const ct of section.class_teachers ?? []) {
        const teacher = ct.teacher ?? {};
        const user = teacher.user ?? {};
        rows.push({
          id: ct.id,
          class_id: cls.id,
          section_id: section.id,
          teacher_id: ct.teacher_id,
          class_name: className,
          section_name: sectionName,
          teacher_name:
            user.full_name ||
            user.name ||
            teacher.full_name ||
            teacher.first_name
              ? `${teacher.first_name ?? ""} ${teacher.last_name ?? ""}`.trim()
              : teacher.user?.name || `Teacher #${ct.teacher_id}`,
          teacher_staff_code: teacher.staff_code ?? null,
          teacher_photo: teacher.photo ?? user.photo ?? null,
        });
      }
    }
  }
  return rows;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export const useFetchAllClassTeachers = () => {
  return useQuery<ClassTeacherRow[]>({
    queryKey: CLASS_TEACHERS_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get(`${classTeacher.class_teachers}`);
      const raw: any[] = res.data?.data ?? res.data ?? [];
      return flattenClassTeacherResponse(Array.isArray(raw) ? raw : []);
    },
  });
};

export const useAssignClassTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssignClassTeacherPayload) => {
      const res = await axiosInstance.post(`${classTeacher.class_teachers}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASS_TEACHERS_KEY });
    },
  });
};

export const useRemoveClassTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`${classTeacher.class_teachers}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASS_TEACHERS_KEY });
    },
  });
};
