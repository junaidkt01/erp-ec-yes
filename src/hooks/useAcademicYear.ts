//useAcademicYear.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { academicYear } from "../api/endpoints";

const ACADEMIC_YEAR_KEY = ["academic-years"]; // Academic Years key

// Fetch All Academic Years
export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface AcademicYearResponse {
  data: AcademicYear[];
}

export const useFetchAllAcademicYears = () => {
  return useQuery<AcademicYear[]>({
    queryKey: ACADEMIC_YEAR_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<AcademicYearResponse>(
        `${academicYear.academic_years}`,
      );
      return res.data.data;
    },
  });
};

// Add AcademicYear api

interface CreateAcademicYearPayload {
  name: string;
  start_date: string;
  end_date: string;
  is_current: number;
}

export const useAddAcademicYear = () => {
const queryClient = useQueryClient(); //for update and add

  return useMutation({
    mutationFn: async (payload: CreateAcademicYearPayload) => {
      const res = await axiosInstance.post(
        `${academicYear.academic_years}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_YEAR_KEY,
      });
    },
  });
};

//update AcademicYear api

export interface UpdateAcademicYearPayload {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: number;
}

export const useUpdateAcademicYear = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateAcademicYearPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${academicYear.academic_years}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_YEAR_KEY,
      });
    },
  });
};

//remove AcademicYear api
export const useRemoveAcademicYear = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${academicYear.academic_years}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACADEMIC_YEAR_KEY,
      });
    },
  });
};
