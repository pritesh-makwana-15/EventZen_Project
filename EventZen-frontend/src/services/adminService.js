// src/services/adminService.js
// 🔧 UPDATED: Added password update functionality

import API from "./api";

// ==================== USER MANAGEMENT ====================

// Get all users
export const getAllUsers = async () => {
  try {
    const { data } = await API.get("/admin/users");
    return data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

// Get all organizers
export const getAllOrganizers = async () => {
  try {
    const { data } = await API.get("/admin/organizers");
    return data;
  } catch (error) {
    console.error("Error fetching organizers:", error);
    throw error;
  }
};

// Get all visitors
export const getAllVisitors = async () => {
  try {
    const { data } = await API.get("/admin/visitors");
    return data;
  } catch (error) {
    console.error("Error fetching visitors:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const { data } = await API.get(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const { data } = await API.put(`/admin/users/${userId}`, userData);
    return data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    await API.delete(`/admin/users/${userId}`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

// ==================== ORGANIZER CREATION ====================

// Create new organizer
export const createOrganizer = async (organizerData) => {
  try {
    const { data } = await API.post("/admin/organizers/create", organizerData);
    return data;
  } catch (error) {
    console.error("Error creating organizer:", error);
    throw error;
  }
};

// ==================== EVENT MANAGEMENT ====================

// Get all events (admin view)
export const getAllEventsAdmin = async () => {
  try {
    const { data } = await API.get("/admin/events");
    return data;
  } catch (error) {
    console.error("Error fetching admin events:", error);
    throw error;
  }
};

// Get event by ID
export const getEventByIdAdmin = async (eventId) => {
  try {
    const { data } = await API.get(`/admin/events/${eventId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
};

// Delete event
export const deleteEventAdmin = async (eventId) => {
  try {
    await API.delete(`/admin/events/${eventId}`);
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};

// ==================== ADMIN PROFILE ====================

/**
 * Get admin profile
 * 🔧 UPDATED: Now returns mobileNumber and imageUrl
 */
export const getAdminProfile = async () => {
  try {
    console.log("📋 Fetching admin profile...");
    const { data } = await API.get("/admin/profile");
    console.log("✅ Admin profile fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching admin profile:", error);
    throw error;
  }
};

/**
 * Update admin profile (WITHOUT password)
 * 🔧 UPDATED: Now handles mobileNumber and imageUrl
 */
export const updateAdminProfile = async (profileData) => {
  try {
    console.log("🔄 Updating admin profile...", profileData);
    const { data } = await API.put("/admin/profile", {
      name: profileData.name,
      mobileNumber: profileData.mobileNumber,
      imageUrl: profileData.imageUrl
    });
    console.log("✅ Admin profile updated:", data);
    return data;
  } catch (error) {
    console.error("❌ Error updating admin profile:", error);
    throw error;
  }
};

/**
 * 🆕 NEW: Update admin password separately
 * This is the KEY function that was missing!
 */
export const updateAdminPassword = async (currentPassword, newPassword) => {
  try {
    console.log("🔐 Updating admin password...");
    const { data } = await API.put("/admin/password", {
      currentPassword: currentPassword,
      newPassword: newPassword
    });
    console.log("✅ Admin password updated successfully");
    return data;
  } catch (error) {
    console.error("❌ Error updating admin password:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== STATISTICS ====================

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const { data } = await API.get("/admin/stats");
    return data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// ==================== EXPORTS ====================

export default {
  // User Management
  getAllUsers,
  getAllOrganizers,
  getAllVisitors,
  getUserById,
  updateUser,
  deleteUser,
  
  // Organizer Creation
  createOrganizer,
  
  // Event Management
  getAllEventsAdmin,
  getEventByIdAdmin,
  deleteEventAdmin,
  
  // Admin Profile
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword, // 🆕 NEW
  
  // Statistics
  getDashboardStats,
};