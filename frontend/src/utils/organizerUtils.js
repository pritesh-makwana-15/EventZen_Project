// src/utils/organizerUtils.js

/**
 * Format date for display in organizer dashboard
 */
export const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Check if event is upcoming
 */
export const isUpcomingEvent = (dateString) => {
  return new Date(dateString) > new Date();
};

/**
 * Get event status
 */
export const getEventStatus = (dateString) => {
  return isUpcomingEvent(dateString) ? 'Upcoming' : 'Past';
};

/**
 * Validate event form data
 */
export const validateEventForm = (eventData) => {
  const errors = [];
  
  if (!eventData.title?.trim()) {
    errors.push('Event title is required');
  }
  
  if (!eventData.description?.trim()) {
    errors.push('Event description is required');
  }
  
  if (!eventData.date) {
    errors.push('Event date is required');
  } else {
    const eventDate = new Date(eventData.date);
    const now = new Date();
    if (eventDate <= now) {
      errors.push('Event date must be in the future');
    }
  }
  
  if (!eventData.location?.trim()) {
    errors.push('Event location is required');
  }
  
  if (!eventData.category?.trim()) {
    errors.push('Event category is required');
  }
  
  // Validate image URL if provided
  if (eventData.imageUrl && !isValidUrl(eventData.imageUrl)) {
    errors.push('Please provide a valid image URL');
  }
  
  return errors;
};

/**
 * Validate URL format
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Format location with state and city
 */
export const formatLocation = (location, city, state) => {
  const parts = [location?.trim(), city?.trim(), state?.trim()].filter(Boolean);
  return parts.join(', ');
};

/**
 * Parse location to extract components
 */
export const parseLocation = (fullLocation) => {
  if (!fullLocation) return { location: '', city: '', state: '' };
  
  const parts = fullLocation.split(', ').map(part => part.trim());
  
  if (parts.length >= 3) {
    return {
      location: parts.slice(0, -2).join(', '),
      city: parts[parts.length - 2],
      state: parts[parts.length - 1]
    };
  }
  
  return { location: fullLocation, city: '', state: '' };
};

/**
 * Get user role from localStorage
 */
export const getUserRole = () => {
  return localStorage.getItem('role');
};

/**
 * Check if user is organizer
 */
export const isOrganizer = () => {
  return getUserRole() === 'ORGANIZER';
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Clear messages after timeout
 */
export const clearMessageAfterDelay = (setMessage, delay = 3000) => {
  setTimeout(() => {
    setMessage('');
  }, delay);
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error, setErrorMessage) => {
  const message = error?.response?.data?.message || 
                 error?.message || 
                 'An unexpected error occurred';
  
  console.error('API Error:', error);
  setErrorMessage(message);
  
  // Clear error after 5 seconds
  clearMessageAfterDelay(setErrorMessage, 5000);
};

/**
 * Format datetime for datetime-local input
 */
export const formatDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
};

/**
 * State and city data for location selection
 */
export const LOCATION_DATA = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Delhi: ["New Delhi"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangalore"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "West Bengal": ["Kolkata", "Siliguri", "Howrah"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
  Punjab: ["Amritsar", "Ludhiana", "Chandigarh"],
};

/**
 * Event categories
 */
export const EVENT_CATEGORIES = [
  'Music',
  'Technology',
  'Sports',
  'Art',
  'Business',
  'Education',
  'Food',
  'Health',
  'Travel',
  'Entertainment',
  'Other'
];

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};