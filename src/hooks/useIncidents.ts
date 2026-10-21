import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { incident } from "../api/endpoints";

export const INCIDENTS_KEY = ["incidents"];

export interface Incident {
  id: number | string;
  title: string;
  point: number;
  is_negative: boolean | number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CreateIncidentPayload {
  title: string;
  point: number;
  is_negative: boolean;
  description: string;
}

export interface UpdateIncidentPayload extends CreateIncidentPayload {
  id: number | string;
}

// Fetch all incidents with pagination and optional search filter
export const useFetchAllIncidents = (page = 1, search = "", perPage?: number) => {
  return useQuery<any>({
    queryKey: [...INCIDENTS_KEY, page, search, perPage],
    queryFn: async () => {
      const res = await axiosInstance.get<any>(incident.incidents, {
        params: {
          page,
          search: search || undefined,
          per_page: perPage,
        },
      });
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

// Add new incident
export const useAddIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateIncidentPayload) => {
      const res = await axiosInstance.post(incident.incidents, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INCIDENTS_KEY,
      });
    },
  });
};

// Update existing incident
export const useUpdateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateIncidentPayload) => {
      const { id, ...data } = payload;
      try {
        const res = await axiosInstance.put(`${incident.incidents}/${id}`, data);
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 405) {
          const res = await axiosInstance.post(`${incident.incidents}/${id}`, data);
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INCIDENTS_KEY,
      });
    },
  });
};

// Delete incident
export const useRemoveIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(`${incident.incidents}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INCIDENTS_KEY,
      });
    },
  });
};

export interface AssignStudentIncidentPayload {
  incident_id: number | string;
  student_id?: number | string;
  student_ids?: (number | string)[];
  date?: string;
  description?: string;
}

export const STUDENT_INCIDENTS_KEY = ["student-incidents"];

export interface StudentIncidentFilter {
  student_id?: number | string;
  class_id?: number | string;
  section_id?: number | string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface StudentIncidentSummary {
  total_points: number;
  positive_points: number;
  negative_points: number;
  total_incidents: number;
}

export interface StudentIncidentsResponse {
  success: boolean;
  summary: StudentIncidentSummary;
  data: any;
  meta?: any;
  [key: string]: any;
}

// Fetch list of assigned student incidents (with summary and filters)
export const useFetchStudentIncidents = (filters?: StudentIncidentFilter) => {
  return useQuery<StudentIncidentsResponse>({
    queryKey: [...STUDENT_INCIDENTS_KEY, filters],
    queryFn: async () => {
      const res = await axiosInstance.get<StudentIncidentsResponse>(
        incident.studentIncidents || "/student-incidents",
        {
          params: {
            student_id: filters?.student_id || undefined,
            class_id: filters?.class_id || undefined,
            section_id: filters?.section_id || undefined,
            date_from: filters?.date_from || undefined,
            date_to: filters?.date_to || undefined,
            page: filters?.page || undefined,
            per_page: filters?.per_page || undefined,
          },
        }
      );
      return res.data;
    },
    placeholderData: (prev: any) => prev,
  });
};

// Delete assigned student incident
export const useDeleteStudentIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await axiosInstance.delete(
        `${incident.studentIncidents || "/student-incidents"}/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_INCIDENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: INCIDENTS_KEY });
    },
  });
};

// Fetch assigned incidents for a specific student
export const useFetchStudentAssignedIncidents = (studentId?: number | string) => {
  return useQuery<any>({
    queryKey: ["students", studentId, "incidents"],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await axiosInstance.get(`/students/${studentId}/incidents`);
      return res.data;
    },
    enabled: !!studentId,
  });
};

export const useAssignStudentIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssignStudentIncidentPayload) => {
      const res = await axiosInstance.post(
        incident.studentIncidents || "/student-incidents",
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_INCIDENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: INCIDENTS_KEY });
    },
  });
};

