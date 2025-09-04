// src/services/registrations.js
import API from "./api";

export const registerForEvent = async (registrationData) => {
  const { data } = await API.post("/registrations", registrationData);
  return data;
};

export const getRegistrationsByVisitor = async (visitorId) => {
  const { data } = await API.get(`/registrations/visitor/${visitorId}`);
  return data;
};

export const getRegistrationsByEvent = async (eventId) => {
  const { data } = await API.get(`/registrations/event/${eventId}`);
  return data;
};

// ✅ Use DELETE for cancel (matches REST convention)
export const cancelRegistration = async (registrationId) => {
  await API.delete(`/registrations/${registrationId}`);
};
