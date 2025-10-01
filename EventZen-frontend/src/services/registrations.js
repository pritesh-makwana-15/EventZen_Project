// src/services/registrations.js
import API from "./api";

/**
 * Register visitor for an event
 * Now supports private event code
 */
export const registerForEvent = async (eventId, visitorId, privateCode = null) => {
  const { data } = await API.post("/registrations", {
    eventId,
    visitorId,
    privateCode  // Send private code if provided
  });
  return data;
};

/**
 * Get all registrations for current visitor
 */
export const getMyRegistrations = async (visitorId) => {
  const { data } = await API.get(`/registrations/visitor/${visitorId}`);
  return data;
};

/**
 * Get registrations for specific event
 */
export const getEventRegistrations = async (eventId) => {
  const { data } = await API.get(`/registrations/event/${eventId}`);
  return data;
};

/**
 * Cancel a registration
 */
export const cancelRegistration = async (registrationId) => {
  await API.put(`/registrations/cancel/${registrationId}`);
};