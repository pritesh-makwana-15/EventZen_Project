// ================================================================
// FILE: src/services/visitorService.js (FIXED)
// PURPOSE: All visitor-specific API calls
// CHANGES:
//   - Fixed downloadTicketPDF to use registrationId instead of ticketId
//   - Updated endpoint to /visitor/registrations/{id}/ticket/download
//   - All endpoints now match backend implementation
// ================================================================

import API from "./api";

// ================================================================
// MY REGISTRATIONS
// ================================================================

/**
 * Get all registrations for current visitor
 * GET /api/visitor/registrations
 * 
 * Returns: Array of RegistrationResponse with hasTicket field
 */
export const getMyRegistrations = async () => {
  const { data } = await API.get("/visitor/registrations");
  return data;
};

// ================================================================
// TICKET SERVICES (FIXED)
// ================================================================

/**
 * 🆕 FIXED: Download ticket PDF by registration ID
 * GET /api/visitor/registrations/{registrationId}/ticket/download
 * 
 * @param {number} registrationId - Registration ID (NOT ticketId!)
 * @returns {Blob} PDF file
 */
export const downloadTicketPDF = async (registrationId) => {
  const response = await API.get(`/visitor/registrations/${registrationId}/ticket/download`, {
    responseType: "blob",
  });
  return response.data;
};

/**
 * 🆕 NEW: Check if ticket exists for a registration
 * GET /api/visitor/registrations/{registrationId}/ticket/exists
 * 
 * @param {number} registrationId - Registration ID
 * @returns {object} { exists: boolean, registrationId: number }
 */
export const checkTicketExists = async (registrationId) => {
  const { data } = await API.get(`/visitor/registrations/${registrationId}/ticket/exists`);
  return data;
};

/**
 * 🆕 NEW: Get ticket details (without downloading PDF)
 * GET /api/visitor/registrations/{registrationId}/ticket
 * 
 * @param {number} registrationId - Registration ID
 * @returns {object} { ticketId, ticketCode, issuedAt, isCheckedIn }
 */
export const getTicketDetails = async (registrationId) => {
  const { data } = await API.get(`/visitor/registrations/${registrationId}/ticket`);
  return data;
};

// ================================================================
// FEEDBACK SERVICES
// ================================================================

/**
 * Submit feedback for an event
 * POST /api/visitor/events/:eventId/feedback
 * 
 * @param {number} eventId - Event ID
 * @param {object} feedbackData - { rating: 1-5, comment: string }
 */
export const submitFeedback = async (eventId, feedbackData) => {
  const { data } = await API.post(`/visitor/events/${eventId}/feedback`, feedbackData);
  return data;
};

/**
 * Get all approved feedback for an event
 * GET /api/visitor/events/:eventId/feedback
 */
export const getEventFeedback = async (eventId) => {
  const { data } = await API.get(`/visitor/events/${eventId}/feedback`);
  return data;
};

// ================================================================
// REMINDER SERVICES
// ================================================================

/**
 * Set reminder for an event
 * POST /api/visitor/reminders
 * 
 * @param {number} eventId - Event ID
 */
export const setReminder = async (eventId) => {
  const { data } = await API.post("/visitor/reminders", { eventId });
  return data;
};

/**
 * Get all reminders for current visitor
 * GET /api/visitor/reminders
 */
export const getMyReminders = async () => {
  const { data } = await API.get("/visitor/reminders");
  return data;
};

/**
 * Delete a reminder
 * DELETE /api/visitor/reminders/:reminderId
 */
export const deleteReminder = async (reminderId) => {
  await API.delete(`/visitor/reminders/${reminderId}`);
};

// ================================================================
// VENUE SERVICES
// ================================================================

/**
 * Get venue details including map data
 * GET /api/visitor/venues/:venueId
 */
export const getVenueDetails = async (venueId) => {
  const { data } = await API.get(`/visitor/venues/${venueId}`);
  return data;
};

// ================================================================
// CALENDAR SERVICES
// ================================================================

/**
 * Get visitor's calendar events (registered events only)
 * GET /api/visitor/calendar/events
 * 
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 */
export const getCalendarEvents = async (from, to) => {
  const { data } = await API.get("/visitor/calendar/events", {
    params: { from, to },
  });
  return data;
};

// ================================================================
// EXPORT ALL
// ================================================================

export default {
  getMyRegistrations,
  downloadTicketPDF,
  checkTicketExists,
  getTicketDetails,
  submitFeedback,
  getEventFeedback,
  setReminder,
  getMyReminders,
  deleteReminder,
  getVenueDetails,
  getCalendarEvents,
};

// ================================================================
// USAGE NOTES:
// 
// ✅ CORRECT USAGE:
//   const blob = await downloadTicketPDF(registrationId);
//
// ❌ WRONG USAGE:
//   const blob = await downloadTicketPDF(ticketId); // Backend doesn't accept ticketId!
//
// ✅ TICKET DOWNLOAD FLOW:
//   1. Get registrations: getMyRegistrations()
//   2. Check if has ticket: registration.hasTicket === true
//   3. Download using registration ID: downloadTicketPDF(registration.id)
// ================================================================