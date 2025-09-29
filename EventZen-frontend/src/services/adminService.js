// src/services/adminService.js
import API from "./api";

// ==================== USER MANAGEMENT ====================

// Get all users
export const getAllUsers = async () => {
  const { data } = await API.get("/admin/users");
  return data;
};

// Get all organizers
export const getAllOrganizers = async () => {
  const { data } = await API.get("/admin/organizers");
  return data;
};

// Get all visitors
export const getAllVisitors = async () => {
  const { data } = await API.get("/admin/visitors");
  return data;
};

// Get user by ID
export const getUserById = async (userId) => {
  const { data } = await API.get(`/admin/users/${userId}`);
  return data;
};

// Update user
export const updateUser = async (userId, userData) => {
  const { data } = await API.put(`/admin/users/${userId}`, userData);
  return data;
};

// Delete user
export const deleteUser = async (userId) => {
  await API.delete(`/admin/users/${userId}`);
};

// ==================== ORGANIZER CREATION ====================

// Create new organizer
export const createOrganizer = async (organizerData) => {
  const { data } = await API.post("/admin/organizers/create", organizerData);
  return data;
};

// ==================== EVENT MANAGEMENT ====================

// Get all events (admin view)
export const getAllEventsAdmin = async () => {
  const { data } = await API.get("/admin/events");
  return data;
};

// Get event by ID
export const getEventByIdAdmin = async (eventId) => {
  const { data } = await API.get(`/admin/events/${eventId}`);
  return data;
};

// Delete event
export const deleteEventAdmin = async (eventId) => {
  await API.delete(`/admin/events/${eventId}`);
};

// ==================== ADMIN PROFILE ====================

// Get admin profile
export const getAdminProfile = async () => {
  const { data } = await API.get("/admin/profile");
  return data;
};

// Update admin profile
export const updateAdminProfile = async (profileData) => {
  const { data } = await API.put("/admin/profile", profileData);
  return data;
};

// ==================== STATISTICS ====================

// Get dashboard statistics
export const getDashboardStats = async () => {
  const { data } = await API.get("/admin/stats");
  return data;
};

export default {
  getAllUsers,
  getAllOrganizers,
  getAllVisitors,
  getUserById,
  updateUser,
  deleteUser,
  createOrganizer,
  getAllEventsAdmin,
  getEventByIdAdmin,
  deleteEventAdmin,
  getAdminProfile,
  updateAdminProfile,
  getDashboardStats,
};