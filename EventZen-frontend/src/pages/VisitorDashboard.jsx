// ================================================================
// FILE: src/pages/VisitorDashboard.jsx - PART 1/5
// CHANGES: Added mobile menu state, Lucide icons, registered filter state
// Added dateTime utility imports for AM/PM formatting
// ================================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Visitor page styling/VisitorDashboard.css";
import API from "../services/api";
import { registerForEvent, getMyRegistrations, cancelRegistration } from "../services/registrations";
import { 
  getMyRegistrations as getVisitorRegistrations,
  setReminder,
  getMyReminders,
  deleteReminder
} from "../services/visitorService";
import {
  Calendar,
  Users,
  User,
  LogOut,
  X,
  Eye,
  Filter,
  RotateCcw,
  ImagePlus,
  Menu,
  Clock,
  MapPin,
  Tag,
  UserCheck,
  Lock,
  Globe,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,  // 🆕 NEW
  ChevronRight, // 🆕 NEW
  Loader,        // 🆕 NEW  ,
  Download,     // For ticket download
  Bell,         // For reminder
  BellOff,      // For remove reminder
  MessageSquare, // For feedback
  MapIcon,      // For venue map
  Star          // For rating display
} from "lucide-react";

// Import date/time utilities for AM/PM formatting
import {
  formatDateDDMMYYYY,
  formatTimeAMPM,
  formatDateTimeAMPM,
  isUpcomingEvent
} from "../utils/dateTime";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import TicketDownloadButton from "../components/Visitor dashboard/TicketDownloadButton";
import FeedbackForm from "../components/Visitor dashboard/FeedbackForm";
import VenueMapViewer from "../components/Visitor dashboard/VenueMapViewer";
import CountdownTimer from "../components/Visitor dashboard/CountdownTimer";


export default function VisitorDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("events");
  
  // Mobile menu state (NEW)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [allEvents, setAllEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regEvent, setRegEvent] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    privateCode: ""
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [organizerFilter, setOrganizerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [registeredFilter, setRegisteredFilter] = useState("all"); // NEW: all/registered/not-registered

  // My Registrations filters
  const [registrationFilter, setRegistrationFilter] = useState("all");
  const [regEventNameFilter, setRegEventNameFilter] = useState("");
  const [regCategoryFilter, setRegCategoryFilter] = useState("");
  const [regLocationFilter, setRegLocationFilter] = useState("");
  const [regOrganizerFilter, setRegOrganizerFilter] = useState("");
  const [regTypeFilter, setRegTypeFilter] = useState("");

  // Profile editing state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    imageUrl: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });

  // 🆕 NEW: Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackEvent, setFeedbackEvent] = useState(null);

  // 🆕 NEW: Venue map modal state
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  // 🆕 NEW: Reminders state
  const [reminders, setReminders] = useState(new Set()); // Set of eventIds with reminders
  const [reminderLoading, setReminderLoading] = useState({});


  const calendarRef = useRef(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mobile menu toggle handler (NEW)
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Close mobile menu when clicking outside (NEW)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  // Trap focus inside mobile menu when open (NEW)
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const focusableElements = mobileMenuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (activePage === "events") {
      loadAllEvents();
    } else if (activePage === "registrations") {
      loadMyRegistrationsUpdated();
    }
  }, [activePage]);

  const loadUserData = async () => {
    try {
      const response = await API.get("/users/profile");
      setUserProfile(response.data);
      setUserId(response.data.id);
      localStorage.setItem("userId", response.data.id);
      
      setProfileForm({
        name: response.data.name,
        email: response.data.email,
        mobileNumber: response.data.mobileNumber || "",
        imageUrl: response.data.imageUrl || ""
      });
      
      // Pre-fill registration form with user data
      setRegistrationForm(prev => ({
        ...prev,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.mobileNumber || ""
      }));
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError("Failed to load user profile");
    }
  };

  // ================================================================
// FILE: src/pages/VisitorDashboard.jsx - PART 2/5
// Data loading functions and event handlers
// ================================================================

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/events");
      
      const upcomingEvents = response.data.filter(event => {
        // Use startDate if available, fallback to date field
        const eventDateStr = event.startDate || event.date;
        const eventTimeStr = event.startTime || '00:00';
        const eventDate = new Date(`${eventDateStr}T${eventTimeStr}`);
        return event.isActive && eventDate >= new Date();
      });
      
      setAllEvents(upcomingEvents);
      
      if (userId || localStorage.getItem("userId")) {
        await loadRegistrationStatus();
      }
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrationStatus = async () => {
    try {
      const storedUserId = userId || localStorage.getItem("userId");
      if (!storedUserId) return;
      
      const response = await getMyRegistrations(storedUserId);
      const registeredIds = new Set(
        response
          .filter(reg => reg.status !== "CANCELLED")
          .map(reg => reg.eventId)
      );
      setRegisteredEventIds(registeredIds);
    } catch (err) {
      console.error("Error loading registration status:", err);
    }
  };

  const loadMyRegistrations = async () => {
    try {
      setLoading(true);
      const storedUserId = userId || localStorage.getItem("userId");
      if (!storedUserId) {
        setError("User not logged in");
        return;
      }

      const registrations = await getMyRegistrations(storedUserId);
      
      const registrationsWithEvents = await Promise.all(
        registrations
          .filter(reg => reg.status !== "CANCELLED")
          .map(async (reg) => {
            try {
              const eventResponse = await API.get(`/events/${reg.eventId}`);
              return {
                ...reg,
                event: eventResponse.data
              };
            } catch (err) {
              console.error(`Error loading event ${reg.eventId}:`, err);
              return null;
            }
          })
      );

      setMyRegistrations(registrationsWithEvents.filter(r => r !== null));
    } catch (err) {
      console.error("Error loading registrations:", err);
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
// FILE: src/pages/VisitorDashboard.jsx - UPDATES PART 2
// ADD these handler functions after loadMyRegistrations() around line 280
// ================================================================

// 🆕 NEW: Load reminders when registrations load
useEffect(() => {
  if (activePage === "registrations" && userId) {
    loadReminders();
  }
}, [activePage, userId]);

// 🆕 NEW: Load user's reminders
const loadReminders = async () => {
  try {
    const response = await getMyReminders();
    const reminderEventIds = new Set(response.map(r => r.eventId));
    setReminders(reminderEventIds);
  } catch (err) {
    console.error("Error loading reminders:", err);
  }
};

// 🆕 NEW: Handle reminder toggle
const handleReminderToggle = async (eventId) => {
  try {
    setReminderLoading(prev => ({ ...prev, [eventId]: true }));

    if (reminders.has(eventId)) {
      // Remove reminder
      const response = await getMyReminders();
      const reminder = response.find(r => r.eventId === eventId);
      if (reminder) {
        await deleteReminder(reminder.id);
        setReminders(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        setSuccess("Reminder removed");
      }
    } else {
      // Add reminder
      await setReminder(eventId);
      setReminders(prev => new Set([...prev, eventId]));
      setSuccess("Reminder set! You'll receive an email 1 day before the event");
    }

    setTimeout(() => setSuccess(""), 3000);
  } catch (err) {
    console.error("Error toggling reminder:", err);
    setError(err.response?.data?.error || "Failed to update reminder");
    setTimeout(() => setError(""), 3000);
  } finally {
    setReminderLoading(prev => ({ ...prev, [eventId]: false }));
  }
};

// 🆕 NEW: Handle feedback modal open
const handleOpenFeedbackModal = (event) => {
  setFeedbackEvent(event);
  setShowFeedbackModal(true);
};

// 🆕 NEW: Handle feedback modal close
const handleCloseFeedbackModal = () => {
  setShowFeedbackModal(false);
  setFeedbackEvent(null);
};

// 🆕 NEW: Handle feedback success
const handleFeedbackSuccess = (message) => {
  setSuccess(message);
  setTimeout(() => setSuccess(""), 3000);
  handleCloseFeedbackModal();
};

// 🆕 NEW: Handle venue map open
const handleOpenVenueMap = (venueId) => {
  setSelectedVenueId(venueId);
  setShowVenueModal(true);
};

// 🆕 NEW: Handle venue map close
const handleCloseVenueMap = () => {
  setShowVenueModal(false);
  setSelectedVenueId(null);
};

// 🆕 NEW: Check if event has ended (for feedback)
const hasEventEnded = (event) => {
  if (!event.endDate || !event.endTime) return false;
  const eventEnd = new Date(`${event.endDate}T${event.endTime}`);
  return eventEnd < new Date();
};

// 🆕 NEW: Update loadMyRegistrations to use visitor service
const loadMyRegistrationsUpdated = async () => {
  try {
    setLoading(true);

    // Use visitor service instead of old method
    const registrations = await getVisitorRegistrations();

    const registrationsWithEvents = await Promise.all(
      registrations.map(async (reg) => {
        try {
          const eventResponse = await API.get(`/events/${reg.eventId}`);
          return {
            ...reg,
            event: eventResponse.data,
            ticketId: reg.ticketId, // From backend response
            hasTicket: reg.hasTicket // From backend response
          };
        } catch (err) {
          console.error(`Error loading event ${reg.eventId}:`, err);
          return null;
        }
      })
    );

    setMyRegistrations(registrationsWithEvents.filter(r => r !== null));
  } catch (err) {
    console.error("Error loading registrations:", err);
    setError("Failed to load registrations");
  } finally {
    setLoading(false);
  }
};

  // Registration Modal Handlers
  const handleOpenRegisterModal = (event) => {
    setRegEvent(event);
    setRegError("");
    
    // Pre-fill form with user data
    setRegistrationForm({
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.mobileNumber || "",
      notes: "",
      privateCode: ""
    });
    
    setShowRegisterModal(true);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
    setRegEvent(null);
    setRegError("");
    setRegistrationForm({
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.mobileNumber || "",
      notes: "",
      privateCode: ""
    });
  };

  const handleRegistrationFormChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
    setRegError("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!registrationForm.name.trim()) {
      setRegError("Name is required");
      return;
    }
    if (!registrationForm.email.trim()) {
      setRegError("Email is required");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationForm.email)) {
      setRegError("Please enter a valid email address");
      return;
    }
    
    if (regEvent.eventType === "PRIVATE" && !registrationForm.privateCode.trim()) {
      setRegError("Private code is required for this event");
      return;
    }

    try {
      setRegLoading(true);
      setRegError("");

      await registerForEvent(regEvent.id, registrationForm);
      
      setRegisteredEventIds(prev => new Set([...prev, regEvent.id]));
      setSuccess("Successfully registered for the event!");
      setTimeout(() => setSuccess(""), 3000);
      
      handleCloseRegisterModal();
      loadAllEvents();
      
    } catch (err) {
      console.error("Error registering for event:", err);
      const errorMsg = err.response?.data?.message || err.message || "Registration failed";
      setRegError(errorMsg);
    } finally {
      setRegLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId, eventId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    try {
      await cancelRegistration(registrationId);
      setRegisteredEventIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      setSuccess("Registration cancelled successfully");
      setTimeout(() => setSuccess(""), 3000);
      
      if (activePage === "registrations") {
        loadMyRegistrations();
      } else {
        loadAllEvents();
      }
    } catch (err) {
      console.error("Error cancelling registration:", err);
      setError("Failed to cancel registration");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfileForm(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await API.put("/users/profile", {
        name: profileForm.name,
        mobileNumber: profileForm.mobileNumber,
        profileImage: profileForm.imageUrl
      });
      
      setUserProfile(response.data);
      
      if (passwordForm.currentPassword && passwordForm.newPassword) {
        try {
          await API.put("/users/password", {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          });
          
          setSuccess("Profile and password updated successfully!");
          setPasswordForm({ currentPassword: "", newPassword: "" });
        } catch (passErr) {
          console.error("Error updating password:", passErr);
          setError(passErr.response?.data || "Failed to update password");
          setLoading(false);
          return;
        }
      } else {
        setSuccess("Profile updated successfully!");
      }
      
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleReset = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setLocationFilter("");
    setOrganizerFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setRegisteredFilter("all"); // Reset registered filter
  };

  const handleRegistrationReset = () => {
    setRegistrationFilter("all");
    setRegEventNameFilter("");
    setRegCategoryFilter("");
    setRegLocationFilter("");
    setRegOrganizerFilter("");
    setRegTypeFilter("");
  };

  // ================================================================
// 🆕 NEW: Calendar Functions - Add after handleRegistrationReset() around line 220
// ================================================================

  // 🆕 NEW: Load calendar events when calendar tab is active
  useEffect(() => {
    if (activePage === "calendar") {
      loadCalendarEvents();
    }
  }, [activePage, currentDate, currentView]);

  // 🆕 NEW: Load visitor's registered events for calendar
  const loadCalendarEvents = async () => {
    setCalendarLoading(true);
    setError("");
    
    try {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) {
        setCalendarLoading(false);
        return;
      }

      // Get visible date range from calendar
      const view = calendarApi.view;
      const startDate = view.activeStart.toISOString().split('T')[0];
      const endDate = view.activeEnd.toISOString().split('T')[0];

      // Fetch visitor's registered events
      const response = await API.get("/visitor/calendar/events", {
        params: { from: startDate, to: endDate }
      });

      // Transform events for FullCalendar
      const transformedEvents = response.data.map(event => {
        const status = getEventStatus(event);
        return {
          id: event.id,
          title: event.title,
          start: `${event.startDate}T${event.startTime}`,
          end: `${event.endDate}T${event.endTime}`,
          backgroundColor: getCategoryColor(event.category),
          borderColor: getCategoryColor(event.category),
          classNames: [`cal-event-${status}`],
          extendedProps: {
            ...event,
            status: status,
          },
        };
      });

      setCalendarEvents(transformedEvents);
    } catch (err) {
      console.error("Error loading calendar events:", err);
      setError("Failed to load your calendar. Please try again.");
    } finally {
      setCalendarLoading(false);
    }
  };

  // 🆕 NEW: Determine event status
  const getEventStatus = (event) => {
    const now = new Date();
    const eventEnd = new Date(`${event.endDate}T${event.endTime}`);
    return eventEnd > now ? "upcoming" : "completed";
  };

  // 🆕 NEW: Get category color
  const getCategoryColor = (category) => {
    const colors = {
      Technology: "#667eea",
      Business: "#f59e0b",
      Music: "#ec4899",
      Health: "#10b981",
      Food: "#f97316",
      Art: "#8b5cf6",
      Community: "#3b82f6",
      Entertainment: "#ef4444",
      Education: "#06b6d4",
      Sports: "#84cc16",
      Other: "#6b7280",
    };
    return colors[category] || colors.Other;
  };

  // 🆕 NEW: Handle calendar event click
  const handleCalendarEventClick = async (clickInfo) => {
    const eventId = clickInfo.event.id;
    
    try {
      const response = await API.get(`/events/${eventId}`);
      setSelectedEvent(response.data);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details");
    }
  };

  // 🆕 NEW: Navigate calendar
  const handleCalendarNavigate = (direction) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === "prev") calendarApi.prev();
      else if (direction === "next") calendarApi.next();
      else if (direction === "today") calendarApi.today();
      
      setCurrentDate(calendarApi.getDate());
    }
  };

  // 🆕 NEW: Change calendar view
  const handleCalendarViewChange = (view) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
  };

  // 🆕 NEW: Format calendar toolbar title
  const formatCalendarTitle = () => {
    const options = { year: 'numeric', month: 'long' };
    if (currentView === 'timeGridWeek') {
      return currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    if (currentView === 'timeGridDay') {
      return currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    }
    return currentDate.toLocaleDateString('en-US', options);
  };

  // 🆕 NEW: Render calendar event content
  const renderCalendarEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const timeStr = event.start.toTimeString().split(' ')[0];
    const [hours24, minutes] = timeStr.split(':');
    let hours = parseInt(hours24);
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12 || 12;
    const formattedTime = parseInt(minutes) === 0 ? `${hours} ${ampm}` : `${hours}:${minutes} ${ampm}`;

    return (
      <div className="vis-cal-event-wrapper">
        <div className="vis-cal-event-time">{formattedTime}</div>
        <div className="vis-cal-event-title">{event.title}</div>
      </div>
    );
  };

  // ================================================================
// FILE: src/pages/VisitorDashboard.jsx - PART 3/5
// Filter logic and helper functions
// ================================================================

  // Filter events based on all criteria including registered status (NEW)
  const getFilteredEvents = () => {
    const now = new Date();
    
    return allEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !categoryFilter || event.category === categoryFilter;
      
      const matchesLocation = !locationFilter || 
                            event.location?.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesOrganizer = !organizerFilter || 
                              event.organizerName?.toLowerCase().includes(organizerFilter.toLowerCase());
      
      const matchesType = !typeFilter || event.eventType === typeFilter;
      
      // Status filter based on startDate/startTime or fallback to date
      const eventDateStr = event.startDate || event.date;
      const eventTimeStr = event.startTime || '00:00';
      const eventDate = new Date(`${eventDateStr}T${eventTimeStr}`);
      let matchesStatus = true;
      if (statusFilter === "Upcoming") {
        matchesStatus = eventDate >= now;
      } else if (statusFilter === "Completed") {
        matchesStatus = eventDate < now;
      }
      
      // NEW: Registered filter
      let matchesRegistered = true;
      if (registeredFilter === "registered") {
        matchesRegistered = registeredEventIds.has(event.id);
      } else if (registeredFilter === "not-registered") {
        matchesRegistered = !registeredEventIds.has(event.id);
      }
      
      return matchesSearch && matchesCategory && matchesLocation && 
             matchesOrganizer && matchesType && matchesStatus && matchesRegistered;
    });
  };

  const getFilteredRegistrations = () => {
    const now = new Date();
    
    return myRegistrations.filter(reg => {
      if (!reg.event) return false;
      
      // Use startDate/startTime if available, fallback to date
      const eventDateStr = reg.event.startDate || reg.event.date;
      const eventTimeStr = reg.event.startTime || '00:00';
      const eventDate = new Date(`${eventDateStr}T${eventTimeStr}`);
      
      let matchesStatusFilter = true;
      if (registrationFilter === "upcoming") {
        matchesStatusFilter = eventDate >= now;
      } else if (registrationFilter === "past") {
        matchesStatusFilter = eventDate < now;
      }
      
      const matchesEventName = !regEventNameFilter || 
                              reg.event.title?.toLowerCase().includes(regEventNameFilter.toLowerCase());
      
      const matchesCategory = !regCategoryFilter || reg.event.category === regCategoryFilter;
      
      const matchesLocation = !regLocationFilter || 
                            reg.event.location?.toLowerCase().includes(regLocationFilter.toLowerCase());
      
      const matchesOrganizer = !regOrganizerFilter || 
                              reg.event.organizerName?.toLowerCase().includes(regOrganizerFilter.toLowerCase());
      
      const matchesType = !regTypeFilter || reg.event.eventType === regTypeFilter;
      
      return matchesStatusFilter && matchesEventName && matchesCategory && 
             matchesLocation && matchesOrganizer && matchesType;
    });
  };

  // Helper: Format date and time for display using utilities (UPDATED)
  const formatEventDateTime = (event) => {
    const dateStr = event.startDate || event.date;
    const timeStr = event.startTime || event.startTime;
    
    if (!dateStr) return 'N/A';
    
    // If time is available, show both
    if (timeStr) {
      return `${formatDateDDMMYYYY(dateStr)} at ${formatTimeAMPM(timeStr)}`;
    }
    
    // Otherwise just date
    return formatDateDDMMYYYY(dateStr);
  };

  // Calculate registration stats
  const today = new Date();
  const upcomingRegistrations = myRegistrations.filter(r => {
    if (!r.event) return false;
    const eventDateStr = r.event.startDate || r.event.date;
    const eventTimeStr = r.event.startTime || '00:00';
    return new Date(`${eventDateStr}T${eventTimeStr}`) >= today;
  });
  
  const pastRegistrations = myRegistrations.filter(r => {
    if (!r.event) return false;
    const eventDateStr = r.event.startDate || r.event.date;
    const eventTimeStr = r.event.startTime || '00:00';
    return new Date(`${eventDateStr}T${eventTimeStr}`) < today;
  });

  // Default placeholder images
  const defaultImages = {
    Technology: "https://via.placeholder.com/400x200/667eea/ffffff?text=Technology",
    Business: "https://via.placeholder.com/400x200/f59e0b/ffffff?text=Business",
    Music: "https://via.placeholder.com/400x200/ec4899/ffffff?text=Music",
    Health: "https://via.placeholder.com/400x200/10b981/ffffff?text=Health",
    Food: "https://via.placeholder.com/400x200/f97316/ffffff?text=Food",
    Art: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Art",
    Community: "https://via.placeholder.com/400x200/3b82f6/ffffff?text=Community",
    Entertainment: "https://via.placeholder.com/400x200/ef4444/ffffff?text=Entertainment",
    Education: "https://via.placeholder.com/400x200/06b6d4/ffffff?text=Education",
    Sports: "https://via.placeholder.com/400x200/84cc16/ffffff?text=Sports",
    Other: "https://via.placeholder.com/400x200/6b7280/ffffff?text=Event"
  };

  // Helper: Navigate to page and close mobile menu (NEW)
  const handleNavigate = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  // ================================================================
// FILE: src/pages/VisitorDashboard.jsx - PART 4/5
// JSX Render: Layout, Mobile Menu, Events Page
// ================================================================

  return (
    <div className="vis-visitor-dashboard">
      {/* Mobile Menu Button (NEW) - Visible on small screens */}
      <button
        ref={menuButtonRef}
        className="vis-mobile-menu-button"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
        aria-controls="vis-mobile-sidebar"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay (NEW) */}
      {isMobileMenuOpen && (
        <div 
          className="vis-mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - becomes mobile menu on small screens (UPDATED) */}
    {/* // ================================================================
    // 🆕 UPDATED: Sidebar with Calendar button - Replace around line 102-140
    // ================================================================ */}

      <aside 
        ref={mobileMenuRef}
        id="vis-mobile-sidebar"
        className={`vis-sidebar ${isMobileMenuOpen ? 'vis-sidebar-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="vis-logo">
          <div className="vis-logo-icon">
            <img src="/src/assets/EZ-logo1.png" alt="EventZen logo" className="vis-logo-img" />
          </div>
          <span className="vis-logo-text">EventZen</span>
        </div>

        <nav className="vis-nav-menu-visitor" role="menu">
          <button
            className={`vis-nav-item ${activePage === "events" ? "vis-active" : ""}`}
            onClick={() => handleNavigate("events")}
            role="menuitem"
          >
            <Calendar className="vis-nav-icon" size={18} aria-hidden="true" />
            <span>Events</span>
          </button>
          
          <button
            className={`vis-nav-item ${activePage === "registrations" ? "vis-active" : ""}`}
            onClick={() => handleNavigate("registrations")}
            role="menuitem"
          >
            <CheckCircle className="vis-nav-icon" size={18} aria-hidden="true" />
            <span>My Registrations</span>
          </button>

          {/* 🆕 NEW: Calendar button */}
          <button
            className={`vis-nav-item ${activePage === "calendar" ? "vis-active" : ""}`}
            onClick={() => handleNavigate("calendar")}
            role="menuitem"
          >
            <Calendar className="vis-nav-icon" size={18} aria-hidden="true" />
            <span>Calendar</span>
          </button>
          
          <button
            className={`vis-nav-item ${activePage === "profile" ? "vis-active" : ""}`}
            onClick={() => handleNavigate("profile")}
            role="menuitem"
          >
            <User className="vis-nav-icon" size={18} aria-hidden="true" />
            <span>Profile</span>
          </button>
          
          <button 
            className="vis-nav-item vis-logout" 
            onClick={handleLogout}
            role="menuitem"
          >
            <LogOut className="vis-nav-icon" size={18} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>


      <main className="vis-main-content">
        <div className="vis-content-wrapper">
          {error && (
            <div className="vis-alert vis-error" role="alert">
              {error}
              <button onClick={() => setError("")} className="vis-alert-close" aria-label="Close error">
                <X size={18} />
              </button>
            </div>
          )}
          {success && (
            <div className="vis-alert vis-success" role="alert">
              {success}
              <button onClick={() => setSuccess("")} className="vis-alert-close" aria-label="Close success message">
                <X size={18} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="vis-loading-state">
              <div className="vis-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* EVENTS PAGE (UPDATED with new filters and date/time display) */}
              {activePage === "events" && (
                <section className="vis-events-page">
                  <div className="vis-page-header">
                    <h1>Discover Events</h1>
                    <p className="vis-subtitle">Find and register for exciting events</p>
                  </div>

                  <div className="vis-filters-bar">
                    <input
                      type="text"
                      className="vis-search-input"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search events by name"
                    />
                    
                    <select
                      className="vis-filter-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Music">Music</option>
                      <option value="Health">Health</option>
                      <option value="Food">Food</option>
                      <option value="Art">Art</option>
                      <option value="Community">Community</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Education">Education</option>
                      <option value="Sports">Sports</option>
                      <option value="Finance">Finance</option>
                      <option value="Media">Media</option>
                      <option value="Design">Design</option>
                      <option value="Crafts">Crafts</option>
                      <option value="Travel">Travel</option>
                      <option value="Environment">Environment</option>
                    </select>
                    
                    <input
                      type="text"
                      className="vis-search-input"
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      aria-label="Filter by location"
                    />
                    
                    <input
                      type="text"
                      className="vis-search-input"
                      placeholder="Filter by organizer..."
                      value={organizerFilter}
                      onChange={(e) => setOrganizerFilter(e.target.value)}
                      aria-label="Filter by organizer name"
                    />
                    
                    <select
                      className="vis-filter-select"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      aria-label="Filter by event type"
                    >
                      <option value="">All Types</option>
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>

                    {/* NEW: Registered Filter */}
                    <select
                      className="vis-filter-select"
                      value={registeredFilter}
                      onChange={(e) => setRegisteredFilter(e.target.value)}
                      aria-label="Filter by registration status"
                    >
                      <option value="all">All Events</option>
                      <option value="registered">Registered</option>
                      <option value="not-registered">Not Registered</option>
                    </select>
                    
                    <button 
                      className="vis-reset-btn-visitor" 
                      onClick={handleReset}
                      aria-label="Reset all filters"
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Events Grid with Card View */}
                  <div className="vis-events-grid">
                    {getFilteredEvents().length > 0 ? (
                      getFilteredEvents().map(event => (
                        <div key={event.id} className="vis-event-card-visitor">
                          <div className="vis-event-image">
                            <img 
                              src={event.imageUrl || defaultImages[event.category] || defaultImages["Other"]} 
                              alt={event.title} 
                            />
                            <span className={`vis-event-badge ${
                              registeredEventIds.has(event.id) 
                                ? 'vis-registered' 
                                : event.eventType === 'PRIVATE' 
                                  ? 'vis-private' 
                                  : 'vis-public'
                            }`}>
                              {registeredEventIds.has(event.id) ? (
                                <>
                                  <CheckCircle size={14} aria-hidden="true" />
                                  Registered
                                </>
                              ) : event.eventType === 'PRIVATE' ? (
                                <>
                                  <Lock size={14} aria-hidden="true" />
                                  Private
                                </>
                              ) : (
                                <>
                                  <Globe size={14} aria-hidden="true" />
                                  Public
                                </>
                              )}
                            </span>
                          </div>
                          <div className="vis-event-details-visitor">
                            <h3>{event.title}</h3>
                            <span className="vis-event-category">
                              <Tag size={12} aria-hidden="true" />
                              {event.category}
                            </span>
                            <div className="vis-event-info-grid">
                              {/* UPDATED: Show start/end date and time in AM/PM */}
                              <p className="vis-event-date">
                                <Calendar size={14} aria-hidden="true" />
                                {event.startDate ? formatDateDDMMYYYY(event.startDate) : formatDateDDMMYYYY(event.date)}
                              </p>
                              <p className="vis-event-time">
                                <Clock size={14} aria-hidden="true" />
                                {event.startTime ? formatTimeAMPM(event.startTime) : 'TBD'}
                              </p>
                              <p className="vis-event-location">
                                <MapPin size={14} aria-hidden="true" />
                                {event.location}
                              </p>
                              <p className="vis-event-organizer">
                                <UserCheck size={14} aria-hidden="true" />
                                {event.organizerName}
                              </p>
                              {event.maxAttendees && (
                                <p className="vis-event-capacity">
                                  <Users size={14} aria-hidden="true" />
                                  {event.currentAttendees || 0}/{event.maxAttendees}
                                </p>
                              )}
                            </div>
                            <div className="vis-event-actions">
                              {registeredEventIds.has(event.id) && (
                                <CountdownTimer
                                  eventDate={event.startDate || event.date}
                                  eventTime={event.startTime || "00:00"}
                                  compact
                                />
                              )}

                              {registeredEventIds.has(event.id) ? (
                                <button className="vis-btn vis-btn-registered" disabled>
                                  <CheckCircle size={16} aria-hidden="true" />
                                  Registered
                                </button>
                              ) : (
                                <button
                                  className="vis-btn vis-btn-primary-visitor"
                                  onClick={() => handleOpenRegisterModal(event)}
                                  disabled={event.maxAttendees && event.currentAttendees >= event.maxAttendees}
                                >
                                  {event.maxAttendees && event.currentAttendees >= event.maxAttendees ? "Full" : "Register Now"}
                                </button>
                              )}
                              <button
                                className="vis-btn vis-btn-secondary"
                                onClick={() => setSelectedEvent(event)}
                              >
                                <Eye size={16} aria-hidden="true" />
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="vis-no-events">
                        <Filter size={48} aria-hidden="true" />
                        <p>No events found matching your filters</p>
                        <button className="vis-btn vis-btn-primary-visitor" onClick={handleReset}>
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* MY REGISTRATIONS PAGE (UPDATED with date/time columns) */}
              {activePage === "registrations" && (
                <section className="vis-registrations-page">
                  <div className="vis-stats-cards">
                    <div className="vis-stat-card-visitor">
                      <div className="vis-stat-info">
                        <CheckCircle className="vis-stat-icon" size={28} aria-hidden="true" />
                        <h3>{myRegistrations.length}</h3>
                      </div>
                      <p>Total Registrations</p>
                    </div>
                    <div className="vis-stat-card-visitor">
                      <div className="vis-stat-info">
                        <Clock className="vis-stat-icon" size={28} aria-hidden="true" />
                        <h3>{upcomingRegistrations.length}</h3>
                      </div>
                      <p>Upcoming Events</p>
                    </div>
                    <div className="vis-stat-card-visitor">
                      <div className="vis-stat-info">
                        <CheckCircle className="vis-stat-icon" size={28} aria-hidden="true" />
                        <h3>{pastRegistrations.length}</h3>
                      </div>
                      <p>Completed Events</p>
                    </div>
                  </div>

                  <div className="vis-registrations-filters-section">
                    <div className="vis-filters-bar">
                      <input
                        type="text"
                        className="vis-search-input"
                        placeholder="Search by event name..."
                        value={regEventNameFilter}
                        onChange={(e) => setRegEventNameFilter(e.target.value)}
                        aria-label="Filter by event name"
                      />

                      <input
                        type="text"
                        className="vis-search-input"
                        placeholder="Filter by organizer..."
                        value={regOrganizerFilter}
                        onChange={(e) => setRegOrganizerFilter(e.target.value)}
                        aria-label="Filter by organizer"
                      />

                      <select
                        className="vis-filter-select"
                        value={regCategoryFilter}
                        onChange={(e) => setRegCategoryFilter(e.target.value)}
                        aria-label="Filter by category"
                      >
                        <option value="">All Categories</option>
                        <option value="Technology">Technology</option>
                        <option value="Business">Business</option>
                        <option value="Music">Music</option>
                        <option value="Health">Health</option>
                        <option value="Food">Food</option>
                        <option value="Art">Art</option>
                        <option value="Community">Community</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Education">Education</option>
                        <option value="Sports">Sports</option>
                        <option value="Finance">Finance</option>  
                        <option value="Media">Media</option>
                        <option value="Design">Design</option>
                        <option value="Crafts">Crafts</option>
                        <option value="Travel">Travel</option>
                        <option value="Environment">Environment</option>
                      </select>

                      <input
                        type="text"
                        className="vis-search-input"
                        placeholder="Filter by location..."
                        value={regLocationFilter}
                        onChange={(e) => setRegLocationFilter(e.target.value)}
                        aria-label="Filter by location"
                      />

                      <select
                        className="vis-filter-select"
                        value={regTypeFilter}
                        onChange={(e) => setRegTypeFilter(e.target.value)}
                        aria-label="Filter by type"
                      >
                        <option value="">All Types</option>
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                      </select>

                      <select
                        className="vis-filter-select"
                        value={registrationFilter}
                        onChange={(e) => setRegistrationFilter(e.target.value)}
                        aria-label="Filter by status"
                      >
                        <option value="all">All Events</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                      </select>
      
                      <button 
                        className="vis-reset-btn-visitor" 
                        onClick={handleRegistrationReset}
                        aria-label="Reset all filters"
                      >
                        <RotateCcw size={16} aria-hidden="true" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {getFilteredRegistrations().length > 0 ? (
                    <>
                      {/* Desktop Table View */}
                      <div className="vis-registrations-table vis-desktop-only">
                        <table>
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Event</th>
                              <th>Category</th>
                              <th>Start Date</th>
                              {/* <th>Start Time</th> */}
                              <th>End Date</th>
                              {/* <th>End Time</th> */}
                              <th>Location</th>
                              <th>Organizer</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredRegistrations().map(reg => {
                              const eventDateStr = reg.event.startDate || reg.event.date;
                              const eventTimeStr = reg.event.startTime || '00:00';
                              const isUpcoming = new Date(`${eventDateStr}T${eventTimeStr}`) >= today;
                              
                              return (
                                <tr key={reg.id}>
                                  <td>
                                    <img 
                                      src={reg.event.imageUrl || defaultImages[reg.event.category] || defaultImages["Other"]} 
                                      alt={`${reg.event.title} event`}
                                      className="vis-event-thumbnail"
                                    />
                                  </td>
                                  <td>{reg.event.title}</td>
                                  <td>{reg.event.category}</td>
                                  <td>{reg.event.startDate ? formatDateDDMMYYYY(reg.event.startDate) : formatDateDDMMYYYY(reg.event.date)}{<br></br>}{reg.event.startTime ? formatTimeAMPM(reg.event.startTime) : 'TBD'}</td>
                                  {/* <td></td> */}
                                  <td>{reg.event.endDate ? formatDateDDMMYYYY(reg.event.endDate) : 'N/A'}{<br></br>}{reg.event.endTime ? formatTimeAMPM(reg.event.endTime) : 'N/A'}</td>
                                  {/* <td></td> */}
                                  <td>{reg.event.location}</td>
                                  <td>{reg.event.organizerName}</td>
                                  <td>
                                    <span className={`vis-type-badge-vis ${
                                      reg.event.eventType === 'PRIVATE' ? 'vis-private' : 'vis-public'
                                    }`}>
                                      {reg.event.eventType === 'PRIVATE' ? (
                                        <>
                                          <Lock size={12} aria-hidden="true" />
                                          Private
                                        </>
                                      ) : (
                                        <>
                                          <Globe size={12} aria-hidden="true" />
                                          Public
                                        </>
                                      )}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`vis-status-badge-vis ${isUpcoming ? 'vis-upcoming' : 'vis-past'}`}>
                                      {isUpcoming ? 'Upcoming' : 'Completed'}
                                    </span>
                                  </td>
                                  <td>
                                   <div className="vis-table-actions">
                                    {/* View Details Button */}
                                    <button
                                      className="vis-btn-view"
                                      onClick={() => setSelectedEvent(reg.event)}
                                      aria-label={`View details for ${reg.event.title}`}
                                      title="View Details"
                                    >
                                      <Eye size={14} aria-hidden="true" />
                                      View
                                    </button>

                                    {/* 🆕 NEW: Download Ticket Button */}
                                    {reg.hasTicket && reg.ticketId && (
                                      <TicketDownloadButton
                                        ticketId={reg.ticketId}
                                        eventTitle={reg.event.title}
                                      />
                                    )}

                                    {/* 🆕 NEW: Venue Map Button */}
                                    {reg.event.venueId && (
                                      <button
                                        className="vis-btn-view"
                                        onClick={() => handleOpenVenueMap(reg.event.venueId)}
                                        aria-label="View venue map"
                                        title="View Venue Map"
                                      >
                                        <MapIcon size={14} aria-hidden="true" />
                                        Map
                                      </button>
                                    )}

                                    {/* 🆕 NEW: Feedback Button (only after event ends) */}
                                    {hasEventEnded(reg.event) && (
                                      <button
                                        className="vis-btn-view"
                                        onClick={() => handleOpenFeedbackModal(reg.event)}
                                        aria-label="Submit feedback"
                                        title="Submit Feedback"
                                        style={{ background: "#10b981" }}
                                      >
                                        <MessageSquare size={14} aria-hidden="true" />
                                        Feedback
                                      </button>
                                    )}

                                    {/* 🆕 NEW: Reminder Toggle Button (only for upcoming events) */}
                                    {isUpcoming && (
                                      <button
                                        className="vis-btn-view"
                                        onClick={() => handleReminderToggle(reg.event.id)}
                                        aria-label={reminders.has(reg.event.id) ? "Remove reminder" : "Set reminder"}
                                        title={reminders.has(reg.event.id) ? "Remove Reminder" : "Set Reminder"}
                                        disabled={reminderLoading[reg.event.id]}
                                        style={{ 
                                          background: reminders.has(reg.event.id) ? "#f59e0b" : "#667eea",
                                          opacity: reminderLoading[reg.event.id] ? 0.6 : 1
                                        }}
                                      >
                                        {reminders.has(reg.event.id) ? (
                                          <BellOff size={14} aria-hidden="true" />
                                        ) : (
                                          <Bell size={14} aria-hidden="true" />
                                        )}
                                      </button>
                                    )}

                                    {/* Cancel Registration Button (only for upcoming events) */}
                                    {isUpcoming && (
                                      <button
                                        className="vis-btn-cancel"
                                        onClick={() => handleCancelRegistration(reg.id, reg.event.id)}
                                        aria-label={`Cancel registration for ${reg.event.title}`}
                                        title="Cancel Registration"
                                      >
                                        <Trash2 size={14} aria-hidden="true" />
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View (NEW) */}
                      <div className="vis-registrations-cards vis-mobile-only">
                        {getFilteredRegistrations().map(reg => {
                          const eventDateStr = reg.event.startDate || reg.event.date;
                          const eventTimeStr = reg.event.startTime || '00:00';
                          const isUpcoming = new Date(`${eventDateStr}T${eventTimeStr}`) >= today;
                          
                          return (
                            <div key={reg.id} className="vis-registration-card">
                              <div className="vis-registration-card-image">
                                <img 
                                  src={reg.event.imageUrl || defaultImages[reg.event.category] || defaultImages["Other"]} 
                                  alt={reg.event.title}
                                />
                                <span className={`vis-status-badge-vis ${isUpcoming ? 'vis-upcoming' : 'vis-past'}`}>
                                  {isUpcoming ? 'Upcoming' : 'Completed'}
                                </span>
                              </div>
                              <div className="vis-registration-card-content">
                                <h3>{reg.event.title}</h3>
                                <div className="vis-registration-card-details">
                                  <p><Tag size={14} /> {reg.event.category}</p>
                                  <p><Calendar size={14} /> {reg.event.startDate ? formatDateDDMMYYYY(reg.event.startDate) : formatDateDDMMYYYY(reg.event.date)}</p>
                                  <p><Clock size={14} /> {reg.event.startTime ? formatTimeAMPM(reg.event.startTime) : 'TBD'}</p>
                                  <p><MapPin size={14} /> {reg.event.location}</p>
                                  <p><UserCheck size={14} /> {reg.event.organizerName}</p>
                                </div>
                               <div className="vis-registration-card-actions">
  <button
    className="vis-btn vis-btn-secondary"
    onClick={() => setSelectedEvent(reg.event)}
  >
    <Eye size={16} /> Details
  </button>

  {reg.hasTicket && reg.ticketId && (
    <TicketDownloadButton
      ticketId={reg.ticketId}
      eventTitle={reg.event.title}
    />
  )}

  {reg.event.venueId && (
    <button
      className="vis-btn vis-btn-secondary"
      onClick={() => handleOpenVenueMap(reg.event.venueId)}
    >
      <MapIcon size={16} /> Map
    </button>
  )}

  {hasEventEnded(reg.event) && (
    <button
      className="vis-btn vis-btn-primary-visitor"
      style={{ background: "#10b981" }}
      onClick={() => handleOpenFeedbackModal(reg.event)}
    >
      <MessageSquare size={16} /> Feedback
    </button>
  )}

  {isUpcoming && (
    <button
      className="vis-btn vis-btn-secondary"
      onClick={() => handleReminderToggle(reg.event.id)}
      disabled={reminderLoading[reg.event.id]}
      style={{ background: reminders.has(reg.event.id) ? "#f59e0b" : "#667eea", color: "#fff" }}
    >
      {reminders.has(reg.event.id) ? <BellOff size={16} /> : <Bell size={16} />}
    </button>
  )}

  {isUpcoming && (
    <button
      className="vis-btn vis-btn-cancel"
      onClick={() => handleCancelRegistration(reg.id, reg.event.id)}
    >
      <Trash2 size={16} /> Cancel
    </button>
  )}
</div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="vis-no-registrations">
                      <CheckCircle size={48} aria-hidden="true" />
                      <p>You haven't registered for any events yet</p>
                      <button className="vis-btn vis-btn-primary-visitor" onClick={() => handleNavigate("events")}>
                        Browse Events
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* PROFILE PAGE (unchanged) */}
              {activePage === "profile" && userProfile && (
                <section className="vis-profile-page">
                  <div className="vis-profile-container">
                    {!editing ? (
                      <div className="vis-profile-view-card">
                        <div className="vis-profile-avatar-wrapper">
                          <img 
                            src={profileForm.imageUrl || userProfile.imageUrl || "/src/assets/EZ-logo1.png"} 
                            alt="Profile" 
                            className="vis-profile-avatar"
                          />
                        </div>
                        <div className="vis-profile-details">
                          <h3 className="vis-profile-name">{userProfile.name}</h3>
                          <p className="vis-profile-email">{userProfile.email}</p>
                          <span className="vis-role-badge">{userProfile.role}</span>
                          <div className="vis-profile-meta">
                            <div className="vis-meta-item">
                              <span className="vis-meta-label">Mobile:</span>
                              <span className="vis-meta-value">{userProfile.mobileNumber || "Not provided"}</span>
                            </div>
                          </div>
                        </div>
                        <button className="vis-btn vis-btn-primary-visitor" onClick={() => setEditing(true)}>
                          Edit Profile
                        </button>
                      </div>
                    ) : (
                      <form className="vis-profile-edit-form" onSubmit={handleProfileUpdate}>
                        <div className="vis-form-group vis-full-width">
                          <label className="vis-form-label">Profile Image</label>
                          <div className="vis-image-upload-area">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                handleImageUpload(file);
                              }}
                              className="vis-file-input"
                              id="profile-image-upload"
                            />
                            <label htmlFor="profile-image-upload" className="vis-upload-label">
                              <ImagePlus size={20} aria-hidden="true" />
                              {profileForm.imageUrl ? "" : "Upload Image"}
                            </label>
                            {profileForm.imageUrl && (
                              <div className="vis-image-preview vis-profile-preview">
                                <img src={profileForm.imageUrl} alt="Profile preview" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="vis-form-row">
                          <div className="vis-form-col">
                            <label className="vis-form-label">Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                              className="vis-form-input"
                              required
                            />
                          </div>
                          
                          <div className="vis-form-col">
                            <label className="vis-form-label">Email (Cannot be changed)</label>
                            <input
                              type="email"
                              value={profileForm.email}
                              disabled
                              className="vis-form-input vis-disabled"
                            />
                          </div>
                        </div>

                        <div className="vis-form-row">
                          <div className="vis-form-col">
                            <label className="vis-form-label">Mobile Number</label>
                            <input
                              type="tel"
                              name="mobileNumber"
                              value={profileForm.mobileNumber || ""}
                              onChange={(e) => setProfileForm({...profileForm, mobileNumber: e.target.value})}
                              placeholder="+91 9876543210"
                              className="vis-form-input"
                            />
                          </div>
                          
                          <div className="vis-form-col">
                            <label className="vis-form-label">Role</label>
                            <input
                              type="text"
                              value={userProfile.role}
                              disabled
                              className="vis-form-input vis-disabled"
                            />
                          </div>
                        </div>

                        <div className="vis-password-section">
                          <p className="vis-section-subtitle">Leave empty to keep your current password</p>
                          
                          <div className="vis-form-row">
                            <div className="vis-form-col">
                              <label className="vis-form-label">Current Password</label>
                              <input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                placeholder="Enter current password"
                                className="vis-form-input"
                              />
                            </div>
                            
                            <div className="vis-form-col">
                              <label className="vis-form-label">New Password</label>
                              <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                placeholder="Enter new password (min 6 characters)"
                                className="vis-form-input"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="vis-form-actions">
                          <button type="submit" className="vis-btn vis-btn-primary-visitor" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            className="vis-btn vis-btn-secondary"
                            onClick={() => {
                              setEditing(false);
                              setError("");
                              setPasswordForm({ currentPassword: "", newPassword: "" });
                              loadUserData();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </section>
              )}

              {/* // ================================================================
// 🆕 NEW: CALENDAR PAGE - Add after Profile section, before closing </>
// ================================================================ */}

              {/* 🆕 NEW: CALENDAR PAGE */}
              {activePage === "calendar" && (
                <section className="vis-calendar-page">
                  <div className="vis-page-header">
                    <h1>My Calendar</h1>
                    <p className="vis-subtitle">View your registered events in calendar format</p>
                  </div>

                  <div className="vis-calendar-container">
                    {/* Calendar Toolbar */}
                    <div className="vis-cal-toolbar">
                      <div className="vis-cal-toolbar-nav">
                        <button 
                          className="vis-cal-btn vis-cal-btn-icon"
                          onClick={() => handleCalendarNavigate('prev')}
                          title="Previous"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <button 
                          className="vis-cal-btn vis-cal-btn-today"
                          onClick={() => handleCalendarNavigate('today')}
                        >
                          <Calendar size={18} />
                          Today
                        </button>
                        
                        <button 
                          className="vis-cal-btn vis-cal-btn-icon"
                          onClick={() => handleCalendarNavigate('next')}
                          title="Next"
                        >
                          <ChevronRight size={20} />
                        </button>
                        
                        <h2 className="vis-cal-toolbar-title">{formatCalendarTitle()}</h2>
                      </div>

                      {/* View Switcher */}
                      <div className="vis-cal-toolbar-views">
                        <button
                          className={`vis-cal-btn vis-cal-btn-view ${currentView === 'dayGridMonth' ? 'vis-cal-active' : ''}`}
                          onClick={() => handleCalendarViewChange('dayGridMonth')}
                        >
                          Month
                        </button>
                        <button
                          className={`vis-cal-btn vis-cal-btn-view ${currentView === 'timeGridWeek' ? 'vis-cal-active' : ''}`}
                          onClick={() => handleCalendarViewChange('timeGridWeek')}
                        >
                          Week
                        </button>
                        <button
                          className={`vis-cal-btn vis-cal-btn-view ${currentView === 'timeGridDay' ? 'vis-cal-active' : ''}`}
                          onClick={() => handleCalendarViewChange('timeGridDay')}
                        >
                          Day
                        </button>
                      </div>
                    </div>

                    {/* Loading state */}
                    {calendarLoading && (
                      <div className="vis-cal-loading">
                        <Loader className="vis-spinner" size={40} />
                        <p>Loading your calendar...</p>
                      </div>
                    )}

                    {/* Calendar */}
                    {!calendarLoading && (
                      <div className="vis-calendar-wrapper">
                        <FullCalendar
                          ref={calendarRef}
                          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                          initialView="dayGridMonth"
                          headerToolbar={false}
                          events={calendarEvents}
                          eventClick={handleCalendarEventClick}
                          eventContent={renderCalendarEventContent}
                          height="auto"
                          contentHeight="auto"
                          aspectRatio={1.8}
                          editable={false}
                          droppable={false}
                          eventResizableFromStart={false}
                          eventDurationEditable={false}
                          eventStartEditable={false}
                          selectable={false}
                          eventClassNames="vis-cal-event"
                          dayMaxEvents={3}
                          moreLinkText="more"
                          timeZone="local"
                          views={{
                            dayGridMonth: {
                              titleFormat: { year: 'numeric', month: 'long' }
                            },
                            timeGridWeek: {
                              titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                            },
                            timeGridDay: {
                              titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
                            }
                          }}
                          eventMouseEnter={(info) => {
                            info.el.style.transform = 'scale(1.05)';
                            info.el.style.transition = 'transform 0.2s';
                            info.el.style.zIndex = '1000';
                          }}
                          eventMouseLeave={(info) => {
                            info.el.style.transform = 'scale(1)';
                            info.el.style.zIndex = 'auto';
                          }}
                        />
                      </div>
                    )}

                    {/* Empty state */}
                    {!calendarLoading && calendarEvents.length === 0 && (
                      <div className="vis-no-calendar-events">
                        <Calendar size={48} aria-hidden="true" />
                        <p>You have no registered events</p>
                        <button 
                          className="vis-btn vis-btn-primary-visitor" 
                          onClick={() => handleNavigate("events")}
                        >
                          Browse Events
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
          
      {/* Event Details Modal (UPDATED with date/time display) */}
      {selectedEvent && (
        <div className="vis-modal-visitor-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="vis-modal-visitor-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="event-details-title" aria-modal="true">
            {/* <button className="vis-modal-visitor-close" onClick={() => setSelectedEvent(null)} aria-label="Close modal">
              <X size={24} />
            </button> */}
            <div className="vis-modal-visitor-header">
              <img 
                src={selectedEvent.imageUrl || defaultImages[selectedEvent.category] || defaultImages["Other"]} 
                alt={selectedEvent.title} 
                className="vis-modal-visitor-image" 
              />
              <h2 id="event-details-title">{selectedEvent.title}</h2>
            </div>
            <div className="vis-modal-visitor-body">
              <div className="vis-modal-visitor-info">
                <p><strong><Tag size={16} /> Category:</strong> {selectedEvent.category}</p>
                <p><strong><Calendar size={16} /> Start :</strong> {selectedEvent.startDate ? formatDateDDMMYYYY(selectedEvent.startDate) : formatDateDDMMYYYY(selectedEvent.date)} At  {selectedEvent.startTime ? formatTimeAMPM(selectedEvent.startTime) : 'TBD'}</p>
                {/* <p><strong><Clock size={16} /> Start Time:</strong></p> */}
                {selectedEvent.endDate && (
                  <p><strong><Calendar size={16} /> End Date:</strong> {formatDateDDMMYYYY(selectedEvent.endDate)} At {formatTimeAMPM(selectedEvent.endTime)}</p>
                )}
                {/* {selectedEvent.endTime && (
                  <p><strong><Clock size={16} /> End Time:</strong> {formatTimeAMPM(selectedEvent.endTime)}</p>
                )} */}
                <p><strong><MapPin size={16} /> Location:</strong> {selectedEvent.location}</p>
                <p><strong><UserCheck size={16} /> Organizer:</strong> {selectedEvent.organizerName}</p>
                {selectedEvent.maxAttendees && (
                  <p><strong><Users size={16} /> Capacity:</strong> {selectedEvent.currentAttendees || 0} / {selectedEvent.maxAttendees}</p>
                )}
                <p><strong>Type:</strong> {selectedEvent.eventType === 'PRIVATE' ? '🔒 Private' : '🌐 Public'}</p>
              </div>
              <div className="vis-modal-visitor-description">
                <h3>About this event</h3>
                <p>{selectedEvent.description}</p>
              </div>
            </div>
            <div className="vis-modal-visitor-footer">
              {!registeredEventIds.has(selectedEvent.id) && (
                <button
                  className="vis-btn vis-btn-primary-visitor"
                  onClick={() => {
                    setSelectedEvent(null);
                    handleOpenRegisterModal(selectedEvent);
                  }}
                  disabled={selectedEvent.maxAttendees && selectedEvent.currentAttendees >= selectedEvent.maxAttendees}
                >
                  Register Now
                </button>
              )}
              <button className="vis-btn vis-event-close" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegisterModal && regEvent && (
        <div className="vis-modal-visitor-overlay" onClick={handleCloseRegisterModal}>
          <div className="vis-modal-visitor-content vis-registration-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="register-modal-title" aria-modal="true">
            <div className="vis-modal-visitor-header">
              <h2 id="register-modal-title">Register for {regEvent.title}</h2>
            </div>
            
            <form onSubmit={handleRegisterSubmit}>
              <div className="vis-modal-visitor-body">
                {regError && (
                  <div className="vis-reg-error-message" role="alert">
                    {regError}
                  </div>
                )}
                
                <div className="vis-form-group">
                  <label className="vis-form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={registrationForm.name}
                    onChange={handleRegistrationFormChange}
                    className="vis-form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="vis-form-group">
                  <label className="vis-form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={registrationForm.email}
                    onChange={handleRegistrationFormChange}
                    className="vis-form-input"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="vis-form-group">
                  <label className="vis-form-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={registrationForm.phone}
                    onChange={handleRegistrationFormChange}
                    className="vis-form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="vis-form-group">
                  <label className="vis-form-label">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={registrationForm.notes}
                    onChange={handleRegistrationFormChange}
                    className="vis-form-textarea"
                    placeholder="Any special requirements or notes..."
                    rows="3"
                  />
                </div>

                {regEvent.eventType === "PRIVATE" && (
                  <div className="vis-form-group">
                    <label className="vis-form-label">Private Code *</label>
                    <input
                      type="text"
                      name="privateCode"
                      value={registrationForm.privateCode}
                      onChange={handleRegistrationFormChange}
                      className="vis-form-input"
                      placeholder="Enter the private event code"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="vis-modal-visitor-footer">
                <button
                  type="button"
                  className="vis-btn vis-btn-secondary"
                  onClick={handleCloseRegisterModal}
                  disabled={regLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="vis-btn vis-btn-primary-visitor"
                  disabled={regLoading}
                >
                  {regLoading ? "Registering..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeedbackModal && feedbackEvent && (
      <div 
        className="vis-modal-visitor-overlay" 
        onClick={handleCloseFeedbackModal}
      >
        <div 
          className="vis-modal-visitor-content" 
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "600px" }}
        >
          <FeedbackForm
            event={feedbackEvent}
            onClose={handleCloseFeedbackModal}
            onSuccess={handleFeedbackSuccess}
          />
        </div>
      </div>
    )}

    {/* 🆕 NEW: Venue Map Modal */}
    {showVenueModal && selectedVenueId && (
      <VenueMapViewer
        venueId={selectedVenueId}
        onClose={handleCloseVenueMap}
      />
    )}
    </div>
  );
}