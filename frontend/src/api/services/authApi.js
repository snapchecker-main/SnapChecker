import axios from "axios";
import api from "../client";

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const refresh = async () => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
    },
  );
  return data;
};

export const logout = async () => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/logout`,
    {},
    {
      withCredentials: true,
    },
  );
  return data;
};

export const verifyEmail = async (token) => {
  const { data } = await api.get(`/auth/verify-email?token=${token}`);
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const { data } = await api.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });
  return data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.put("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });

  return data;
};
