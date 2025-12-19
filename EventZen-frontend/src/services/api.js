// ================================================================
// FILE: src/services/api.js
// STATUS: ✅ FINAL MERGED (Old + New) – Stable & Production Ready
// ================================================================

import axios from "axios";

// ================================================================
// AXIOS INSTANCE
// ================================================================

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

// ================================================================
// REQUEST INTERCEPTOR – Attach JWT
// ================================================================

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ================================================================
// RESPONSE INTERCEPTOR – Global 401 Handling
// ================================================================

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ================================================================
// EVENT SERVICES
// ================================================================

// Organizer – My Events
export const getMyEvents = async () => {
  const { data } = await API.get("/events/my-events");
  return data;
};

// Organizer – Upcoming Events
export const getUpcomingEvents = async (organizerId) => {
  const { data } = await API.get(`/events/organizer/${organizerId}/upcoming`);
  return data;
};

// Organizer – Past Events
export const getPastEvents = async (organizerId) => {
  const { data } = await API.get(`/events/organizer/${organizerId}/past`);
  return data;
};

// Organizer – Calendar Events
export const getEventsForOrganizerCalendar = async (params) => {
  const { data } = await API.get("/events/organizer/calendar", { params });
  return data;
};

// Visitor – Calendar Events
export const getVisitorCalendarEvents = async (from, to) => {
  const { data } = await API.get("/visitor/calendar/events", {
    params: { from, to }
  });
  return data;
};

// Create Event
export const createEvent = async (eventData) => {
  const { data } = await API.post("/events", eventData);
  return data;
};

// Update Event
export const updateEvent = async (eventId, eventData) => {
  const { data } = await API.put(`/events/${eventId}`, eventData);
  return data;
};

// Delete / Cancel Event
export const deleteEvent = async (eventId) => {
  await API.delete(`/events/${eventId}`);
};

// Get Event by ID
export const getEventById = async (eventId) => {
  const { data } = await API.get(`/events/${eventId}`);
  return data;
};

// Public – All Events
export const getAllEvents = async () => {
  const { data } = await API.get("/events");
  return data;
};

// Public – Events by Organizer
export const getEventsByOrganizer = async (organizerId) => {
  const { data } = await API.get(`/events/organizer/${organizerId}`);
  return data;
};

// ================================================================
// USER / PROFILE SERVICES
// ================================================================

export const getUserProfile = async () => {
  const { data } = await API.get("/users/profile");
  return data;
};

export const updateUserProfile = async (profileData) => {
  const { data } = await API.put("/users/profile", profileData);
  return data;
};

// ================================================================
// FILE UPLOAD SERVICES
// ================================================================

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await API.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

// ================================================================
// AUTH SERVICES
// ================================================================

export const login = async (credentials) => {
  const { data } = await API.post("/auth/login", credentials);

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
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
  localStorage.removeItem("userId");
};

// ================================================================
// 🆕 VENUE SERVICES (NEW – SAFE TO ADD)
// ================================================================

/**
 * Get all active venues (Organizer dropdown)
 */
export const getActiveVenues = async () => {
  const { data } = await API.get("/organizer/venues");
  return data;
};

/**
 * Get venue details by ID
 */
export const getVenueById = async (venueId) => {
  const { data } = await API.get(`/organizer/venues/${venueId}`);
  return data;
};

/**
 * Check venue availability (prevent double booking)
 */
export const checkVenueAvailability = async (
  venueId,
  startDate,
  endDate,
  excludeEventId = null
) => {
  const params = { startDate, endDate };
  if (excludeEventId) params.excludeEventId = excludeEventId;

  const { data } = await API.get(
    `/organizer/venues/${venueId}/availability`,
    { params }
  );
  return data;
};

export default API;
