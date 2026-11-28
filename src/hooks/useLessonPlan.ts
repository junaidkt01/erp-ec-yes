import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { lessonPlan } from "../api/endpoints";

export const LESSON_PLAN_KEYS = {
  all: ["lesson-plans"] as const,
  detail: (id: number | string) => ["lesson-plans", id] as const,
};

export interface ScheduleItem {
  day: string;
  class_assignment: string;
  home_assignment: string;
}

export interface DaySchedule {
  class_assignment: string;
  home_assignment: string;
}

export interface LessonPlanSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
}

export interface LessonPlanItem {
  id: number | string;
  title: string;
  lesson_title: string;
  subject: string;
  subject_id?: number | string;
  class_id?: number | string;
  class_name: string;
  section_id?: number | string;
  section_name: string;
  teacher_id?: number | string;
  teacher_name?: string;
  date: string;
  plan_date: string;
  chapter_number: string;
  page_numbers: string;
  no_of_periods: number | string;
  objectives: string;
  introductory_activities: string;
  teaching_aids: string;
  teaching_aids_activities: string;
  status: string;
  schedule: LessonPlanSchedule;
  schedules?: ScheduleItem[];
  reviewer_remarks?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  [key: string]: any;
}

const STORAGE_KEY = "erp_lesson_plans_data";

export const normalizeLessonPlan = (item: any): LessonPlanItem => {
  const title = item.title || item.lesson_title || "";
  const date = item.date || item.plan_date || "";
  const teachingAids = item.teaching_aids_activities || item.teaching_aids || "";
  const className =
    item.class?.name ||
    item.class_name ||
    (typeof item.class === "string" ? item.class : `Class ${item.class_id || 8}`);
  const sectionName =
    item.section?.name ||
    item.section_name ||
    (typeof item.section === "string" ? item.section : `Section ${item.section_id || "A"}`);
  const subjectName =
    item.subject?.name ||
    item.subject_name ||
    (typeof item.subject === "string" ? item.subject : "Science");

  let scheduleMap: LessonPlanSchedule = {
    monday: { class_assignment: "", home_assignment: "" },
    tuesday: { class_assignment: "", home_assignment: "" },
    wednesday: { class_assignment: "", home_assignment: "" },
    thursday: { class_assignment: "", home_assignment: "" },
    friday: { class_assignment: "", home_assignment: "" },
    saturday: { class_assignment: "", home_assignment: "" },
  };

  if (Array.isArray(item.schedules)) {
    item.schedules.forEach((s: any) => {
      const dayKey = (s.day || "").toLowerCase() as keyof LessonPlanSchedule;
      if (scheduleMap[dayKey]) {
        scheduleMap[dayKey] = {
          class_assignment: s.class_assignment || "",
          home_assignment: s.home_assignment || "",
        };
      }
    });
  } else if (item.schedule) {
    scheduleMap = item.schedule;
  }

  return {
    ...item,
    id: item.id,
    title,
    lesson_title: title,
    date,
    plan_date: date,
    teaching_aids: teachingAids,
    teaching_aids_activities: teachingAids,
    class_name: className,
    section_name: sectionName,
    subject: subjectName,
    subject_id: item.subject_id || 1,
    class_id: item.class_id || 1,
    section_id: item.section_id || 1,
    chapter_number: item.chapter_number || "",
    page_numbers: item.page_numbers || "",
    no_of_periods: item.no_of_periods || 1,
    objectives: item.objectives || "",
    introductory_activities: item.introductory_activities || "",
    status: item.status || "Under Review",
    schedule: scheduleMap,
  };
};

export const scheduleMapToArray = (schedule: LessonPlanSchedule): ScheduleItem[] => {
  return (["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const).map(
    (d) => ({
      day: d.charAt(0).toUpperCase() + d.slice(1),
      class_assignment: schedule[d]?.class_assignment || "",
      home_assignment: schedule[d]?.home_assignment || "",
    })
  );
};

export const DEFAULT_SAMPLE_PLANS: LessonPlanItem[] = [
  normalizeLessonPlan({
    id: 1,
    title: "Photosynthesis & Plant Nutrition",
    subject_id: 1,
    subject: "Science",
    class_id: 1,
    class_name: "Class 8",
    section_id: 1,
    section_name: "Section A",
    teacher_id: 1,
    teacher_name: "Sarah Jenkins",
    date: "2026-11-27",
    chapter_number: "Chapter 4",
    page_numbers: "42 - 58",
    no_of_periods: 6,
    objectives: "1. Light & dark reactions.\n2. Leaf anatomy & chloroplast.\n3. Iodine starch test.",
    introductory_activities: "Recall chlorophyll function from Grade 7; variegated leaves demonstration.",
    teaching_aids_activities: "Projector 3D plant model, microscopes, spinach leaves, iodine.",
    status: "Approved",
    schedules: [
      { day: "Monday", class_assignment: "Chloroplast anatomy", home_assignment: "Diagram 4.2 in notebook" },
      { day: "Tuesday", class_assignment: "Chlorophyll pigment roles", home_assignment: "Read pp. 45-48" },
      { day: "Wednesday", class_assignment: "Calvin cycle equations", home_assignment: "Q1 to Q4 on page 50" },
      { day: "Thursday", class_assignment: "Starch test experiment", home_assignment: "Lab report summary" },
      { day: "Friday", class_assignment: "Factors affecting rate", home_assignment: "Chapter 4 Worksheet" },
      { day: "Saturday", class_assignment: "Recap & 15-min assessment", home_assignment: "Notes for Chapter 5" },
    ],
    reviewer_remarks: "Well planned laboratory activities.",
    reviewed_by: "Principal Miller",
    reviewed_at: "2026-11-28",
  }),
  normalizeLessonPlan({
    id: 2,
    title: "Quadratic Equations & Roots",
    subject_id: 2,
    subject: "Mathematics",
    class_id: 2,
    class_name: "Class 10",
    section_id: 2,
    section_name: "Section B",
    teacher_id: 2,
    teacher_name: "David Mathew",
    date: "2026-11-27",
    chapter_number: "Chapter 3",
    page_numbers: "65 - 82",
    no_of_periods: 6,
    objectives: "1. Formulate quadratic equations.\n2. Find roots by factoring & formula.\n3. Discriminant analysis.",
    introductory_activities: "Review linear equations and projectile motion parabolas.",
    teaching_aids_activities: "Smartboard graphing emulator, algebraic tile manipulatives.",
    status: "Under Review",
    schedules: [
      { day: "Monday", class_assignment: "Standard form ax² + bx + c = 0", home_assignment: "Ex 3.1 Q1-Q5" },
      { day: "Tuesday", class_assignment: "Factoring middle term", home_assignment: "Ex 3.2 Q1-Q8" },
      { day: "Wednesday", class_assignment: "Completing square proofs", home_assignment: "Ex 3.3 Q1-Q4" },
      { day: "Thursday", class_assignment: "Quadratic formula", home_assignment: "Ex 3.4 Q1-Q6" },
      { day: "Friday", class_assignment: "Discriminant analysis", home_assignment: "Worksheet on roots" },
      { day: "Saturday", class_assignment: "Word problems", home_assignment: "Past paper practice" },
    ],
  }),
];

export const getStoredPlans = (): LessonPlanItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeLessonPlan);
    }
  } catch (e) {
    console.error("Failed to parse local stored lesson plans", e);
  }
  return DEFAULT_SAMPLE_PLANS;
};

export const setStoredPlans = (plans: LessonPlanItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error("Failed to save lesson plans to storage", e);
  }
};

/* ================= HOOKS ================= */

export const useFetchAllLessonPlans = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  class_name?: string;
  subject?: string;
}) => {
  return useQuery<any>({
    queryKey: [...LESSON_PLAN_KEYS.all, params],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(lessonPlan.lessonPlans, { params });
        const list = res?.data?.data || res?.data;
        if (Array.isArray(list) && list.length > 0) {
          return {
            data: list.map(normalizeLessonPlan),
            meta: res?.data?.meta || {
              current_page: params?.page || 1,
              last_page: res?.data?.last_page || 1,
              total: res?.data?.total || list.length,
            },
          };
        }
      } catch (err) {
        // Fallback
      }

      const all = getStoredPlans();
      let filtered = [...all];

      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.subject.toLowerCase().includes(s) ||
            p.class_name.toLowerCase().includes(s) ||
            (p.teacher_name && p.teacher_name.toLowerCase().includes(s))
        );
      }

      if (params?.status && params.status !== "All") {
        filtered = filtered.filter((p) => p.status === params.status);
      }

      if (params?.class_name && params.class_name !== "All") {
        filtered = filtered.filter((p) => p.class_name === params.class_name);
      }

      if (params?.subject && params.subject !== "All") {
        filtered = filtered.filter((p) => p.subject === params.subject);
      }

      const perPage = params?.per_page || 8;
      const currentPage = params?.page || 1;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const startIndex = (currentPage - 1) * perPage;
      const paginatedData = filtered.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedData,
        meta: {
          current_page: currentPage,
          last_page: totalPages,
          total,
          per_page: perPage,
        },
      };
    },
    placeholderData: (prev: any) => prev,
  });
};

export const useFetchLessonPlanById = (id?: number | string) => {
  return useQuery<LessonPlanItem | null>({
    queryKey: LESSON_PLAN_KEYS.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await axiosInstance.get(lessonPlan.lessonPlanDetail(id));
        const data = res?.data?.data || res?.data;
        if (data) return normalizeLessonPlan(data);
      } catch (err) {
        // Fallback
      }
      const list = getStoredPlans();
      return list.find((p) => String(p.id) === String(id)) || null;
    },
    enabled: Boolean(id),
  });
};

export const useCreateLessonPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const apiPayload = {
        title: payload.title || payload.lesson_title || "",
        subject_id: Number(payload.subject_id) || 1,
        class_id: Number(payload.class_id) || 1,
        section_id: Number(payload.section_id) || 1,
        teacher_id: Number(payload.teacher_id) || 1,
        teacher_name: payload.teacher_name || "Sarah Jenkins",
        date: payload.date || payload.plan_date || new Date().toISOString().split("T")[0],
        chapter_number: payload.chapter_number || "",
        page_numbers: payload.page_numbers || "",
        no_of_periods: Number(payload.no_of_periods) || 1,
        objectives: payload.objectives || "",
        introductory_activities: payload.introductory_activities || "",
        teaching_aids_activities: payload.teaching_aids_activities || payload.teaching_aids || "",
        status: payload.status || "Under Review",
        schedules: Array.isArray(payload.schedules)
          ? payload.schedules
          : payload.schedule
          ? scheduleMapToArray(payload.schedule)
          : [],
      };

      let created: LessonPlanItem = normalizeLessonPlan({
        ...apiPayload,
        ...payload,
        id: Date.now(),
        created_at: new Date().toISOString(),
      });

      try {
        const res = await axiosInstance.post(lessonPlan.lessonPlans, apiPayload);
        if (res?.data?.data) created = normalizeLessonPlan(res.data.data);
        else if (res?.data) created = normalizeLessonPlan(res.data);
      } catch (err) {
        // Fallback
      }

      const current = getStoredPlans();
      setStoredPlans([created, ...current]);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSON_PLAN_KEYS.all });
    },
  });
};

export const useUpdateLessonPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const apiPayload = {
        title: payload.title || payload.lesson_title || "",
        subject_id: Number(payload.subject_id) || 1,
        class_id: Number(payload.class_id) || 1,
        section_id: Number(payload.section_id) || 1,
        teacher_id: Number(payload.teacher_id) || 1,
        teacher_name: payload.teacher_name || "Sarah Jenkins",
        date: payload.date || payload.plan_date || new Date().toISOString().split("T")[0],
        chapter_number: payload.chapter_number || "",
        page_numbers: payload.page_numbers || "",
        no_of_periods: Number(payload.no_of_periods) || 1,
        objectives: payload.objectives || "",
        introductory_activities: payload.introductory_activities || "",
        teaching_aids_activities: payload.teaching_aids_activities || payload.teaching_aids || "",
        status: payload.status || "Under Review",
        schedules: Array.isArray(payload.schedules)
          ? payload.schedules
          : payload.schedule
          ? scheduleMapToArray(payload.schedule)
          : [],
      };

      let updated: LessonPlanItem = normalizeLessonPlan({ ...apiPayload, ...payload });
      try {
        const res = await axiosInstance.put(lessonPlan.lessonPlanDetail(payload.id), apiPayload);
        if (res?.data?.data) updated = normalizeLessonPlan(res.data.data);
        else if (res?.data) updated = normalizeLessonPlan(res.data);
      } catch (err) {
        // Fallback
      }

      const current = getStoredPlans();
      const updatedList = current.map((p) =>
        String(p.id) === String(payload.id) ? normalizeLessonPlan({ ...p, ...payload, ...apiPayload }) : p
      );
      setStoredPlans(updatedList);
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LESSON_PLAN_KEYS.all });
      queryClient.invalidateQueries({ queryKey: LESSON_PLAN_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteLessonPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      try {
        await axiosInstance.delete(lessonPlan.lessonPlanDetail(id));
      } catch (err) {
        // Fallback
      }

      const current = getStoredPlans();
      const filtered = current.filter((p) => String(p.id) !== String(id));
      setStoredPlans(filtered);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LESSON_PLAN_KEYS.all });
    },
  });
};

export const useReviewLessonPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: number | string;
      status: "Approved" | "Revision_Requested" | "Revision Needed" | "Under Review";
      reviewer_remarks: string;
      reviewed_by: string;
    }) => {
      try {
        await axiosInstance.post(lessonPlan.review(payload.id), payload);
      } catch (err) {
        try {
          await axiosInstance.put(lessonPlan.lessonPlanDetail(payload.id), {
            status: payload.status,
            reviewer_remarks: payload.reviewer_remarks,
          });
        } catch (e) {
          // Fallback
        }
      }

      const current = getStoredPlans();
      const updatedList = current.map((p) =>
        String(p.id) === String(payload.id)
          ? normalizeLessonPlan({
              ...p,
              status: payload.status,
              reviewer_remarks: payload.reviewer_remarks,
              reviewed_by: payload.reviewed_by,
              reviewed_at: new Date().toISOString().split("T")[0],
            })
          : p
      );
      setStoredPlans(updatedList);
      return payload;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LESSON_PLAN_KEYS.all });
      queryClient.invalidateQueries({ queryKey: LESSON_PLAN_KEYS.detail(variables.id) });
    },
  });
};
