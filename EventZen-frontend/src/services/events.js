// src/services/events.js
import API from "./api";

export const fetchAllEvents = async () => {
  const { data } = await API.get("/events");
  return data;
};

export const fetchEventById = async (id) => {
  const { data } = await API.get(`/events/${id}`);
  return data;
};

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
