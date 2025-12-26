// ================================================================
// FILE: src/services/visitorService.js
// PURPOSE: All visitor-specific API calls
// ================================================================

import API from "./api";

// ================================================================
// MY REGISTRATIONS
// ================================================================

/**
 * Get all registrations for current visitor
 * GET /api/visitor/registrations
 */
export const getMyRegistrations = async () => {
  const { data } = await API.get("/visitor/registrations");
  return data;
};

// ================================================================
// TICKET SERVICES
// ================================================================

/**
 * Get ticket details by ticket ID
 * GET /api/visitor/tickets/:ticketId
 */
export const getTicketDetails = async (ticketId) => {
  const { data } = await API.get(`/visitor/tickets/${ticketId}`);
  return data;
};

/**
 * Download ticket PDF
 * GET /api/visitor/tickets/:ticketId/pdf
 * Returns: Blob (PDF file)
 */
export const downloadTicketPDF = async (ticketId) => {
  const response = await API.get(`/visitor/tickets/${ticketId}/pdf`, {
    responseType: "blob",
  });
  return response.data;
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
  getTicketDetails,
  downloadTicketPDF,
  submitFeedback,
  getEventFeedback,
  setReminder,
  getMyReminders,
  deleteReminder,
  getVenueDetails,
  getCalendarEvents,
};