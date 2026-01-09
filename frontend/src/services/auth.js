// src/services/auth.js
import API from "./api";

export const login = async (credentials) => {
  const { data } = await API.post("/auth/login", credentials);

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role?.name || "");
    localStorage.setItem("email", data.email);
  }

  return data;
};

export const register = async (userData) => {
  const { data } = await API.post("/auth/register", userData);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
};
