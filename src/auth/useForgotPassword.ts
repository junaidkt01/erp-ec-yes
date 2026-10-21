import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { auth } from "../api/endpoints";

export type ForgotPasswordPayload = {
  email: string;
};

export const useForgotPassword = (options?: any) => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordPayload) => {
      const res = await axiosInstance.post(`${auth.forgotPassword}`, data);
      return res.data;
    },
    ...options,
  });
};
