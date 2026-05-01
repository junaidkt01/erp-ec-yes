//useBranch.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { branch } from "../api/endpoints";


const BRANCH_KEY  = ["branches"]; 

export interface  Branch {
  id: number;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: number;
};

interface BranchResponse  {
      data: Branch[];
}

// Fetch All Branches

export const useFetchAllBranches = () => {
  return useQuery<Branch[]>({
    queryKey: BRANCH_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<BranchResponse>(`${branch.branches}`,
      );
      return res.data.data;
    },
  });
};





// Add Branch api

interface CreateBranchPayload {
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const useAddBranch   = () => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBranchPayload) => {
      const res = await axiosInstance.post(
        `${branch.branches}`,
        payload,
      );
      res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRANCH_KEY,
      });
    },
  });
};

//update Branch api

export interface UpdateBranchPayload   {
  id: number;
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: number;
}

export const useUpdateBranch  = () => {

    const queryClient = useQueryClient(); //for update and add
  return useMutation({
    mutationFn: async (updatePayload: UpdateBranchPayload) => {
      const { id, ...updatedData } = updatePayload;

      const res = await axiosInstance.put(
        `${branch.branches}/${id}`,
        updatedData,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRANCH_KEY,
      });
    },
  });
};

//remove Branch api
export const useRemoveBranch   = () => {

    const queryClient = useQueryClient(); 
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(
        `${branch.branches}/${id}`,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRANCH_KEY,
      });
    },
  });
};
