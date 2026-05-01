//useStudentParent.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import {studentParent } from "../api/endpoints";


const STUDENT_PARENT_KEY  = ["student-parents"]; 

export interface StudentParent {
  id: number;
  student_id: number;

  father_name: string | null;
  father_phone: string | null;
  father_email: string | null;

  mother_name: string | null;
  mother_phone: string | null;
  mother_email: string | null;

  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  guardian_relation: string | null;
};

interface StudentParentResponse {
    data: StudentParent[];
}

// Fetch All staffDepartments

export const useFetchAllStudentParents = () => {
  return useQuery<StudentParent[]>({
   queryKey: STUDENT_PARENT_KEY,
   queryFn: async () => {
    const res = await axiosInstance.get<StudentParentResponse>(`${studentParent.student_parents}`);

    return res.data.data;
   }
  });
};





// Add StudentParent api

interface CreateStudentParentPayload  {
  student_id: number;

  father_name?: string;
  father_phone?: string;

  mother_name?: string;
  mother_phone?: string;

  guardian_name?: string;
  guardian_phone?: string;
  guardian_relation?: string;
}


export const useAddStudentParent    = () => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentParentPayload) => {
      const res = await axiosInstance.post(
        `${studentParent.student_parents}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PARENT_KEY,
      });
    },
  });
};

//update StudentParent api

interface UpdateStudentParentPayload extends CreateStudentParentPayload{
 id: number;
}

export const useUpdateStaffDepartment   = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateStudentParentPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${studentParent.student_parents}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PARENT_KEY,
      });
    },
  });
};

//remove StudentParent api
export const useRemoveStaffDepartment   = () => {

    const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${studentParent.student_parents}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PARENT_KEY,
      });
    },
  });
};