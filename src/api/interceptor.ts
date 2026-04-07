import axiosInstance from "./axiosInstance";

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // if (error.response?.status === 401) {
    //   window.location.href = "/login";
    // }

    return Promise.reject(error);
  },
);
