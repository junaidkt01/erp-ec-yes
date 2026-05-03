//useStudent.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { student } from "../api/endpoints";

const STUDENTS_KEY = ["students"];

export interface Student {
  id: number;
  admission_no: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: string;
  phone: string;
  email: string;
  class_id: number;
  section_id: number;

  class: {
    id: number;
    name: string;
  };

  section: {
    id: number;
    name: string;
  };
}

// interface Pagination<T> {
//   current_page: number;
//   data: T[];
//   total: number;
//   per_page: number;
//   last_page: number;
// }
interface Pagination<T> {
  data: T[];
  meta: {
    total: number;
    // per_page: number;
    // last_page: number;
    current_page: number;
  };
}

// interface StudentsResponse {
//   data: Pagination<Student>;
// }

// Fetch All Students
export const useFetchAllStudents = (page: number = 1) => {
  return useQuery<Pagination<Student>>({
    queryKey: [...STUDENTS_KEY, page],
    queryFn: async () => {
      const res = await axiosInstance.get<any>(
        `${student.students}?page=${page}`,
      );
      return res.data;
    },

    placeholderData: (previousData) => previousData, //keep previous data, show skeleton data,show partial data
  });
};

// Fetch one Students
export const useFetchOneStudent = (id?: string) => {
  return useQuery({
    queryKey: ["student"],
    queryFn: async () => {
      const res = await axiosInstance.get(`${student.students}/${id}`);
      return res.data;
    },
    enabled: !!id,
    placeholderData: (prev) => prev,
  });
};

// Add Student  api

// interface CreateStudentPayload {
//   first_name: string;
//   last_name: string;
//   phone: string;
//   email: string;
//   class_id: number;
//   section_id: number;
// }

interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

interface StudentDocument {
  id?: number;
  title: string;
  file: string;
}

export interface CreateStudentPayload {
  // Basic Info (likely required)
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  class_id: number;
  section_id: number;

  // Common required in many APIs (adjust if needed)
  admission_no?: string;
  dob?: string;
  gender?: string;
  academic_year_id?: number;

  // Optional fields
  user_id?: number;
  category_id?: string;
  photo?: string;
  status?: boolean;

  address?: string;
  date_of_birth?: string;
  nationality?: string;
  current_address?: string;
  permanent_address?: string;

  emergency_phone?: string;
  alternate_phone?: string;

  student_group_id?: number;

  medical_history?: string;
  is_disabled?: boolean;
  disable_reason?: string | null;
  disable_date?: string | null;

  route_id?: number;
  vehicle_id?: number;

  dormitory_id?: number;
  room_id?: number;

  previous_school_name?: string;
  previous_qualification?: string;

  emergencyContacts?: EmergencyContact[];
  documents?: StudentDocument[];
}

export const useAddStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentPayload) => {
      const res = await axiosInstance.post(`${student.students}`, payload);
      console.log("resss: ", res);
      return res.data;
    },

    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: STUDENTS_KEY,
      });
    },
    onError: (data) => {
      console.log("eror: data: ", data);
    },
  });
};

//update Student api

export interface UpdateStudentPayload {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  class_id: number;
  section_id: number;
}

export const useUpdateStudent = (student_id: string) => {
  const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateStudentPayload) => {
      const { ...updatedData } = updatePayload;
      console.log("dfff", student_id, updatedData);

      const res = await axiosInstance.put(
        `${student.students}/${student_id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: (data) => {
      console.log("ssss: success: ", data);
      queryClient.invalidateQueries({ queryKey: [...STUDENTS_KEY] });
    },
    onError: (error) => {
      console.log("ssss: error: ", error);
    },
  });
};

//remove class api
export const useRemoveStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`${student.students}/${id}`);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENTS_KEY,
      });
    },
  });
};

// bulk student upload api
export interface BulkStudentItem {
  admission_no: string;
  first_name: string;
  last_name: string;
  email: string;
  class_id: number;
  section_id: number;
  academic_year_id: number;
  dob: string;
  gender: string;
  phone: string;

  // optional but present in API
  father_name?: string;
  mother_name?: string;
  emergency_contacts?: {
    name: string;
    relation: string;
    phone: string;
  }[];
}

export interface BulkStudentPayload {
  students: BulkStudentItem[];
}

export const useBulkAddStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkStudentPayload) => {
      const res = await axiosInstance.post(`/students${student.bulk}`, payload);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENTS_KEY,
      });
    },

    onError: (error) => {
      console.log("Bulk error:", error);
    },
  });
};
