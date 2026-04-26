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
export const useFetchAllStaff = (page: number) => {
  return useQuery<Staff[]>({
    queryKey: STAFF_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<StaffResponse>(
        `${staff.staffs}?page=${page}`,
      );
      return res.data.data;
    },
  });
};

// Fetch one Students
export const useFetchOneStaff = (id?: string) => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await axiosInstance.get(`${staff.staffs}/${id}`);
      return res.data;
    },
    enabled: !!id,
    placeholderData: (prev) => prev,
  });
};

// Add Staff  api

interface CreateStaffPayload {
  [key: string]: any;
}

export const useAddStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStaffPayload | FormData) => {
      const res = await axiosInstance.post(`${staff.staffs}`, payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...STAFF_KEY],
      });
    },
  });
};

//update Staff api

export interface UpdateStaffPayload {
  [key: string]: any;
}

export const useUpdateStaff = (staff_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatePayload: UpdateStaffPayload | FormData) => {
      const res = await axiosInstance.put(`${staff.staffs}/${staff_id}`, updatePayload, {
        headers: updatePayload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      console.log("ress",res)
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...STAFF_KEY],
      });
    },
  });
};

//remove Staff api
export const useRemoveStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`${staff.staffs}/${id}`);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_KEY,
      });
    },
  });
};
