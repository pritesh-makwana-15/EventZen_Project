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


/**
 * Get all pending events awaiting approval
 */
export const getPendingEvents = async () => {
  try {
    const { data } = await API.get("/admin/events/pending");
    return data;
  } catch (error) {
    console.error("Error fetching pending events:", error);
    throw error;
  }
};

/**
 * Get all rejected events
 */
export const getRejectedEvents = async () => {
  try {
    const { data } = await API.get("/admin/events/rejected");
    return data;
  } catch (error) {
    console.error("Error fetching rejected events:", error);
    throw error;
  }
};

/**
 * Get all approved events
 */
export const getApprovedEventsAdmin = async () => {
  try {
    const { data } = await API.get("/admin/events/approved");
    return data;
  } catch (error) {
    console.error("Error fetching approved events:", error);
    throw error;
  }
};

/**
 * Approve a pending event
 * @param {number} eventId - ID of event to approve
 */
export const approveEvent = async (eventId) => {
  try {
    const { data } = await API.post(`/admin/events/${eventId}/approve`);
    return data;
  } catch (error) {
    console.error(`Error approving event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Reject a pending event with reason
 * @param {number} eventId - ID of event to reject
 * @param {string} rejectionReason - Reason for rejection
 */
export const rejectEvent = async (eventId, rejectionReason) => {
  try {
    const { data } = await API.post(`/admin/events/${eventId}/reject`, {
      rejectionReason: rejectionReason
    });
    return data;
  } catch (error) {
    console.error(`Error rejecting event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Review event (combined approve/reject)
 * @param {number} eventId - ID of event to review
 * @param {string} action - "APPROVE" or "REJECT"
 * @param {string} rejectionReason - Reason (required if action is REJECT)
 */
export const reviewEvent = async (eventId, action, rejectionReason = null) => {
  try {
    const payload = { action };
    if (action === "REJECT" && rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }
    
    const { data } = await API.put(`/admin/events/${eventId}/review`, payload);
    return data;
  } catch (error) {
    console.error(`Error reviewing event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Get events by status
 * @param {string} status - "PENDING", "APPROVED", or "REJECTED"
 */
export const getEventsByStatus = async (status) => {
  try {
    const { data } = await API.get(`/admin/events/status/${status}`);
    return data;
  } catch (error) {
    console.error(`Error fetching events with status ${status}:`, error);
    throw error;
  }
};

/**
 * Get event approval statistics
 */
export const getApprovalStats = async () => {
  try {
    const { data } = await API.get("/admin/events/stats");
    return data;
  } catch (error) {
    console.error("Error fetching approval stats:", error);
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

export const getAllVenues = async () => {
  try {
    const { data } = await API.get("/admin/venues");
    return data;
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
};

export const getActiveVenues = async () => {
  try {
    const { data } = await API.get("/admin/venues/active");
    return data;
  } catch (error) {
    console.error("Error fetching active venues:", error);
    throw error;
  }
};

export const getVenueById = async (venueId) => {
  try {
    const { data } = await API.get(`/admin/venues/${venueId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching venue ${venueId}:`, error);
    throw error;
  }
};

export const createVenue = async (venueData) => {
  try {
    const { data } = await API.post("/admin/venues", venueData);
    return data;
  } catch (error) {
    console.error("Error creating venue:", error);
    throw error;
  }
};

export const updateVenue = async (venueId, venueData) => {
  try {
    const { data } = await API.put(`/admin/venues/${venueId}`, venueData);
    return data;
  } catch (error) {
    console.error(`Error updating venue ${venueId}:`, error);
    throw error;
  }
};

export const deleteVenue = async (venueId) => {
  try {
    await API.delete(`/admin/venues/${venueId}`);
  } catch (error) {
    console.error(`Error deleting venue ${venueId}:`, error);
    throw error;
  }
};

export const getVenueConflicts = async (venueId) => {
  try {
    const { data } = await API.get(`/admin/venues/${venueId}/conflicts`);
    return data;
  } catch (error) {
    console.error(`Error fetching conflicts for venue ${venueId}:`, error);
    throw error;
  }
};

// ==================== EXPORT FUNCTIONS ====================

export const exportEventsCsv = async () => {
  try {
    const response = await API.get("/admin/export/events/csv", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting events CSV:", error);
    throw error;
  }
};

export const exportEventsPdf = async () => {
  try {
    const response = await API.get("/admin/export/events/pdf", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting events PDF:", error);
    throw error;
  }
};

export const exportUsersCsv = async () => {
  try {
    const response = await API.get("/admin/export/users/csv", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting users CSV:", error);
    throw error;
  }
};

export const exportUsersPdf = async () => {
  try {
    const response = await API.get("/admin/export/users/pdf", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting users PDF:", error);
    throw error;
  }
};

export const exportRegistrationsCsv = async () => {
  try {
    const response = await API.get("/admin/export/registrations/csv", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting registrations CSV:", error);
    throw error;
  }
};

export const exportRegistrationsPdf = async () => {
  try {
    const response = await API.get("/admin/export/registrations/pdf", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting registrations PDF:", error);
    throw error;
  }
};

// Helper function to download blob
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ==================== FEEDBACK MODERATION ====================

export const getAllFeedback = async () => {
  try {
    const { data } = await API.get("/admin/feedback");
    return data;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw error;
  }
};

export const getUnreviewedFeedback = async () => {
  try {
    const { data } = await API.get("/admin/feedback/unreviewed");
    return data;
  } catch (error) {
    console.error("Error fetching unreviewed feedback:", error);
    throw error;
  }
};

export const getFlaggedFeedback = async () => {
  try {
    const { data } = await API.get("/admin/feedback/flagged");
    return data;
  } catch (error) {
    console.error("Error fetching flagged feedback:", error);
    throw error;
  }
};

export const deleteFeedback = async (feedbackId) => {
  try {
    await API.delete(`/admin/feedback/${feedbackId}`);
  } catch (error) {
    console.error(`Error deleting feedback ${feedbackId}:`, error);
    throw error;
  }
};

export const markFeedbackAsReviewed = async (feedbackId) => {
  try {
    const { data } = await API.put(`/admin/feedback/${feedbackId}/review`);
    return data;
  } catch (error) {
    console.error(`Error marking feedback ${feedbackId} as reviewed:`, error);
    throw error;
  }
};

export const flagFeedback = async (feedbackId) => {
  try {
    const { data } = await API.put(`/admin/feedback/${feedbackId}/flag`);
    return data;
  } catch (error) {
    console.error(`Error flagging feedback ${feedbackId}:`, error);
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

  // Venue Management
  getAllVenues,
  getActiveVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  getVenueConflicts,
  
  // Export Functions
  exportEventsCsv,
  exportEventsPdf,
  exportUsersCsv,
  exportUsersPdf,
  exportRegistrationsCsv,
  exportRegistrationsPdf,
  downloadFile,
  
  // Feedback Moderation
  getAllFeedback,
  getUnreviewedFeedback,
  getFlaggedFeedback,
  deleteFeedback,
  markFeedbackAsReviewed,
  flagFeedback,

  // Event Approval
  getPendingEvents,
  getRejectedEvents,
  getApprovedEventsAdmin,
  approveEvent,
  rejectEvent,
  reviewEvent,
  getEventsByStatus,
  getApprovalStats,

};

