// api/searchApi.ts

export const searchUsers = async (query: string) => {
  const { data } = await axiosInstance.get("/search", {
    params: {
      q: query,
    },
  });

  return data;
};

// hooks/useSearchUsers.ts

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ["search-users", query],

    queryFn: () => searchUsers(query),

    enabled: query.trim().length > 0,

    staleTime: 1000 * 60 * 5,

    retry: 1,
  });
};



// // api/searchApi.ts

// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://dev.cyberduce.com/api",
// });

// export const searchUsers = async (
//   query: string,
//   signal?: AbortSignal
// ) => {
//   const { data } = await api.get("/search", {
//     params: { q: query },
//     signal,
//   });

//   return data;
// };

// // hooks/useSearchUsers.ts

// import { useQuery } from "@tanstack/react-query";
// import { searchUsers } from "../api/searchApi";

// export const useSearchUsers = (query: string) => {
//   return useQuery({
//     queryKey: ["search-users", query],

//     queryFn: ({ signal }) => searchUsers(query, signal),

//     enabled: query.trim().length > 0,

//     staleTime: 1000 * 60 * 5,

//     retry: 1,
//   });
// };