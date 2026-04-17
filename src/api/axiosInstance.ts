// import axios from "axios";

// export const api = axios.create({
//   baseURL: "https://dev.cyberduce.com",
//   headers: {
//     Accept: "application/json",
//   },
// });

import axios, { AxiosError } from "axios";
import { API_URL } from "./endpoints";

const axiosInstance = axios.create({
  baseURL: API_URL,
  // headers: {
  //   Accept: "multipart/form-data",
  // },
});
// baseURL: "https://dev.cyberduce.com/api",

axiosInstance.interceptors.request.use((config) => {
  const stored: any = localStorage.getItem("auth");
  if (JSON.parse(stored)) {
    const { token } = JSON.parse(stored) as { token: string };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem("auth");
      // window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
