import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosInstance from "../api/axiosInstance";
import { auth } from "../api/endpoints";
import type { AuthSessionData } from "./useTwoFactor";

export type LoginPayload = {
  email: string;
  password: string;
  cf_turnstile_response?: string;
};

export interface LoginResponsePayload {
  success?: boolean;
  message?: string;
  two_factor_required?: boolean;
  challenge_token?: string;
  data?: AuthSessionData;
}

export const useLogin = (
  options?: UseMutationOptions<LoginResponsePayload, AxiosError<{ message?: string }>, LoginPayload>
) => {
  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await axiosInstance.post<LoginResponsePayload>(`${auth.login}`, data);
      return res.data;
    },

    ...options,
  });
};
