//useStaff.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { staff } from "../api/endpoints";

const STAFF_KEY = ["staffs"];

export interface Staff {
  id: number;
  user_id: number | null;

  name: string | null;
  first_name: string | null;
  last_name: string | null;

  email: string | null;
  phone: string | null;

  designation: string | null;
  department_id: number | null;

  role: string | null;
  staff_no: string | null;

  date_of_joining: string | null;

  qualifications: string | null;
  experience: string | null;

  basic_salary: string | null;
  location: string | null;
}

interface StaffResponse {
  data: Staff[];
}

// Fetch All Staffs
export const useFetchAllStaff = () => {
  return useQuery<Staff[]>({
    queryKey: STAFF_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<StaffResponse>(
        `${staff.staffs}`,
      );
      return res.data.data;
    },
  });
};


// Add Staff  api

interface CreateStaffPayload {
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  phone?: string;
  designation?: string;
}

export const useAddStaff = () => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      const res = await axiosInstance.post(
        `${staff.staffs}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_KEY,
      });
    },
  });
};

//update Staff api

export interface UpdateStaffPayload  {
  id: number;
  designation: string;
  qualification: string;
  joining_date: string;
}

export const useUpdateStaff = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateStaffPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${staff.staffs}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_KEY,
      });
    },
  });
};

//remove Staff api
export const useRemoveStaff = () => {

    const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${staff.staffs}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_KEY,
      });
    },
  });
};
