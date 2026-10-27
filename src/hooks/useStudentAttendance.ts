//useSections.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import type { ClassItem } from "./useStudentClass";
import { studentAttendance } from "../api/endpoints";



const STUDENT_ATTENDANCE_KEY = "student-attendance";

export interface StudentAttendanceFilterParams {
    class_id?: string | number;
    section_id?: string | number;
    attendance_date?: Date | string;
}

// Fetch All Sections
export interface StudentAttendanceItem {
    id: number;
    class_id: string;
    name: string;
    class?: ClassItem;
}

interface StudentAttendanceResponse {
    data: StudentAttendanceItem[];
}

export const useFetchStudentAttendance = (params?: StudentAttendanceFilterParams) => {
    return useQuery<StudentAttendanceItem[]>({
        queryKey: [STUDENT_ATTENDANCE_KEY, params],
        queryFn: async () => {
            const queryParams: Record<string, string> = {};

            if (params?.class_id !== undefined && params.class_id !== "")
                queryParams.class_id = String(params.class_id);

            if (params?.section_id !== undefined && params.section_id !== "")
                queryParams.section_id = String(params.section_id);

            if (params?.attendance_date) {
                const d = new Date(params.attendance_date);
                if (!isNaN(d.getTime())) {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    queryParams.attendance_date = `${year}-${month}-${day}`;
                }
            }

            const res = await axiosInstance.get<StudentAttendanceResponse>(
                `${studentAttendance.student_attendances}`,
                { params: queryParams },
            );
            return res.data.data;
        },
        enabled: false,
    });
};

// Add Section  api

export interface CreateStudentAttendance {
    student_code: string;
    class_id: number | string;
    section_id: number | string;
    academic_year_id?: number | string;
    date: string;
    status: string;
    note?: string;
}

export const useAddStudentAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateStudentAttendance[]) => {
            const res = await axiosInstance.post(
                `${studentAttendance.student_attendances}`,
                payload
            );

            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...STUDENT_ATTENDANCE_KEY],
            });
        },
    });
};

//update Section api

export interface UpdateSectionPayload {
    id: number;
    name: string;
    class_id: number | string;
}

export const useUpdateSection = () => {

    const queryClient = useQueryClient(); //for update and add
    return useMutation({
        mutationFn: async (updatePayload: UpdateSectionPayload) => {
            const { id, ...updatedData } = updatePayload;

            const res = await axiosInstance.put(
                `${studentAttendance.student_attendances}/${id}`,
                updatedData,
            );

            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...STUDENT_ATTENDANCE_KEY],
            });
        },
    });
};

//remove class api
export const useRemoveSection = () => {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await axiosInstance.delete(
                `${studentAttendance.student_attendances}/${id}`,
            );

            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...STUDENT_ATTENDANCE_KEY],
            });
        },
    });
};

// Monthly Attendance Report (Tab & Matrix Grid)
export interface MonthlyAttendanceFilterParams {
    student_id?: number | string;
    class_id?: number | string;
    section_id?: number | string;
    month?: number | string;
    year?: number | string;
}

export interface DayHeaderItem {
    day?: number | string;
    day_name?: string;
    weekday?: string;
    date?: string;
    is_weekend?: boolean;
    [key: string]: any;
}

export interface MonthlyAttendanceStudentRow {
    id?: number | string;
    student_id?: number | string;
    name?: string;
    full_name?: string;
    admission_no?: string | number;
    roll_no?: string | number;
    P?: number;
    L?: number;
    A?: number;
    F?: number;
    H?: number;
    Le?: number;
    percentage?: string | number;
    percent?: string | number;
    attendance?: Record<string, string>;
    days?: Record<string, string>;
    [key: string]: any;
}

export interface MonthlyAttendanceReportResponse {
    success: boolean;
    title?: string;
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
    data?: MonthlyAttendanceStudentRow[];
}

export const useFetchMonthlyStudentAttendanceReport = (params?: MonthlyAttendanceFilterParams) => {
    return useQuery<MonthlyAttendanceReportResponse>({
        queryKey: ["monthly-student-attendance-report", params],
        queryFn: async () => {
            const queryParams: Record<string, any> = {};

            if (params?.student_id !== undefined && params.student_id !== "") {
                queryParams.student_id = params.student_id;
            }
            if (params?.class_id !== undefined && params.class_id !== "") {
                queryParams.class_id = params.class_id;
            }
            if (params?.section_id !== undefined && params.section_id !== "") {
                queryParams.section_id = params.section_id;
            }
            if (params?.month !== undefined && params.month !== "") {
                queryParams.month = params.month;
            }
            if (params?.year !== undefined && params.year !== "") {
                queryParams.year = params.year;
            }

            const res = await axiosInstance.get<MonthlyAttendanceReportResponse>(
                `${studentAttendance.student_attendances}/monthly-report`,
                { params: queryParams }
            );

            return res.data;
        },
        enabled: Boolean(params?.student_id || params?.class_id),
    });
};