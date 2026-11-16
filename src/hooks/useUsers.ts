import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { user } from "../api/endpoints";

export interface UpdateUserPayload {
  id: number | string;
  name: string;
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roles?: (string | number)[];
}

export const updateUserApi = async ({ id, ...payload }: UpdateUserPayload) => {
  const res = await axiosInstance.put(`${user.users}/${id}`, payload);
  return res.data;
};

export const useUpdateUser = (options?: any) => {
  const queryClient = useQueryClient();

  return useMutation<any, any, UpdateUserPayload>({
    mutationFn: (data: UpdateUserPayload) => updateUserApi(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-access", String(variables.id)] });
    },
    ...options,
  });
};
