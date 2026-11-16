import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { auth } from "../api/endpoints";

export type ResetPasswordPayload = {
  email: string;
  password: string;
  password_confirmation: string;
  token?: string;
  code?: string;
};

export const useResetPassword = (options?: any) => {
  return useMutation({
    mutationFn: async (data: ResetPasswordPayload) => {
      const res = await axiosInstance.post(`${auth.resetPassword}`, data);
      return res.data;
    },
    ...options,
  });
};
