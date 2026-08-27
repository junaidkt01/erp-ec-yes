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