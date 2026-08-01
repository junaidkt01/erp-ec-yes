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
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.log("error: 1", error);

    // queryClient.setQueryData(["global-error"], {
    //   open: true,
    //   status: 404,
    //   message: "error message",
    // });

    // queryClient.setQueryData(["global-error"], {
    //   open: true,
    //   status: error.response?.status,
    //   message: error.message,
    // });

    // if (error.response?.status === 401) {
    //   // localStorage.removeItem("auth");
    //   // window.location.href = "/";
    // }
    // if (error.response?.status === 500) {
    //   window.location.href = "/error-page-500";
    // }

    // const { show } = useOverlayStore.getState();

    // const status = error.response?.status;

    // if (status) {
    //   show(status, error.message);
    // }

    return Promise.reject(error);
  },
);

export default axiosInstance;
