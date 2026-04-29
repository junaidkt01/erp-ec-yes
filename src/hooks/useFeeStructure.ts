//useFeeStructure.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { feeStructure } from "../api/endpoints";

const FEE_STRUCTURE_KEY = ["fee-structures"];

export interface FeeStructure {
  id: number;
  class_id: number;
  fee_type_id: number;
  amount: string; 
}

interface FeeStructureResponse {
  data: FeeStructure[];
}

// Fetch All FeeStructure

export const useFetchAllFeeStructures = () => {
  return useQuery<FeeStructure[]>({
    queryKey: FEE_STRUCTURE_KEY,

    queryFn: async () => {
      const res = await axiosInstance.get<FeeStructureResponse>(
        feeStructure.fee_structures
      );

      return res.data.data;
    },
  });
};


// Add FeeStructure  api

interface CreateFeeStructurePayload {
  class_id: number;
  fee_type_id: number;
  amount: string;
}


export const useAddFeeStructure  = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateFeeStructurePayload) => {
      const res = await axiosInstance.post(
        feeStructure.fee_structures,
        payload
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_STRUCTURE_KEY,
      });
    },
  });
};

//update FeeStructure api

interface UpdateFeeStructurePayload {
  id: number;
  class_id?: number;
  fee_type_id?: number;
  amount?: string;
}

export const useUpdateFeeStructure  = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateFeeStructurePayload) => {
      const { id, ...data } = payload;

      const res = await axiosInstance.put(
        `${feeStructure.fee_structures}/${id}`,
        data
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_STRUCTURE_KEY,
      });
    },
  });
};

//remove FeeStructure api
export const useRemoveFeeStructure   = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`${feeStructure.fee_structures}/${id}`);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_STRUCTURE_KEY,
      });
    },
  });
};
