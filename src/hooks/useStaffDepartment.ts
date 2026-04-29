//useStaffDepartment.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { staffDepartment } from "../api/endpoints";


const STAFF_DEPARTMENT_KEY  = ["staff-departments"]; 

export interface StaffDepartment {
  id: number;
  name: string;
};

interface StaffDepartmentResponse  {
    data: StaffDepartment[];
}

// Fetch All staffDepartments

export const useFetchAllStaffDepartments = () => {
  return useQuery<StaffDepartment[]>({
    queryKey: STAFF_DEPARTMENT_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<StaffDepartmentResponse>(`${staffDepartment.staff_departments}`,
      );
      return res.data.data;
    },
  });
};





// Add StaffDepartment api

interface CreateStaffDepartmentPayload {
  name: string;
}


export const useAddStaffDepartment   = () => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStaffDepartmentPayload) => {
      const res = await axiosInstance.post(
        `${staffDepartment.staff_departments}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_DEPARTMENT_KEY,
      });
    },
  });
};

//update StaffDepartment api

export interface UpdateStaffDepartmentPayload   {
  id: number;
  name: string;
}

export const useUpdateStaffDepartment   = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateStaffDepartmentPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${staffDepartment.staff_departments}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_DEPARTMENT_KEY,
      });
    },
  });
};

//remove StaffDepartment api
export const useRemoveStaffDepartment   = () => {

    const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${staffDepartment.staff_departments}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STAFF_DEPARTMENT_KEY,
      });
    },
  });
};