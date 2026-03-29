import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await axiosInstance.get("/me");
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
