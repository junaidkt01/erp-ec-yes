import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { auth } from "../api/endpoints";

export type ResetPasswordPayload = {
  token: string;
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
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
