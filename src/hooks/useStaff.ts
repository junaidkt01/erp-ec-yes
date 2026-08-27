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

  staff_code: string | null;
  category: string | null;

  email: string | null;
  phone: string | null;

  designation: string | null;
  department_id: number | null;

  role: string | null;
  staff_no: string | null;

  date_of_joining: string | null;
  dob: string | null;
  gender: string | null;
  father_name: string | null;
  mother_name: string | null;
  marital_status: string | null;
  emergency_mobile: string | null;
  driving_license: string | null;

  qualifications: string | null;
  experience: string | null;

  basic_salary: string | null;
  contract_type: string | null;
  location: string | null;
  is_disabled?: boolean | number;
  disable_reason?: string | null;

  photo?: string | null;
}

export interface StaffFilters {
  search?: string;
  role?: string;
  category?: string;
  department_id?: number | string;
}

// interface StaffResponse {
//   data: Staff[];
//   meta?: {
//     total: number;
//     current_page: number;
//     per_page?: number;
//   };
// }

// Fetch All Staffs


export const useFetchAllStaff = (page = 1, filters?: StaffFilters) => {
  return useQuery<any>({
    queryKey: [...STAFF_KEY, page, filters],
    queryFn: async () => {
      const res = await axiosInstance.get<any>(staff.staffs, {
        params: {
          page,
          ...filters,
        },
      });
      return res.data;
    },
    placeholderData: (previousData: any) => previousData,
  });
};

// Fetch one Staff
export const useFetchOneStaff = (id?: string) => {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`${staff.staffs}/${id}`);
      return res.data;
    },
    enabled: !!id,
    placeholderData: (prev) => prev,
  });
};

// Add Staff api
export interface CreateStaffPayload {
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

// Update Staff api
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
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...STAFF_KEY],
      });
    },
  });
};

// Remove Staff api
export const useRemoveStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
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

// Block/Disable Staff api
interface BlockStaffParams {
  staffId: string | number;
  data: {
    disable_reason: string | null;
    is_disabled: 0 | 1;
  };
}

export const useBlockStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, data }: BlockStaffParams) => {
      const res = await axiosInstance.put(`${staff.staffs}/${staffId}`, data);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_KEY,
      });
    },
  });
};

// Bulk Staff Upload API
export interface BulkStaffItem {
  staff_code?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  designation?: string;
  category?: string;
  gender?: string;
  dob?: string;
  date_of_joining?: string;
  current_address?: string;
  permanent_address?: string;
  father_name?: string;
  mother_name?: string;
  emergency_mobile?: string;
  qualifications?: string;
  experience?: string;
  basic_salary?: string;
  contract_type?: string;
  location?: string;
}

export interface BulkStaffPayload {
  staffs: BulkStaffItem[];
}

export const useBulkAddStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkStaffPayload) => {
      const res = await axiosInstance.post(`${staff.staffs}${staff.bulk || "/bulk"}`, payload);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_KEY,
      });
    },

    onError: (error) => {
      console.log("Bulk staff error:", error);
    },
  });
};
