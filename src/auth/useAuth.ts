import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const getStoredAuth = () => {
  const data = localStorage.getItem("auth");
  return data ? JSON.parse(data) : null;
};

export const useAuth = () => {
  const storedAuth = getStoredAuth();

  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await axiosInstance.get("/me");
      return res.data;
    },
    initialData: storedAuth,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// export const useAuth = () => {
//   const storedAuth = getStoredAuth();

//   return useQuery({
//     queryKey: ["auth"],
//     queryFn: async () => {
//       const res = await axiosInstance.get("/me");
//       localStorage.setItem("auth", JSON.stringify(res.data)); // sync
//       return res.data;
//     },
//     initialData: storedAuth,
//     staleTime: 5 * 60 * 1000,
//     refetchOnMount: false,
//     refetchOnWindowFocus: true,
//     retry: false,
//   });
// };
