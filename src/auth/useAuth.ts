import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/me");
      return res.data;
    },
    retry: false,
  });
};
