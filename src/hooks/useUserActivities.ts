import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { userActivity } from "../api/endpoints";

export const USER_ACTIVITIES_KEY = ["user-activities"];

export interface UserRoleItem {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  full_name?: string;
  staff_id?: number | string | null;
  teacher_id?: number | string | null;
  student_id?: number | string | null;
  parent_id?: number | string | null;
  profile_id?: number | string | null;
  profile_type?: string | null;
  roles?: UserRoleItem[];
}

export interface UserActivityItem {
  id: number;
  user_id: number | null;
  user_name?: string;
  user_email?: string;
  role?: string;
  activity_type: string;
  description?: string;
  method?: string;
  url?: string;
  ip_address?: string;
  user_agent?: string;
  status_code?: number;
  request_payload?: any;
  created_at: string;
  updated_at?: string;
  user?: UserDetail | null;
  time?: string;
  time_formatted?: string;
  time_ago?: string;
}

export interface UserActivityFilters {
  user_id?: number | string;
  activity_type?: string;
  method?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface UserActivitiesResponse {
  success: boolean;
  data: UserActivityItem[] | {
    data: UserActivityItem[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
  pagination?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

export const useFetchUserActivities = (filters?: UserActivityFilters) => {
  return useQuery({
    queryKey: [...USER_ACTIVITIES_KEY, filters],
    queryFn: async () => {
      const response = await axiosInstance.get<UserActivitiesResponse>(
        userActivity.user_activities,
        {
          params: {
            user_id: filters?.user_id || undefined,
            activity_type: filters?.activity_type || undefined,
            method: filters?.method || undefined,
            date: filters?.date || undefined,
            date_from: filters?.date_from || undefined,
            date_to: filters?.date_to || undefined,
            search: filters?.search || undefined,
            page: filters?.page ?? 1,
            per_page: filters?.per_page ?? 25,
          },
        }
      );
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchUserActivityById = (id?: number | string) => {
  return useQuery({
    queryKey: ["user-activity", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const response = await axiosInstance.get(`/user-activities/${id}`);
        return response.data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          const fallback = await axiosInstance.get(`/user-activities`, {
            params: { user_id: id },
          });
          return fallback.data;
        }
        throw err;
      }
    },
    enabled: Boolean(id),
  });
};

