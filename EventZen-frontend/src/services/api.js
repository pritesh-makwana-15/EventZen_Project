// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

// Attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Handle 401 Unauthorized globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      // Optional: redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ===== EVENT SERVICES =====

// Get current organizer's events
export const getMyEvents = async () => {
  const { data } = await API.get("/events/my-events");
  return data;
};

// Get upcoming events for organizer
export const getUpcomingEvents = async (organizerId) => {
  const { data } = await API.get(`/events/organizer/${organizerId}/upcoming`);
  return data;
};

// Get past events for organizer
export const getPastEvents = async (organizerId) => {
  const { data } = await API.get(`/events/organizer/${organizerId}/past`);
  return data;
};

// Create a new event
export const createEvent = async (eventData) => {
  const { data } = await API.post("/events", eventData);
  return data;
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  const { data } = await API.put(`/events/${eventId}`, eventData);
  return data;
};

// Delete/Cancel an event
export const deleteEvent = async (eventId) => {
  await API.delete(`/events/${eventId}`);
};

// Get single event by ID
export const getEventById = async (eventId) => {
  const { data } = await API.get(`/events/${eventId}`);
  return data;
};

// Get all public events
export const getAllEvents = async () => {
  const { data } = await API.get("/events");
  return data;
};

// Get events by organizer (public)
export const getEventsByOrganizer = async (organizerId) => {
  const { data } = await API.get(`/events/organizer/${organizerId}`);
  return data;
};

// ===== USER/PROFILE SERVICES =====

// Get current user's profile
export const getUserProfile = async () => {
  const { data } = await API.get("/users/profile");
  return data;
};

// Update current user's profile
export const updateUserProfile = async (profileData) => {
  const { data } = await API.put("/users/profile", profileData);
  return data;
};

// ===== FILE UPLOAD SERVICES =====

// Upload file (image)
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await API.post("/uploads", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

// ===== AUTHENTICATION SERVICES =====

// Login user
export const login = async (credentials) => {
  const { data } = await API.post("/auth/login", credentials);
  
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);
  }
  
  return data;
};

// Register new user
export const register = async (userData) => {
  const { data } = await API.post("/auth/register", userData);
  return data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
};

export default API;