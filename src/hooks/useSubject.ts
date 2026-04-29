//useSubject.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { subject } from "../api/endpoints";


const SUBJECT_KEY  = ["subjects"]; 

export interface Subject {
  id: number;
  name: string;
  code: string;
  type: string;
};

interface SubjectResponse {
      data: Subject[];
}

// Fetch All Subjects

export const useFetchAllSubjects = () => {
  return useQuery<Subject[]>({
    queryKey: SUBJECT_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<SubjectResponse>(`${subject.subjects}`,
      );
      return res.data.data;
    },
  });
};





// Add Subject api

interface CreateSubjectPayload {
  name: string;
  code: string;
  type: string;
}

export const useAddSubject  = () => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSubjectPayload) => {
      const res = await axiosInstance.post(
        `${subject.subjects}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_KEY,
      });
    },
  });
};

//update Subject api

export interface UpdateSubjectPayload  {
  id: number;
  name?: string;
  code?: string;
  type?: string;
}

export const useUpdateSubject  = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateSubjectPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${subject.subjects}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_KEY,
      });
    },
  });
};

//remove Subject api
export const useRemoveSubject  = () => {

    const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${subject.subjects}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_KEY,
      });
    },
  });
};


