// ================================================================
// FILE: src/services/adminService.js
// 🆕 UPDATED: Added calendar-specific API functions
// ================================================================

import API from "./api";

// ==================== USER MANAGEMENT ====================

export const getAllUsers = async () => {
  try {
    const { data } = await API.get("/admin/users");
    return data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const getAllOrganizers = async () => {
  try {
    const { data } = await API.get("/admin/organizers");
    return data;
  } catch (error) {
    console.error("Error fetching organizers:", error);
    throw error;
  }
};

export const getAllVisitors = async () => {
  try {
    const { data } = await API.get("/admin/visitors");
    return data;
  } catch (error) {
    console.error("Error fetching visitors:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const { data } = await API.get(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const { data } = await API.put(`/admin/users/${userId}`, userData);
    return data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await API.delete(`/admin/users/${userId}`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

// ==================== ORGANIZER CREATION ====================

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

export const getAllEventsAdmin = async () => {
  try {
    const { data } = await API.get("/admin/events");
    return data;
  } catch (error) {
    console.error("Error fetching admin events:", error);
    throw error;
  }
};

export const getEventByIdAdmin = async (eventId) => {
  try {
    const { data } = await API.get(`/admin/events/${eventId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
};

export const deleteEventAdmin = async (eventId) => {
  try {
    await API.delete(`/admin/events/${eventId}`);
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};

// 🆕 NEW: Update event (admin)
export const updateEventAdmin = async (eventId, eventData) => {
  try {
    const { data } = await API.put(`/admin/events/${eventId}`, eventData);
    return data;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error;
  }
};

// ==================== CALENDAR-SPECIFIC APIs ====================

// 🆕 NEW: Get events by date range for calendar
export const getEventsByDateRange = async (startDate, endDate, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    if (filters.organizerId) params.append('organizerId', filters.organizerId);
    if (filters.eventType) params.append('eventType', filters.eventType);
    
    const { data } = await API.get(`/events/admin/calendar?${params.toString()}`);
    return data;
  } catch (error) {
    console.error("Error fetching events by date range:", error);
    throw error;
  }
};

// 🆕 NEW: Get all unique categories
export const getAllCategories = async () => {
  try {
    const { data } = await API.get("/events/admin/categories");
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Fallback: return default categories
    return ["Technology", "Business", "Music", "Health", "Food", "Art", "Community", "Entertainment", "Education", "Sports", "Other"];
  }
};

// 🆕 NEW: Get all unique cities
export const getAllCities = async () => {
  try {
    const { data } = await API.get("/events/admin/cities");
    return data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

// ==================== ADMIN PROFILE ====================

export const getAdminProfile = async () => {
  try {
    const { data } = await API.get("/admin/profile");
    return data;
  } catch (error) {
    throw error;
  }
};

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

export const getDashboardStats = async () => {
  try {
    const { data } = await API.get("/admin/stats");
    return data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const getTopOrganizers = async () => {
  try {
    const { data } = await API.get("/analytics/admin/top-organizers");
    return data;
  } catch (error) {
    console.error("Error fetching top organizers:", error);
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
  updateEventAdmin, // 🆕 NEW
  
  // Calendar APIs
  getEventsByDateRange, // 🆕 NEW
  getAllCategories, // 🆕 NEW
  getAllCities, // 🆕 NEW
  
  // Admin Profile
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  
  // Statistics
  getDashboardStats,
  getTopOrganizers,
};