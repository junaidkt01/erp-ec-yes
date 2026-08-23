//useSections.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import type { ClassItem } from "./useStudentClass";
import { studentAttendance } from "../api/endpoints";



const STUDENT_ATTENDANCE_KEY = ["student-attendance"];



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

export const useFetchStudentAttendance = () => {
    return useQuery<StudentAttendanceItem[]>({
        queryKey: STUDENT_ATTENDANCE_KEY,
        queryFn: async () => {
            const res = await axiosInstance.get<StudentAttendanceResponse>(
                `${studentAttendance.student_attendances}`,
            );
            return res.data.data;
        },
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
                queryKey: STUDENT_ATTENDANCE_KEY,
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
                queryKey: STUDENT_ATTENDANCE_KEY,
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
                queryKey: STUDENT_ATTENDANCE_KEY,
            });
        },
    });
};