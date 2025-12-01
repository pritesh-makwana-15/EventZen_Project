// ================================================================
// FILE: src/utils/dateTime.js
// 🆕 NEW: Centralized Date/Time Formatting Utilities
// Purpose: Consistent date/time handling across Organizer Dashboard
// ================================================================

/**
 * Format date to DD/MM/YYYY format
 * @param {string} dateString - Date string (YYYY-MM-DD or ISO format)
 * @returns {string} Formatted date (DD/MM/YYYY)
 */
export const formatDateDDMMYYYY = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format time to 12-hour AM/PM format
 * @param {string} timeString - Time string (HH:mm or HH:mm:ss)
 * @returns {string} Formatted time (hh:mm AM/PM)
 */
export const formatTimeAMPM = (timeString) => {
  if (!timeString) return 'N/A';
  
  // Handle both "HH:mm" and "HH:mm:ss" formats
  const timeParts = timeString.split(':');
  if (timeParts.length < 2) return 'Invalid Time';
  
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];
  
  if (isNaN(hours) || hours < 0 || hours > 23) return 'Invalid Time';
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight
  
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

/**
 * Format combined date and time for display
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @param {string} timeString - Time string (HH:mm)
 * @returns {string} Formatted datetime (DD/MM/YYYY at hh:mm AM/PM)
 */
export const formatDateTimeAMPM = (dateString, timeString) => {
  if (!dateString || !timeString) return 'N/A';
  return `${formatDateDDMMYYYY(dateString)} at ${formatTimeAMPM(timeString)}`;
};

/**
 * Validate date/time inputs for event form
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @returns {Object} Validation result {isValid: boolean, errors: object}
 */
export const validateDateTime = (startDate, endDate, startTime, endTime) => {
  const errors = {};
  
  if (!startDate) {
    errors.startDate = 'Start date is required';
  }
  
  if (!startTime) {
    errors.startTime = 'Start time is required';
  }
  
  if (!endDate) {
    errors.endDate = 'End date is required';
  }
  
  if (!endTime) {
    errors.endTime = 'End time is required';
  }
  
  // If all fields present, validate logic
  if (startDate && endDate && startTime && endTime) {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    // Check if dates are valid
    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date';
    }
    
    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date';
    }
    
    // Check if end is after start
    if (end <= start) {
      errors.endDate = 'End date/time must be after start date/time';
    }
    
    // Check if start is in the future
    const now = new Date();
    if (start <= now) {
      errors.startDate = 'Event must start in the future';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Convert 24-hour time to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:mm)
 * @returns {string} Time in 12-hour format (hh:mm AM/PM)
 */
export const convertTo12Hour = (time24) => {
  return formatTimeAMPM(time24);
};

/**
 * Convert 12-hour time to 24-hour format
 * @param {string} time12 - Time in 12-hour format (hh:mm AM/PM)
 * @returns {string} Time in 24-hour format (HH:mm)
 */
export const convertTo24Hour = (time12) => {
  if (!time12) return '';
  
  const timeMatch = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return time12; // Return as-is if not matching expected format
  
  let hours = parseInt(timeMatch[1], 10);
  const minutes = timeMatch[2];
  const period = timeMatch[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

/**
 * Get tomorrow's date in YYYY-MM-DD format (for min date validation)
 * @returns {string} Tomorrow's date
 */
export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
};

/**
 * Check if an event is upcoming (based on start date/time)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} startTime - Start time (HH:mm)
 * @returns {boolean} True if event is upcoming
 */
export const isUpcomingEvent = (startDate, startTime) => {
  if (!startDate || !startTime) return false;
  const eventDateTime = new Date(`${startDate}T${startTime}`);
  return eventDateTime > new Date();
};

/**
 * Parse combined location back into components
 * @param {string} location - Combined location string
 * @returns {Object} {address, city, state}
 */
export const parseLocation = (location) => {
  if (!location) return { address: '', city: '', state: '' };
  
  const parts = location.split(', ').map(part => part.trim());
  
  if (parts.length >= 3) {
    return {
      address: parts.slice(0, -2).join(', '),
      city: parts[parts.length - 2],
      state: parts[parts.length - 1]
    };
  } else if (parts.length === 2) {
    return {
      address: parts[0],
      city: parts[1],
      state: ''
    };
  }
  
  return { address: location, city: '', state: '' };
};

/**
 * Format duration between start and end times
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @returns {string} Duration in hours/minutes
 */
export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A';
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Handle overnight events
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

// Export all functions as named exports
export default {
  formatDateDDMMYYYY,
  formatTimeAMPM,
  formatDateTimeAMPM,
  validateDateTime,
  convertTo12Hour,
  convertTo24Hour,
  getTomorrowDate,
  isUpcomingEvent,
  parseLocation,
  formatDuration
};