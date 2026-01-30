// src/services/registrations.js
import API from "./api";

/**
 * Register visitor for an event (backwards-compatible)
 *
 * Usage patterns supported:
 * 1) New style (preferred):
 *    registerForEvent(eventId, { name, email, phone, notes, privateCode })
 *    -> POST /events/:eventId/register
 *
 * 2) Old style (legacy):
 *    registerForEvent(eventId, visitorId, privateCode = null)
 *    -> POST /registrations
 *
 * Returns: response data from the API
 */
export const registerForEvent = async (eventId, payloadOrVisitorId, maybePrivateCode = null) => {
  // If second argument is an object -> new API (form-based)
  if (payloadOrVisitorId && typeof payloadOrVisitorId === "object") {
    const registrationData = payloadOrVisitorId;
    const { data } = await API.post(`/events/${eventId}/register`, registrationData);
    return data;
  }

  // Otherwise assume legacy call: (eventId, visitorId, privateCode)
  const visitorId = payloadOrVisitorId;
  const privateCode = maybePrivateCode;

  const { data } = await API.post("/registrations", {
    eventId,
    visitorId,
    privateCode, // may be null
  });
  return data;
};

/**
 * Get all registrations for current visitor
 * GET /registrations/visitor/:visitorId
 */
export const getMyRegistrations = async (visitorId) => {
  const { data } = await API.get(`/registrations/visitor/${visitorId}`);
  return data;
};

/**
 * Get registrations for a specific event
 * GET /registrations/event/:eventId
 */
export const getEventRegistrations = async (eventId) => {
  const { data } = await API.get(`/registrations/event/${eventId}`);
  return data;
};

/**
 * Cancel a registration (permanent delete)
 * DELETE /registrations/:registrationId
 */
export const cancelRegistration = async (registrationId) => {
  await API.delete(`/registrations/${registrationId}`);
};
