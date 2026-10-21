import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosInstance from "../api/axiosInstance";
import { twoFactor } from "../api/endpoints";

export interface UserRole {
  id: number;
  name: string;
  guard_name?: string;
  permissions?: unknown[];
  pivot?: {
    model_type?: string;
    model_id?: number;
    role_id?: number;
  };
}

export interface UserData {
  id: number;
  branch_id?: number | null;
  name?: string;
  full_name?: string;
  email: string;
  two_factor_confirmed_at?: string | null;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  roles: UserRole[];
  permissions?: string[];
  [key: string]: unknown;
}

export interface AuthSessionData {
  token: string;
  user: UserData;
  roles?: string[];
  permissions?: string[];
  is_parent?: boolean;
  children_count?: number;
  used_recovery_code?: boolean;
}

export interface TwoFactorVerifyPayload {
  challenge_token: string;
  code: string;
  email?: string;
  cf_turnstile_response?: string;
  "cf-turnstile-response"?: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message?: string;
  data: AuthSessionData;
}

export interface TwoFactorConfirmPayload {
  code: string;
}

export interface TwoFactorConfirmResponse {
  success: boolean;
  message?: string;
  recovery_codes?: string[];
}

export interface TwoFactorCodePayload {
  email: string;
  challenge_token: string;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  data: {
    secret: string;
    qr_code_url: string;
    qr_code_image?: string;
    enabled?: boolean;
  };
}

export interface TwoFactorDisablePayload {
  current_password?: string;
  code?: string;
}

export interface TwoFactorDisableResponse {
  success: boolean;
  message?: string;
}

/**
 * 2FA API service functions
 */

export const verifyTwoFactor = async (
  payload: TwoFactorVerifyPayload
): Promise<TwoFactorVerifyResponse> => {
  const requestBody: Record<string, string> = {
    challenge_token: payload.challenge_token,
    code: payload.code,
  };

  if (payload.email) {
    requestBody.email = payload.email;
  }

  const turnstileToken = payload["cf-turnstile-response"] || payload.cf_turnstile_response;
  if (turnstileToken) {
    requestBody["cf-turnstile-response"] = turnstileToken;
    requestBody.cf_turnstile_response = turnstileToken;
  }

  const res = await axiosInstance.post<TwoFactorVerifyResponse>(
    twoFactor.verify,
    requestBody
  );
  return res.data;
};

export const confirmTwoFactor = async (
  payload: TwoFactorConfirmPayload
): Promise<TwoFactorConfirmResponse> => {
  const res = await axiosInstance.post<TwoFactorConfirmResponse>(
    twoFactor.confirm,
    payload
  );
  return res.data;
};

export const setupTwoFactor = async (): Promise<TwoFactorSetupResponse> => {
  const res = await axiosInstance.post<TwoFactorSetupResponse>(twoFactor.setup);
  return res.data;
};

export const disableTwoFactor = async (
  payload?: TwoFactorDisablePayload | void
): Promise<TwoFactorDisableResponse> => {
  const res = await axiosInstance.post<TwoFactorDisableResponse>(
    twoFactor.disable,
    payload || {}
  );
  return res.data;
};

/**
 * Development/testing endpoint helper.
 * Note: Check backend support before invoking. Never use in ordinary production login.
 */
export const getTwoFactorCode = async (
  payload: TwoFactorCodePayload
): Promise<unknown> => {
  const res = await axiosInstance.post(twoFactor.code, payload);
  return res.data;
};

/**
 * React Query mutation hooks
 */

export const useVerifyTwoFactor = (
  options?: UseMutationOptions<TwoFactorVerifyResponse, AxiosError<{ message?: string }>, TwoFactorVerifyPayload>
) => {
  return useMutation({
    mutationFn: verifyTwoFactor,
    ...options,
  });
};

export const useConfirmTwoFactor = (
  options?: UseMutationOptions<TwoFactorConfirmResponse, AxiosError<{ message?: string }>, TwoFactorConfirmPayload>
) => {
  return useMutation({
    mutationFn: confirmTwoFactor,
    ...options,
  });
};

export const useSetupTwoFactor = (
  options?: UseMutationOptions<TwoFactorSetupResponse, AxiosError<{ message?: string }>, void>
) => {
  return useMutation({
    mutationFn: setupTwoFactor,
    ...options,
  });
};

export const useDisableTwoFactor = (
  options?: UseMutationOptions<TwoFactorDisableResponse, AxiosError<{ message?: string }>, TwoFactorDisablePayload | void>
) => {
  return useMutation({
    mutationFn: disableTwoFactor,
    ...options,
  });
};

export const useGetTwoFactorCode = (
  options?: UseMutationOptions<unknown, AxiosError<{ message?: string }>, TwoFactorCodePayload>
) => {
  return useMutation({
    mutationFn: getTwoFactorCode,
    ...options,
  });
};
