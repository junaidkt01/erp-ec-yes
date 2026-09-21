import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { auth } from "../api/endpoints";

export type LoginPayload = {
  email: string;
  password: string;
  cf_turnstile_response?: string;
};

export const useLogin = (options?: any) => {
  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await axiosInstance.post(`${auth.login}`, data);
      return res.data;
    },

    ...options,
  });
};
