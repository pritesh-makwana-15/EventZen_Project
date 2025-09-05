// src/services/organizer.js
import API from "./api";

// ===== ORGANIZER DASHBOARD SERVICES =====

/**
 * Get current organizer's events (for dashboard)
 */
export const getMyEvents = async () => {
  const { data } = await API.get("/events/my-events");
  return data;
};

/**
 * Create a new event
 */
export const createEvent = async (eventData) => {
  const { data } = await API.post("/events", eventData);
  return data;
};

/**
 * Update an existing event
 */
export const updateEvent = async (eventId, eventData) => {
  const { data } = await API.put(`/events/${eventId}`, eventData);
  return data;
};

/**
 * Delete/Cancel an event
 */
export const deleteEvent = async (eventId) => {
  await API.delete(`/events/${eventId}`);
};

/**
 * Get current user's profile
 */
export const getProfile = async () => {
  const { data } = await API.get("/users/profile");
  return data;
};

/**
 * Update current user's profile
 */
export const updateProfile = async (profileData) => {
  const { data } = await API.put("/users/profile", profileData);
  return data;
};

// ===== ENHANCED EVENTS SERVICES =====

/**
 * Get all public events (for visitors)
 */
export const getAllEvents = async () => {
  const { data } = await API.get("/events");
  return data;
};

/**
 * Get single event by ID
 */
export const getEventById = async (eventId) => {
  const { data } = await API.get(`/events/${eventId}`);
  return data;
};

/**
 * Get events by specific organizer (public view)
 */
export const getEventsByOrganizer = async (organizerId) => {
  const { data } = await API.get(`/events/organizer/${organizerId}`);
  return data;
};

// ===== AUTHENTICATION SERVICES =====

/**
 * Login user
 */
export const login = async (credentials) => {
  const { data } = await API.post("/auth/login", credentials);
  
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);
  }
  
  return data;
};

/**
 * Register new user
 */
export const register = async (userData) => {
  const { data } = await API.post("/auth/register", userData);
  return data;
};

/** 
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");  
  localStorage.removeItem("email");
};