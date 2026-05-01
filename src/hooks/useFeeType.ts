//useFeeType.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import {feeType } from "../api/endpoints";

const FEE_TYPE_KEY = ["fee-types"];

export interface FeeType {
  id: number;
  name: string;
  amount: string;
}

interface FeeTypeResponse {
data: FeeType[];
}

// Fetch All FeeTypes

export const useFetchAllFeeTypes = () => {
  return useQuery<FeeType[]>({
    queryKey: FEE_TYPE_KEY,

    queryFn: async () => {
      const res = await axiosInstance.get<FeeTypeResponse>(
        feeType.fee_types
      );

      return res.data.data;
    },
  });
};


// Add FeeType  api

interface CreateFeeTypePayload  {
  name: string;
  amount: string;
}


export const useAddFeeType   = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateFeeTypePayload) => {
      const res = await axiosInstance.post(
       feeType.fee_types,
        payload
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_TYPE_KEY,
      });
    },
  });
};

//update FeeTypes api

interface UpdateFeeTypePayload  {
  id: number;
  name?: string;
  amount?: string;
}

export const useUpdateFeeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateFeeTypePayload) => {
      const { id, ...data } = payload;

      const res = await axiosInstance.put(
        `${feeType.fee_types}/${id}`,
        data
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_TYPE_KEY,
      });
    },
  });
};

//remove FeeTypes api
export const useRemoveFeeType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`${feeType.fee_types}/${id}`);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_TYPE_KEY,
      });
    },
  });
};