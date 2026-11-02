// src/hooks/useStudentParent.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { studentParent } from "../api/endpoints";
import { DASHBOARD_KEY } from "./useDashboard";

export const STUDENT_PARENT_KEY = ["student-parents"];
export const PARENT_CHILDREN_KEY = ["parent-children"];

export interface StudentParentStudent {
  id: number;
  admission_no?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  gender?: string;
  class?: { id: number; name: string };
  section?: { id: number; name: string };
}

export interface StudentParent {
  id: number;
  student_id: number | string;

  father_name: string | null;
  father_phone: string | null;
  father_email?: string | null;
  father_occupation?: string | null;

  mother_name: string | null;
  mother_phone: string | null;
  mother_email?: string | null;
  mother_occupation?: string | null;

  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email?: string | null;
  guardian_relation?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;

  student?: StudentParentStudent;
}

export interface StudentParentListResponse {
  success?: boolean;
  data:
  | StudentParent[]
  | {
    data: StudentParent[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface SingleStudentParentResponse {
  success?: boolean;
  data: StudentParent;
}

export interface ParentChildrenResponse {
  success?: boolean;
  data: StudentParent[];
}

export interface CreateStudentParentPayload {
  student_id: number | string;
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  guardian_name?: string;
  guardian_phone?: string;
  father_email?: string;
  mother_email?: string;
  guardian_email?: string;
  guardian_relation?: string;
}

export interface UpdateStudentParentPayload
  extends Partial<CreateStudentParentPayload> {
  id: number | string;
}

// 1. Fetch All Student Parents (supports pagination and search query)
export const useFetchAllStudentParents = (
  page: number = 1,
  search?: string
) => {
  return useQuery<StudentParentListResponse>({
    queryKey: [...STUDENT_PARENT_KEY, page, search],
    queryFn: async () => {
      const res = await axiosInstance.get<StudentParentListResponse>(
        studentParent.student_parents,
        {
          params: {
            page,
            ...(search ? { search } : {}),
          },
        }
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

// 2. Fetch Single Student Parent by ID (Scenario 1 fix: dedicated unique key, always fresh, safely unpacks array/object)
export const useFetchStudentParentById = (id?: number | string) => {
  return useQuery<any>({
    queryKey: [...STUDENT_PARENT_KEY, "detail", id ? String(id) : ""],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `${studentParent.student_parents}/${id}`
      );
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? raw[0] : raw;
    },
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: true,
  });
};

// 3. Create Student Parent (Scenario 2 fix: invalidates dashboard widget counts)
export const useAddStudentParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentParentPayload) => {
      const res = await axiosInstance.post(studentParent.student_parents, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PARENT_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: PARENT_CHILDREN_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    },
  });
};

// 4. Update Student Parent (Scenario 1 & 2 fix: invalidates detail query and dashboard)
export const useUpdateStudentParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatePayload: UpdateStudentParentPayload) => {
      const { id, ...updatedData } = updatePayload;
      const res = await axiosInstance.put(
        `${studentParent.student_parents}/${id}`,
        updatedData
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PARENT_KEY,
      });
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: [...STUDENT_PARENT_KEY, "detail", String(variables.id)],
        });
        queryClient.invalidateQueries({
          queryKey: [...STUDENT_PARENT_KEY, variables.id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: PARENT_CHILDREN_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    },
  });
};

// 5. Delete Student Parent (Scenario 2 fix: automatically synchronizes dashboard counts & removes detail cache)
export const useDeleteStudentParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(
        `${studentParent.student_parents}/${id}`
      );
      return res.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PARENT_KEY,
      });
      if (id) {
        queryClient.removeQueries({
          queryKey: [...STUDENT_PARENT_KEY, "detail", String(id)],
        });
        queryClient.removeQueries({
          queryKey: [...STUDENT_PARENT_KEY, id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: PARENT_CHILDREN_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    },
  });
};

// Backward-compatibility aliases
export const useRemoveStudentParent = useDeleteStudentParent;
export const useUpdateStaffDepartment = useUpdateStudentParent;
export const useRemoveStaffDepartment = useDeleteStudentParent;

// 6. Fetch Logged-in Parent's Children (GET /api/parent/children)
export const useFetchParentChildren = (enabled: boolean = true) => {
  return useQuery<ParentChildrenResponse>({
    queryKey: PARENT_CHILDREN_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<ParentChildrenResponse>(
        studentParent.children
      );
      return res.data;
    },
    enabled,
    staleTime: 0,
    refetchOnMount: true,
  });
};
