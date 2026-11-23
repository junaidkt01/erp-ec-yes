// src/hooks/useClassSubject.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { classSubject } from "../api/endpoints";

export const CLASS_SUBJECTS_KEY = ["class-subjects"];

export interface ClassSubjectRow {
  id: number;
  class_id: number;
  section_id: number | null;
  subject_id: number;
  teacher_id: number | null;
  academic_year_id: number | null;
  class_name: string;
  section_name: string;
  subject_name: string;
  subject_code?: string;
  subject_type?: string;
  teacher_name: string;
  teacher_staff_code?: string | null;
  teacher_photo?: string | null;
  academic_year_name?: string;
  raw?: any;
}

export interface AssignClassSubjectPayload {
  class_id: number;
  section_id?: number | null;
  subject_id: number;
  teacher_id: number;
  academic_year_id?: number | null;
}

function extractClassSubjectRow(
  cs: any,
  parentClassName?: string,
  parentSectionName?: string
): ClassSubjectRow {
  const teacher = cs.teacher ?? {};
  const user = teacher.user ?? cs.user ?? {};
  const subject = cs.subject ?? {};
  const cls = cs.class ?? cs.classes ?? {};
  const section = cs.section ?? {};
  const academicYear = cs.academic_year ?? cs.academicYear ?? {};

  const teacherName =
    user.full_name ||
    user.name ||
    teacher.full_name ||
    (teacher.first_name ? `${teacher.first_name} ${teacher.last_name ?? ""}`.trim() : "") ||
    cs.teacher_name ||
    (cs.teacher_id ? `Teacher #${cs.teacher_id}` : "-");

  const subjectName =
    subject.name ||
    cs.subject_name ||
    (cs.subject_id ? `Subject #${cs.subject_id}` : "-");
  const subjectCode = subject.code || cs.subject_code || "";
  const subjectType = subject.type || cs.subject_type || "";

  const className =
    cls.name ||
    parentClassName ||
    cs.class_name ||
    (cs.class_id ? `Class ${cs.class_id}` : "-");
  const sectionName =
    section.name ||
    parentSectionName ||
    cs.section_name ||
    (cs.section_id ? `Section ${cs.section_id}` : "-");
  const academicYearName =
    academicYear.name || academicYear.title || cs.academic_year_name || "";

  return {
    id: cs.id,
    class_id: cs.class_id ?? cls.id,
    section_id: cs.section_id ?? section.id ?? null,
    subject_id: cs.subject_id ?? subject.id,
    teacher_id: cs.teacher_id ?? teacher.id ?? null,
    academic_year_id: cs.academic_year_id ?? academicYear.id ?? null,
    class_name: className,
    section_name: sectionName,
    subject_name: subjectName,
    subject_code: subjectCode,
    subject_type: subjectType,
    teacher_name: teacherName,
    teacher_staff_code: teacher.staff_code ?? null,
    teacher_photo: teacher.photo ?? user.photo ?? null,
    academic_year_name: academicYearName,
    raw: cs,
  };
}

export function flattenClassSubjectResponse(rawData: any[]): ClassSubjectRow[] {
  if (!Array.isArray(rawData)) return [];
  const rows: ClassSubjectRow[] = [];

  for (const item of rawData) {
    if (
      item.subject ||
      item.subject_id ||
      (!item.sections && !item.class_subjects && item.teacher)
    ) {
      rows.push(extractClassSubjectRow(item));
    } else if (Array.isArray(item.sections)) {
      const className = item.name || `Class ${item.id}`;
      for (const section of item.sections) {
        const sectionName = section.name || `Section ${section.id}`;
        const classSubjects =
          section.class_subjects || section.subjects || [];
        for (const cs of classSubjects) {
          rows.push(extractClassSubjectRow(cs, className, sectionName));
        }
      }
    } else if (
      Array.isArray(item.class_subjects) ||
      Array.isArray(item.subjects)
    ) {
      const className = item.name || `Class ${item.id}`;
      const list = item.class_subjects || item.subjects || [];
      for (const cs of list) {
        rows.push(extractClassSubjectRow(cs, className));
      }
    } else {
      // Default fallback if item has an id
      if (item.id) {
        rows.push(extractClassSubjectRow(item));
      }
    }
  }

  return rows;
}

// Fetch All ClassSubjects
export const useFetchAllClassSubjects = (page?: number, search?: string) => {
  return useQuery<ClassSubjectRow[]>({
    queryKey: [...CLASS_SUBJECTS_KEY, page, search],
    queryFn: async () => {
      const params: any = {};
      if (page) params.page = page;
      if (search) params.search = search;

      const res = await axiosInstance.get(
        `${classSubject.class_subjects || classSubject.class_subject}`,
        {
          params: Object.keys(params).length ? params : undefined,
        }
      );
      const raw: any[] = res.data?.data ?? res.data ?? [];
      return flattenClassSubjectResponse(Array.isArray(raw) ? raw : []);
    },
  });
};

// Store new ClassSubject (Assign teacher to a subject for class and section)
export const useAssignClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssignClassSubjectPayload) => {
      const res = await axiosInstance.post(
        `${classSubject.class_subjects || classSubject.class_subject}`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASS_SUBJECTS_KEY,
      });
    },
  });
};

// Remove a ClassSubject assignment
export const useRemoveClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${classSubject.class_subjects || classSubject.class_subject}/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASS_SUBJECTS_KEY,
      });
    },
  });
};
