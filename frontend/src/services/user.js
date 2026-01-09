// src/services/user.js
import API from "./api";

export const getUserProfile = async (userId) => {
  const { data } = await API.get(`/user/${userId}`);
  return data;
};

export const updateUserProfile = async (userId, profileData) => {
  const { data } = await API.put(`/user/${userId}`, profileData);
  return data;
};
