import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const LESSON_PLAN_KEYS = {
  all: ["lesson-plans"] as const,
  detail: (id: number | string) => ["lesson-plans", id] as const,
  approvals: ["lesson-plans", "approvals"] as const,
};

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
  subject: string;
  subject_id?: number | string;
  lesson_title: string;
  plan_date: string;
  class_name: string;
  section_name: string;
  chapter_number: string;
  page_numbers: string;
  no_of_periods: number | string;
  objectives: string;
  introductory_activities: string;
  teaching_aids: string;
  schedule: LessonPlanSchedule;
  status: "Draft" | "Submitted" | "Approved" | "Revision_Requested";
  teacher_name?: string;
  reviewer_remarks?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
}

export type CreateLessonPlanPayload = Omit<LessonPlanItem, "id" | "created_at">;
export type UpdateLessonPlanPayload = Partial<CreateLessonPlanPayload> & { id: number | string };

const STORAGE_KEY = "erp_lesson_plans_data";

export const DEFAULT_SAMPLE_PLANS: LessonPlanItem[] = [
  {
    id: 1,
    subject: "Science",
    lesson_title: "Photosynthesis & Plant Nutrition",
    plan_date: "2026-11-27",
    class_name: "Class 8",
    section_name: "Section A",
    chapter_number: "Chapter 4",
    page_numbers: "42 - 58",
    no_of_periods: 6,
    objectives:
      "1. Understand light-dependent and dark reactions of photosynthesis.\n2. Identify leaf anatomy & chloroplast cellular structures.\n3. Demonstrate carbon dioxide necessity through starch testing.",
    introductory_activities:
      "Recall chlorophyll function from Grade 7; conduct a 5-minute interactive quiz showing variegated leaves; ask students why plants are green.",
    teaching_aids:
      "Digital projector 3D plant cell model, compound microscopes, freshly collected spinach leaves, iodine solution for starch testing.",
    schedule: {
      monday: {
        class_assignment: "Explain chloroplast anatomy & leaf transverse section.",
        home_assignment: "Draw and label Figure 4.2 in homework notebook.",
      },
      tuesday: {
        class_assignment: "Discuss light absorption and chlorophyll pigment roles.",
        home_assignment: "Read textbook pages 45 to 48.",
      },
      wednesday: {
        class_assignment: "Explain Calvin cycle and glucose production equations.",
        home_assignment: "Answer questions 1 to 4 on page 50.",
      },
      thursday: {
        class_assignment: "Biology Lab: Starch test experiment using iodine test.",
        home_assignment: "Write lab experiment observation and result in record book.",
      },
      friday: {
        class_assignment: "Factors affecting photosynthesis rate (light, CO2, temp).",
        home_assignment: "Complete Chapter 4 Review Worksheet.",
      },
      saturday: {
        class_assignment: "Doubt clearing session & 15-minute quick assessment.",
        home_assignment: "Prepare summary notes for Chapter 5 introduction.",
      },
    },
    status: "Approved",
    teacher_name: "Sarah Jenkins",
    reviewer_remarks: "Excellent laboratory activity plan and pedagogical progression.",
    reviewed_by: "Principal Miller",
    reviewed_at: "2026-11-28",
    created_at: "2026-11-25",
  },
  {
    id: 2,
    subject: "Mathematics",
    lesson_title: "Quadratic Equations & Roots",
    plan_date: "2026-11-27",
    class_name: "Class 10",
    section_name: "Section B",
    chapter_number: "Chapter 3",
    page_numbers: "65 - 82",
    no_of_periods: 6,
    objectives:
      "1. Formulate quadratic equations from word problems.\n2. Find roots using factorization and the quadratic formula.\n3. Understand nature of roots using the discriminant.",
    introductory_activities:
      "Review linear equations vs second-degree polynomials with real-world projectile motion examples.",
    teaching_aids:
      "Graphing calculator emulator on smartboard, algebraic root visualization tiles.",
    schedule: {
      monday: {
        class_assignment: "Introduction to standard form ax² + bx + c = 0.",
        home_assignment: "Exercise 3.1 Q1 to Q5.",
      },
      tuesday: {
        class_assignment: "Solving equations by splitting the middle term.",
        home_assignment: "Exercise 3.2 Q1 to Q8.",
      },
      wednesday: {
        class_assignment: "Completing the square method with step-by-step proofs.",
        home_assignment: "Exercise 3.3 Q1 to Q4.",
      },
      thursday: {
        class_assignment: "Derivation and application of Quadratic Formula.",
        home_assignment: "Exercise 3.4 Q1 to Q6.",
      },
      friday: {
        class_assignment: "Discriminant analysis (D > 0, D = 0, D < 0).",
        home_assignment: "Practice worksheet on nature of roots.",
      },
      saturday: {
        class_assignment: "Word problems on age, speed, and geometric area.",
        home_assignment: "Solve past paper questions on Quadratic Equations.",
      },
    },
    status: "Submitted",
    teacher_name: "David Mathew",
    created_at: "2026-11-26",
  },
  {
    id: 3,
    subject: "English",
    lesson_title: "The Road Not Taken - Robert Frost",
    plan_date: "2026-11-27",
    class_name: "Class 9",
    section_name: "Section A",
    chapter_number: "Poem 1",
    page_numbers: "12 - 16",
    no_of_periods: 4,
    objectives:
      "1. Appreciate poetical devices: metaphor, symbolism, and rhyme scheme.\n2. Analyze moral choices and dilemmas in life.",
    introductory_activities:
      "Class discussion: What was a tough decision you made and what were the consequences?",
    teaching_aids: "Audio recording of Robert Frost reciting the poem, illustrated slides.",
    schedule: {
      monday: {
        class_assignment: "Stanza-by-stanza recitation and vocabulary explanation.",
        home_assignment: "Write summary of Stanzas 1 & 2 in own words.",
      },
      tuesday: {
        class_assignment: "Identify literary devices, rhyme scheme (ABAAB).",
        home_assignment: "Complete poetic devices identification chart.",
      },
      wednesday: {
        class_assignment: "Theme analysis: Individualism vs conformity.",
        home_assignment: "Write a 150-word reflective paragraph on life choices.",
      },
      thursday: {
        class_assignment: "Textual question discussion and essay writing structure.",
        home_assignment: "Finalize notebook answers for questions 1 to 5.",
      },
      friday: {
        class_assignment: "Supplementary reading & creative writing prompt.",
        home_assignment: "Read next prose chapter.",
      },
      saturday: {
        class_assignment: "Weekly poetry recitation & peer feedback.",
        home_assignment: "Weekend revision.",
      },
    },
    status: "Revision_Requested",
    teacher_name: "Claire Vance",
    reviewer_remarks: "Please add more detailed rubric for the reflective writing assignment.",
    reviewed_by: "ACO Johnson",
    reviewed_at: "2026-11-27",
    created_at: "2026-11-24",
  },
  {
    id: 4,
    subject: "Social Science",
    lesson_title: "The French Revolution",
    plan_date: "2026-11-27",
    class_name: "Class 9",
    section_name: "Section C",
    chapter_number: "Chapter 1",
    page_numbers: "1 - 24",
    no_of_periods: 6,
    objectives:
      "1. Understand the 3 estates of French society.\n2. Trace factors leading to storming of the Bastille.\n3. Examine the Reign of Terror and legacy of liberty.",
    introductory_activities:
      "Show image of the French guillotine and Bastille fortress; ask what these symbols evoke.",
    teaching_aids: "Historical map of 18th-century Europe, interactive timeline slides.",
    schedule: {
      monday: {
        class_assignment: "Old Regime social hierarchy and economic crisis discussion.",
        home_assignment: "Draw the 3 Estates pyramid diagram.",
      },
      tuesday: {
        class_assignment: "Outbreak of the Revolution & Tennis Court Oath.",
        home_assignment: "Short note on significance of Tennis Court Oath.",
      },
      wednesday: {
        class_assignment: "France becomes constitutional monarchy; Declaration of Rights.",
        home_assignment: "Read Declaration of Rights of Man and Citizen.",
      },
      thursday: {
        class_assignment: "Reign of Terror under Robespierre.",
        home_assignment: "Answer Q3 and Q4 from textbook page 18.",
      },
      friday: {
        class_assignment: "Role of women in the Revolution & abolition of slavery.",
        home_assignment: "Write short paragraph on Olympe de Gouges.",
      },
      saturday: {
        class_assignment: "Rise of Napoleon Bonaparte & recap quiz.",
        home_assignment: "Prepare mind map of the French Revolution.",
      },
    },
    status: "Draft",
    teacher_name: "Sarah Jenkins",
    created_at: "2026-11-27",
  },
];

export const getStoredPlans = (): LessonPlanItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

export const useFetchAllLessonPlans = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  class_name?: string;
  section_name?: string;
  subject?: string;
}) => {
  return useQuery<any>({
    queryKey: [...LESSON_PLAN_KEYS.all, params],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/lesson-plans", { params });
        const list = res?.data?.data || res?.data;
        if (Array.isArray(list) && list.length > 0) {
          return {
            data: list,
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
            p.lesson_title.toLowerCase().includes(s) ||
            p.subject.toLowerCase().includes(s) ||
            p.class_name.toLowerCase().includes(s) ||
            p.chapter_number.toLowerCase().includes(s) ||
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
        const res = await axiosInstance.get(`/lesson-plans/${id}`);
        if (res?.data?.data) return res.data.data;
        if (res?.data) return res.data;
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
    mutationFn: async (payload: CreateLessonPlanPayload) => {
      let created: LessonPlanItem = {
        ...payload,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };

      try {
        const res = await axiosInstance.post("/lesson-plans", payload);
        if (res?.data?.data) created = res.data.data;
        else if (res?.data) created = res.data;
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
    mutationFn: async (payload: UpdateLessonPlanPayload) => {
      let updated: LessonPlanItem;
      try {
        const res = await axiosInstance.put(`/lesson-plans/${payload.id}`, payload);
        updated = res?.data?.data || res?.data || (payload as LessonPlanItem);
      } catch (err) {
        updated = payload as LessonPlanItem;
      }

      const current = getStoredPlans();
      const updatedList = current.map((p) =>
        String(p.id) === String(payload.id) ? { ...p, ...payload } : p
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
        await axiosInstance.delete(`/lesson-plans/${id}`);
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
      status: "Approved" | "Revision_Requested";
      reviewer_remarks: string;
      reviewed_by: string;
    }) => {
      try {
        await axiosInstance.post(`/lesson-plans/${payload.id}/review`, payload);
      } catch (err) {
        // Fallback
      }

      const current = getStoredPlans();
      const updatedList = current.map((p) =>
        String(p.id) === String(payload.id)
          ? {
              ...p,
              status: payload.status,
              reviewer_remarks: payload.reviewer_remarks,
              reviewed_by: payload.reviewed_by,
              reviewed_at: new Date().toISOString().split("T")[0],
            }
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
