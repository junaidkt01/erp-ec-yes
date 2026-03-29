// import axios from "axios";

// export const api = axios.create({
//   baseURL: "https://dev.cyberduce.com",
//   headers: {
//     Accept: "application/json",
//   },
// });

import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: "https://dev.cyberduce.com/api",
});

axiosInstance.interceptors.request.use((config) => {
  const stored = localStorage.getItem("auth");
  if (stored) {
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
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
