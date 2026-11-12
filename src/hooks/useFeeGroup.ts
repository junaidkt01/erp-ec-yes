//useFeeGroup.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { feeGroup } from "../api/endpoints";

const FEE_GROUP_KEY = ["fee-groups"];

export interface FeeGroup {
  id: number;
  name: string;
  description?: string | null;
  academic_year_id?: number | null;
  branch_id?: number | null;
  is_active?: boolean | number;
  academic_year?: { id: number; name: string } | null;
}

// interface FeeGroupResponse {
//   data: FeeGroup[];
// }

// Fetch All FeeGroups
export const useFetchAllFeeGroups = (page: number) => {
  return useQuery<any>({
    queryKey: [...FEE_GROUP_KEY, page],
    queryFn: async () => {
      const res = await axiosInstance.get<any>(
        `${feeGroup.fee_groups}?page=${page}`,
      );

      return res.data.data;
    },
  });
};

// Add FeeGroup  api

export interface CreateFeeGroupPayload {
  name: string;
  description?: string;
  academic_year_id: number | null;
  branch_id: number | null;
  is_active: boolean;
}

export const useAddFeeGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateFeeGroupPayload) => {
      const res = await axiosInstance.post(feeGroup.fee_groups, payload);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_GROUP_KEY,
      });
    },
  });
};

//update FeeGroup api

export interface UpdateFeeGroupPayload extends CreateFeeGroupPayload {
  id: number;
}

export const useUpdateFeeGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateFeeGroupPayload) => {
      const { id, ...data } = payload;

      const res = await axiosInstance.put(`${feeGroup.fee_groups}/${id}`, data);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_GROUP_KEY,
      });
    },
  });
};

//remove FeeGroup api
export const useRemoveFeeGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`${feeGroup.fee_groups}/${id}`);

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEE_GROUP_KEY,
      });
    },
  });
};
