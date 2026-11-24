// src/hooks/useStaffAttendance.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { staffAttendance } from "../api/endpoints";

export const STAFF_ATTENDANCE_KEY = ["staff-attendance"];
export const MONTHLY_STAFF_ATTENDANCE_REPORT_KEY = ["monthly-staff-attendance-report"];

export interface StaffAttendanceFilterParams {
  role_id?: string | number;
  role?: string;
  department_id?: string | number;
  staff_id?: string | number;
  attendance_date?: Date | string;
  date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface StaffAttendanceRecord {
  id: number;
  staff_id: number;
  date: string;
  status: string;
  note?: string | null;
  photo?: string | null;
  staff?: any;
}

interface StaffAttendanceResponse {
  success?: boolean;
  data: StaffAttendanceRecord[];
  meta?: any;
}

// 1. Fetch Staff Attendance list (GET /api/staff-attendances)
export const useFetchStaffAttendance = (
  params?: StaffAttendanceFilterParams,
  options?: { enabled?: boolean }
) => {
  return useQuery<StaffAttendanceRecord[]>({
    queryKey: [...STAFF_ATTENDANCE_KEY, params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};

      if (params?.role_id !== undefined && params.role_id !== "") {
        queryParams.role_id = params.role_id;
      }
      if (params?.role !== undefined && params.role !== "") {
        queryParams.role = params.role;
      }
      if (params?.department_id !== undefined && params.department_id !== "") {
        queryParams.department_id = params.department_id;
      }
      if (params?.staff_id !== undefined && params.staff_id !== "") {
        queryParams.staff_id = params.staff_id;
      }
      if (params?.search !== undefined && params.search !== "") {
        queryParams.search = params.search;
      }
      if (params?.page) {
        queryParams.page = params.page;
      }
      if (params?.per_page) {
        queryParams.per_page = params.per_page;
      }

      const dateVal = params?.date || params?.attendance_date;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          queryParams.date = `${year}-${month}-${day}`;
          queryParams.attendance_date = `${year}-${month}-${day}`;
        } else if (typeof dateVal === "string") {
          queryParams.date = dateVal;
          queryParams.attendance_date = dateVal;
        }
      }

      const endpoint = staffAttendance.staff_attendances || "/staff-attendances";
      const res = await axiosInstance.get<StaffAttendanceResponse>(endpoint, {
        params: queryParams,
      });

      const raw = res.data?.data ?? res.data ?? [];
      return Array.isArray(raw) ? raw : [];
    },
    enabled: options?.enabled ?? false,
  });
};

// 2. Fetch single Staff Attendance (GET /api/staff-attendances/{id})
export const useFetchStaffAttendanceById = (id?: number | string) => {
  return useQuery({
    queryKey: [...STAFF_ATTENDANCE_KEY, "detail", id ? String(id) : ""],
    queryFn: async () => {
      const endpoint = staffAttendance.staff_attendances || "/staff-attendances";
      const res = await axiosInstance.get(`${endpoint}/${id}`);
      return res.data;
    },
    enabled: Boolean(id && String(id).trim() !== ""),
  });
};

// 3. Store new Staff Attendance (POST /api/staff-attendances)
export interface CreateStaffAttendanceItem {
  id?: number;
  staff_id: number;
  date: string;
  status: string;
  note?: string;
}

export const useAddStaffAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateStaffAttendanceItem | CreateStaffAttendanceItem[]
    ) => {
      const endpoint = staffAttendance.staff_attendances || "/staff-attendances";

      if (Array.isArray(payload)) {
        try {
          const res = await axiosInstance.post(endpoint, payload);
          return res.data;
        } catch (err: any) {
          // If server expects wrapped payload { attendances: [...] }
          if (err?.response?.status === 422) {
            try {
              const res2 = await axiosInstance.post(endpoint, {
                attendances: payload,
              });
              return res2.data;
            } catch {
              // Fallback to sending individual items in parallel
              const results = await Promise.all(
                payload.map((item) => axiosInstance.post(endpoint, item))
              );
              return results.map((r) => r.data);
            }
          }
          throw err;
        }
      } else {
        const res = await axiosInstance.post(endpoint, payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_ATTENDANCE_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: MONTHLY_STAFF_ATTENDANCE_REPORT_KEY,
      });
    },
  });
};

// 4. Update existing Staff Attendance (PUT /api/staff-attendances/{id})
export interface UpdateStaffAttendancePayload {
  id: number | string;
  staff_id?: number;
  date?: string;
  status?: string;
  note?: string;
}

export const useUpdateStaffAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateStaffAttendancePayload) => {
      const { id, ...data } = payload;
      const endpoint = `${staffAttendance.staff_attendances || "/staff-attendances"}/${id}`;
      try {
        const res = await axiosInstance.put(endpoint, data);
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405) {
          const res = await axiosInstance.post(endpoint, data);
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_ATTENDANCE_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: MONTHLY_STAFF_ATTENDANCE_REPORT_KEY,
      });
    },
  });
};

// 5. Delete existing Staff Attendance (DELETE /api/staff-attendances/{id})
export const useRemoveStaffAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const endpoint = `${staffAttendance.staff_attendances || "/staff-attendances"}/${id}`;
      const res = await axiosInstance.delete(endpoint);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_ATTENDANCE_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: MONTHLY_STAFF_ATTENDANCE_REPORT_KEY,
      });
    },
  });
};

// 6. Monthly Staff Attendance Report (GET /api/staff-attendances/monthly-report)
export interface MonthlyStaffAttendanceFilterParams {
  year?: number | string;
  month?: number | string;
  role_id?: number | string;
  role?: string;
  staff_id?: number | string;
  department_id?: number | string;
  search?: string;
}

export interface DayHeaderItem {
  day?: number | string;
  day_name?: string;
  weekday?: string;
  date?: string;
  is_weekend?: boolean;
  [key: string]: any;
}

export interface MonthlyStaffAttendanceRow {
  id?: number | string;
  staff_id?: number | string;
  name?: string;
  full_name?: string;
  staff_code?: string | number;
  staff_no?: string | number;
  role?: string;
  role_name?: string;
  department?: string;
  designation?: string;
  photo?: string;
  P?: number;
  L?: number;
  A?: number;
  F?: number;
  H?: number;
  Le?: number;
  percentage?: string | number;
  percent?: string | number;
  attendance?: Record<string | number, string>;
  days?: Record<string | number, string>;
  [key: string]: any;
}

export interface MonthlyStaffAttendanceReportResponse {
  success: boolean;
  month?: number;
  year?: number;
  month_name?: string;
  title?: string;
  total_staff?: number;
  summary?: {
    P?: number;
    L?: number;
    A?: number;
    F?: number;
    H?: number;
    Le?: number;
    [key: string]: any;
  };
  legend?: Record<string, string>;
  days_header?: DayHeaderItem[];
  data?: MonthlyStaffAttendanceRow[];
}

export const useFetchMonthlyStaffAttendanceReport = (
  params?: MonthlyStaffAttendanceFilterParams,
  options?: { enabled?: boolean }
) => {
  return useQuery<MonthlyStaffAttendanceReportResponse>({
    queryKey: [...MONTHLY_STAFF_ATTENDANCE_REPORT_KEY, params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};

      if (params?.year !== undefined && params.year !== "") {
        queryParams.year = params.year;
      }
      if (params?.month !== undefined && params.month !== "") {
        queryParams.month = params.month;
      }
      if (params?.role_id !== undefined && params.role_id !== "") {
        queryParams.role_id = params.role_id;
      }
      if (params?.role !== undefined && params.role !== "") {
        queryParams.role = params.role;
      }
      if (params?.staff_id !== undefined && params.staff_id !== "") {
        queryParams.staff_id = params.staff_id;
      }
      if (params?.department_id !== undefined && params.department_id !== "") {
        queryParams.department_id = params.department_id;
      }
      if (params?.search !== undefined && params.search !== "") {
        queryParams.search = params.search;
      }

      const endpoint =
        staffAttendance.monthly_report || "/staff-attendances/monthly-report";
      const res = await axiosInstance.get<MonthlyStaffAttendanceReportResponse>(
        endpoint,
        { params: queryParams }
      );

      return res.data;
    },
    enabled: options?.enabled ?? true,
  });
};
