// src/services/events.js
import axios from "axios";

// Create a separate axios instance WITHOUT authentication for public endpoints
const PublicAPI = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

// Import the authenticated API for other operations
import API from "./api";

// Fetch all events WITHOUT authentication (public endpoint)
export const fetchAllEvents = async () => {
  try {
    const { data } = await PublicAPI.get("/events");
    return data;
  } catch (error) {
    console.error("Error fetching public events:", error);
    throw error;
  }
};

// Fetch event by ID WITHOUT authentication (public endpoint)
export const fetchEventById = async (id) => {
  try {
    const { data } = await PublicAPI.get(`/events/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching event details:", error);
    throw error;
  }
};

// Below functions still require authentication
export const fetchEventsByOrganizer = async (organizerId) => {
  const { data } = await API.get(`/events/organizer/${organizerId}`);
  return data;
};

export const createEvent = async (eventData) => {
  const { data } = await API.post("/events", eventData);
  return data;
};

export const updateEvent = async (id, eventData) => {
  const { data } = await API.put(`/events/${id}`, eventData);
  return data;
};

export const deleteEvent = async (id) => {
  await API.delete(`/events/${id}`);
};