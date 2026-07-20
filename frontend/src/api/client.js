import axios from "axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import { refresh } from "./services/authApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hadAuthHeader = !!originalRequest?.headers?.Authorization;

    if (
      hadAuthHeader &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const data = await refresh();
        useAuthStore.getState().setAccessToken(data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }

    if (error.response) {
      const message =
        error.response.data?.detail || "An unexpected error occurred.";
      toast.error(message);
    } else {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  },
);

export default api;
