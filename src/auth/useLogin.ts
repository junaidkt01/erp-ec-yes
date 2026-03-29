import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
// import { api } from "../api/axiosInstance";

type LoginPayload = {
  email: string;
  password: string;
};

export const useLogin = (options?: any) => {
  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await axiosInstance.post("/login", data);
      return res.data;
    },

    ...options,
  });
};
