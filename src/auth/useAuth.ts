import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const getStoredAuth = () => {
  try {
    const data = localStorage.getItem("auth");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const storedAuth = getStoredAuth();

  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await axiosInstance.get("/me");
      const raw = res.data;
      const freshData = raw?.data && (raw.data.user || raw.data.token || raw.data.roles) ? raw.data : raw;
      if (freshData) {
        const stored = getStoredAuth() || {};
        const merged = { ...stored, ...freshData, token: stored?.token || freshData?.token };
        localStorage.setItem("auth", JSON.stringify(merged));
      }
      return freshData;
    },
    initialData: storedAuth,
    staleTime: 30 * 1000,
    gcTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });
};
