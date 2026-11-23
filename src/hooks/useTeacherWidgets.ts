// src/hooks/useTeacherWidgets.ts

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const TEACHER_WIDGETS_KEY = ["teacher-widgets"];

export interface TeacherInfo {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
}

export interface StudentBreakdown {
  class_id: number;
  class_name: string;
  count: number;
  pill: string;
}

export interface WidgetFooter {
  text: string;
  count: number;
  action_url: string;
  action_label: string;
}

export interface YourStudentsWidget {
  title: string;
  total_count: number;
  badge: string;
  breakdown: StudentBreakdown[];
  footer: WidgetFooter;
}

export interface ClassItem {
  id: number;
  name: string;
}

export interface YourClassesWidget {
  title: string;
  total_count: number;
  display: string;
  pills: string[];
  classes: ClassItem[];
  footer: WidgetFooter;
}

export interface SubjectItem {
  id: number;
  name: string;
  code: string;
  type: string;
}

export interface SubjectsWidget {
  title: string;
  total_count: number;
  display: string;
  pills: string[];
  subjects: SubjectItem[];
  footer: WidgetFooter;
}

export interface PeriodItem {
  id: number;
  display: string;
  class_id?: number;
  class_name: string;
  section_id?: number;
  section_name: string;
  subject_id?: number;
  subject_name: string;
  subject_code: string;
  start_time: string;
  end_time: string;
  day: string;
}

export interface NextPeriodsWidget {
  title: string;
  total_count: number;
  periods: PeriodItem[];
  pills: string[];
  footer: WidgetFooter;
}

export interface TeacherWidgetsMap {
  your_students?: YourStudentsWidget;
  your_classes?: YourClassesWidget;
  subjects?: SubjectsWidget;
  next_periods?: NextPeriodsWidget;
}

export interface TeacherWidgetsData {
  teacher?: TeacherInfo;
  widgets: TeacherWidgetsMap;
}

export interface TeacherWidgetsApiResponse {
  success: boolean;
  data: TeacherWidgetsData;
}

export const useTeacherWidgets = (teacherId?: number | string | null) => {
  return useQuery<TeacherWidgetsData>({
    queryKey: [...TEACHER_WIDGETS_KEY, teacherId],
    queryFn: async () => {
      const res = await axiosInstance.get<TeacherWidgetsApiResponse>(
        "/teacher/widgets",
        {
          params: teacherId ? { teacher_id: teacherId } : undefined,
        }
      );
      return res.data?.data;
    },
  });
};
