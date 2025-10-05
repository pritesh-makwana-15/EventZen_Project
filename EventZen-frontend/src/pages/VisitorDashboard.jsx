// src/pages/VisitorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Visitor page styling/VisitorDashboard.css";
import API from "../services/api";
import { registerForEvent, getMyRegistrations, cancelRegistration } from "../services/registrations";

export default function VisitorDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("events");
  
  // User data
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Events data
  const [allEvents, setAllEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Private event popup states
  const [showPrivateCodePopup, setShowPrivateCodePopup] = useState(false);
  const [privateEventToRegister, setPrivateEventToRegister] = useState(null);
  const [privateCode, setPrivateCode] = useState("");
  const [privateCodeError, setPrivateCodeError] = useState("");
  
  // Events Page Filters (UPDATED with new filters)
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [organizerFilter, setOrganizerFilter] = useState(""); // NEW: Organizer name filter
  const [typeFilter, setTypeFilter] = useState(""); // NEW: Type filter (Public/Private)
  const [statusFilter, setStatusFilter] = useState(""); // NEW: Status filter (Upcoming/Completed)

  // Registrations Page Filters (UPDATED with new filters)
  const [registrationFilter, setRegistrationFilter] = useState("all");
  const [regEventNameFilter, setRegEventNameFilter] = useState(""); // NEW: Event name filter
  const [regCategoryFilter, setRegCategoryFilter] = useState(""); // NEW: Category filter
  const [regLocationFilter, setRegLocationFilter] = useState(""); // NEW: Location filter
  const [regOrganizerFilter, setRegOrganizerFilter] = useState(""); // NEW: Organizer filter
  const [regTypeFilter, setRegTypeFilter] = useState(""); // NEW: Type filter

  // Profile editing
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    imageUrl: ""
  });

  // Load user profile on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Load events/registrations when page changes
  useEffect(() => {
    if (activePage === "events") {
      loadAllEvents();
    } else if (activePage === "registrations") {
      loadMyRegistrations();
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
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError("Failed to load user profile");
    }
  };

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/events");
      
      // Filter only active and upcoming events
      const upcomingEvents = response.data.filter(event => {
        const eventDate = new Date(event.date);
        return event.isActive && eventDate >= new Date();
      });
      
      setAllEvents(upcomingEvents);
      
      // Load registration status
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
      
      // Get full event details for each registration
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

  // Handle registration - check if private event
  const handleRegister = async (eventId) => {
    try {
      const storedUserId = userId || localStorage.getItem("userId");
      if (!storedUserId) {
        setError("Please login to register for events");
        return;
      }

      // Find the event
      const event = allEvents.find(e => e.id === eventId);
      
      // Check if it's a private event
      if (event && event.eventType === "PRIVATE") {
        // Show private code popup
        setPrivateEventToRegister(event);
        setShowPrivateCodePopup(true);
        setPrivateCode("");
        setPrivateCodeError("");
        return;
      }

      // Public event - register directly
      await registerForEvent(eventId, storedUserId, null);
      setRegisteredEventIds(prev => new Set([...prev, eventId]));
      setSuccess("Successfully registered for the event!");
      setTimeout(() => setSuccess(""), 3000);
      
      loadAllEvents();
    } catch (err) {
      console.error("Error registering for event:", err);
      setError(err.response?.data?.message || "Failed to register. Please try again.");
      setTimeout(() => setError(""), 5000);
    }
  };

  // Handle private event registration with code
  const handlePrivateEventRegister = async () => {
    if (!privateCode.trim()) {
      setPrivateCodeError("Please enter the private code");
      return;
    }

    try {
      const storedUserId = userId || localStorage.getItem("userId");
      
      // Register with private code
      await registerForEvent(privateEventToRegister.id, storedUserId, privateCode);
      
      // Success
      setRegisteredEventIds(prev => new Set([...prev, privateEventToRegister.id]));
      setSuccess("Successfully registered for the event!");
      setTimeout(() => setSuccess(""), 3000);
      
      // Close popup and reset
      setShowPrivateCodePopup(false);
      setPrivateEventToRegister(null);
      setPrivateCode("");
      setPrivateCodeError("");
      
      loadAllEvents();
    } catch (err) {
      console.error("Error registering for private event:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to register";
      
      if (errorMsg.includes("Private code is not correct")) {
        setPrivateCodeError("Private code is not correct");
      } else {
        setPrivateCodeError(errorMsg);
      }
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

  // Profile image upload handler
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
      const response = await API.put("/users/profile", {
        name: profileForm.name,
        mobileNumber: profileForm.mobileNumber,
        profileImage: profileForm.imageUrl
      });
      setUserProfile(response.data);
      setEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // UPDATED: Reset all Events page filters
  const handleReset = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setLocationFilter("");
    setOrganizerFilter("");
    setTypeFilter("");
    setStatusFilter("");
  };

  // UPDATED: Reset all Registrations page filters
  const handleRegistrationReset = () => {
    setRegistrationFilter("all");
    setRegEventNameFilter("");
    setRegCategoryFilter("");
    setRegLocationFilter("");
    setRegOrganizerFilter("");
    setRegTypeFilter("");
  };

  // UPDATED: Filter events with all new filters combined
  const getFilteredEvents = () => {
    const now = new Date();
    
    return allEvents.filter(event => {
      // Search by event name or description
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = !categoryFilter || event.category === categoryFilter;
      
      // Filter by location
      const matchesLocation = !locationFilter || 
                            event.location?.toLowerCase().includes(locationFilter.toLowerCase());
      
      // NEW: Filter by organizer name
      const matchesOrganizer = !organizerFilter || 
                              event.organizerName?.toLowerCase().includes(organizerFilter.toLowerCase());
      
      // NEW: Filter by type (Public/Private)
      const matchesType = !typeFilter || event.eventType === typeFilter;
      
      // NEW: Filter by status (Upcoming/Completed)
      const eventDate = new Date(event.date);
      let matchesStatus = true;
      if (statusFilter === "Upcoming") {
        matchesStatus = eventDate >= now;
      } else if (statusFilter === "Completed") {
        matchesStatus = eventDate < now;
      }
      
      return matchesSearch && matchesCategory && matchesLocation && 
             matchesOrganizer && matchesType && matchesStatus;
    });
  };

  // UPDATED: Filter registrations with all new filters combined
  const getFilteredRegistrations = () => {
    const now = new Date();
    
    return myRegistrations.filter(reg => {
      if (!reg.event) return false;
      
      const eventDate = new Date(reg.event.date);
      
      // Existing status filter (Upcoming/Past/All)
      let matchesStatusFilter = true;
      if (registrationFilter === "upcoming") {
        matchesStatusFilter = eventDate >= now;
      } else if (registrationFilter === "past") {
        matchesStatusFilter = eventDate < now;
      }
      
      // NEW: Filter by event name
      const matchesEventName = !regEventNameFilter || 
                              reg.event.title?.toLowerCase().includes(regEventNameFilter.toLowerCase());
      
      // NEW: Filter by category
      const matchesCategory = !regCategoryFilter || reg.event.category === regCategoryFilter;
      
      // NEW: Filter by location
      const matchesLocation = !regLocationFilter || 
                            reg.event.location?.toLowerCase().includes(regLocationFilter.toLowerCase());
      
      // NEW: Filter by organizer name
      const matchesOrganizer = !regOrganizerFilter || 
                              reg.event.organizerName?.toLowerCase().includes(regOrganizerFilter.toLowerCase());
      
      // NEW: Filter by type (Public/Private)
      const matchesType = !regTypeFilter || reg.event.eventType === regTypeFilter;
      
      return matchesStatusFilter && matchesEventName && matchesCategory && 
             matchesLocation && matchesOrganizer && matchesType;
    });
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const today = new Date();
  const upcomingRegistrations = myRegistrations.filter(r => r.event && new Date(r.event.date) >= today);
  const pastRegistrations = myRegistrations.filter(r => r.event && new Date(r.event.date) < today);

  return (
    <div className="visitor-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <img src="/src/assets/EZ-logo1.png" alt="logo" className="logo-img-admin" />
          </div>
          <span className="logo-text">EventZen</span>
        </div>

        <nav className="nav-menu-visitor">
          <button
            className={`nav-item ${activePage === "events" ? "active" : ""}`}
            onClick={() => setActivePage("events")}
          >
            <span className="nav-icon">📅</span>
            <span>Events</span>
          </button>
          <button
            className={`nav-item ${activePage === "registrations" ? "active" : ""}`}
            onClick={() => setActivePage("registrations")}
          >
            <span className="nav-icon">🎟️</span>
            <span>My Registrations</span>
          </button>
          <button
            className={`nav-item ${activePage === "profile" ? "active" : ""}`}
            onClick={() => setActivePage("profile")}
          >
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Messages */}
          {error && (
            <div className="alert error">
              {error}
              <button onClick={() => setError("")} className="alert-close">×</button>
            </div>
          )}
          {success && (
            <div className="alert success">
              {success}
              <button onClick={() => setSuccess("")} className="alert-close">×</button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* Events Page */}
              {activePage === "events" && (
                <section className="events-page">
                  <div className="page-header">
                    <h1>Discover Events</h1>
                    <p className="subtitle">Find and register for exciting events</p>
                  </div>

                  {/* UPDATED: Filters with new fields */}
                  <div className="filters-bar">
                    {/* Search by event name */}
                    <input
                      type="text"
                      className="search-input"
                      placeholder="🔍 Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search events by name"
                    />
                    
                    {/* Filter by category */}
                    <select
                      className="filter-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      <option value="Music">Music</option>
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Food">Food</option>
                      <option value="Art">Art</option>
                      <option value="Sports">Sports</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Wellness">Wellness</option>
                    </select>
                    
                    {/* Filter by location */}
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      aria-label="Filter by location"
                    />
                    
                    {/* NEW: Filter by organizer name */}
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Filter by organizer..."
                      value={organizerFilter}
                      onChange={(e) => setOrganizerFilter(e.target.value)}
                      aria-label="Filter by organizer name"
                    />
                    
                    {/* NEW: Filter by type (Public/Private) */}
                    <select
                      className="filter-select"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      aria-label="Filter by event type"
                    >
                      <option value="">All Types</option>
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                    
                    {/* NEW: Filter by status (Upcoming/Completed) */}
                    {/* <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      aria-label="Filter by status"
                    >
                      <option value="">All Status</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                    </select> */}
                    
                    <button 
                      className="reset-btn-visitor" 
                      onClick={handleReset}
                      aria-label="Reset all filters"
                    >
                      Reset Filters
                    </button>
                  </div>

                  {/* Events Grid */}
                  <div className="events-grid">
                    {getFilteredEvents().length > 0 ? (
                      getFilteredEvents().map(event => (
                        <div key={event.id} className="event-card-visitor">
                          <div className="event-image">
                            <img 
                              src={event.imageUrl || "https://via.placeholder.com/400x200?text=Event"} 
                              alt={event.title} 
                            />
                            {/* UPDATED: Badge styling based on event type and registration status */}
                            <span className={`event-badge ${
                              registeredEventIds.has(event.id) 
                                ? 'registered' 
                                : event.eventType === 'PRIVATE' 
                                  ? 'private' 
                                  : 'public'
                            }`}>
                              {registeredEventIds.has(event.id) 
                                ? '✓ Registered' 
                                : event.eventType === 'PRIVATE' 
                                  ? '🔒 Private' 
                                  : '🌐 Public'}
                            </span>
                          </div>
                          <div className="event-details-visitor">
                            <h3>{event.title}</h3>
                            <span className="event-category">{event.category}</span>
                            <div className="event-info-grid">
                              <p className="event-date">📅 {formatDateTime(event.date)}</p>
                              <p className="event-location">📍 {event.location}</p>
                              <p className="event-organizer">👤 {event.organizerName}</p>
                              {event.maxAttendees && (
                                <p className="event-capacity">
                                  👥 {event.currentAttendees || 0}/{event.maxAttendees}
                                </p>
                              )}
                            </div>
                            <div className="event-actions">
                              {registeredEventIds.has(event.id) ? (
                                <button className="btn btn-registered" disabled>
                                  Registered
                                </button>
                              ) : (
                                <button
                                  className="btn btn-primary-visitor"
                                  onClick={() => handleRegister(event.id)}
                                  disabled={event.maxAttendees && event.currentAttendees >= event.maxAttendees}
                                >
                                  {event.maxAttendees && event.currentAttendees >= event.maxAttendees ? "Full" : "Register Now"}
                                </button>
                              )}
                              <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedEvent(event)}
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-events">
                        <p>No events found matching your filters</p>
                        <button className="btn btn-primary-visitor" onClick={handleReset}>
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Registrations Page */}
              {activePage === "registrations" && (
                <section className="registrations-page">
                  <div className="page-header">
                    <h1>My Registrations</h1>
                    <p className="subtitle">Manage your event registrations</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="stats-cards">
                    <div className="stat-card-visitor">
                      <div className="stat-icon">📊</div>
                      <div className="stat-info">
                        <h3>{myRegistrations.length}</h3>
                        <p>Total Registrations</p>
                      </div>
                    </div>
                    <div className="stat-card-visitor">
                      <div className="stat-icon">🚀</div>
                      <div className="stat-info">
                        <h3>{upcomingRegistrations.length}</h3>
                        <p>Upcoming Events</p>
                      </div>
                    </div>
                    <div className="stat-card-visitor">
                      <div className="stat-icon">✓</div>
                      <div className="stat-info">
                        <h3>{pastRegistrations.length}</h3>
                        <p>Completed Events</p>
                      </div>
                    </div>
                  </div>

                  {/* UPDATED: Filters section with new fields */}
                  <div className="registrations-filters-section">
                    <div className="filters-bar">
                      {/* NEW: Event name filter */}
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search by event name..."
                        value={regEventNameFilter}
                        onChange={(e) => setRegEventNameFilter(e.target.value)}
                        aria-label="Filter by event name"
                      />

                      {/* NEW: Organizer filter */}
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Filter by organizer..."
                        value={regOrganizerFilter}
                        onChange={(e) => setRegOrganizerFilter(e.target.value)}
                        aria-label="Filter by organizer"
                      />

                      {/* NEW: Category filter */}
                      <select
                        className="filter-select"
                        value={regCategoryFilter}
                        onChange={(e) => setRegCategoryFilter(e.target.value)}
                        aria-label="Filter by category"
                      >
                        <option value="">All Categories</option>
                        <option value="Music">Music</option>
                        <option value="Technology">Technology</option>
                        <option value="Business">Business</option>
                        <option value="Food">Food</option>
                        <option value="Art">Art</option>
                        <option value="Sports">Sports</option>
                        <option value="Education">Education</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Wellness">Wellness</option>
                      </select>

                      {/* NEW: Location filter */}
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Filter by location..."
                        value={regLocationFilter}
                        onChange={(e) => setRegLocationFilter(e.target.value)}
                        aria-label="Filter by location"
                      />

                      {/* NEW: Type filter */}
                      <select
                        className="filter-select"
                        value={regTypeFilter}
                        onChange={(e) => setRegTypeFilter(e.target.value)}
                        aria-label="Filter by type"
                      >
                        <option value="">All Types</option>
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                      </select>

                      {/* Existing status filter */}
                      <select
                        className="filter-select"
                        value={registrationFilter}
                        onChange={(e) => setRegistrationFilter(e.target.value)}
                        aria-label="Filter by status"
                      >
                        <option value="all">All Events</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                      </select>
      
                      <button 
                        className="reset-btn-visitor" 
                        onClick={handleRegistrationReset}
                        aria-label="Reset all filters"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>

                  {/* UPDATED: Table with new columns for Organizer Name and Type */}
                  {getFilteredRegistrations().length > 0 ? (
                    <div className="registrations-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Organizer</th> {/* NEW COLUMN */}
                            <th>Type</th> {/* NEW COLUMN */}
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredRegistrations().map(reg => {
                            const isUpcoming = new Date(reg.event.date) >= today;
                            return (
                              <tr key={reg.id}>
                                <td>{reg.event.title}</td>
                                <td>{reg.event.category}</td>
                                <td>{formatDateTime(reg.event.date)}</td>
                                <td>{reg.event.location}</td>
                                <td>{reg.event.organizerName}</td> {/* NEW: Organizer column */}
                                <td>
                                  {/* NEW: Type badge column */}
                                  <span className={`type-badge-vis ${reg.event.eventType?.toLowerCase()}`}>
                                    {reg.event.eventType === 'PRIVATE' ? '🔒 Private' : '🌐 Public'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-badge-vis ${isUpcoming ? 'upcoming' : 'past'}`}>
                                    {isUpcoming ? 'Upcoming' : 'Completed'}
                                  </span>
                                </td>
                                <td>
                                  <div className="table-actions">
                                    <button
                                      className="btn-view"
                                      onClick={() => setSelectedEvent(reg.event)}
                                    >
                                      View
                                    </button>
                                    {isUpcoming && (
                                      <button
                                        className="btn-cancel"
                                        onClick={() => handleCancelRegistration(reg.id, reg.event.id)}
                                      >
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
                  ) : (
                    <div className="no-registrations">
                      <p>You haven't registered for any events yet</p>
                      <button className="btn btn-primary-visitor" onClick={() => setActivePage("events")}>
                        Browse Events
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* Profile Page - UPDATED with new structure */}
              {activePage === "profile" && userProfile && (
                <section className="profile-page">
                  <div className="profile-container">
                    <div className="form-header">
                      <h2>My Profile</h2>
                      <p className="form-subtitle">Manage your profile information</p>
                    </div>
                    
                    {!editing ? (
                      <div className="profile-view-card">
                        <div className="profile-avatar-wrapper">
                          <img 
                            src={profileForm.imageUrl || userProfile.imageUrl || "/src/assets/EZ-logo1.png"} 
                            alt="Profile" 
                            className="profile-avatar"
                          />
                        </div>
                        <div className="profile-details">
                          <h3 className="profile-name">{userProfile.name}</h3>
                          <p className="profile-email">{userProfile.email}</p>
                          <span className="role-badge">{userProfile.role}</span>
                          <div className="profile-meta">
                            <div className="meta-item">
                              <span className="meta-label">Mobile:</span>
                              <span className="meta-value">{userProfile.mobileNumber || "Not provided"}</span>
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-primary-visitor" onClick={() => setEditing(true)}>
                          Edit Profile
                        </button>
                      </div>
                    ) : (
                      <form className="profile-edit-form" onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                          <label className="form-label">Profile Image</label>
                          <div className="image-upload-area">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                handleImageUpload(file);
                              }}
                              className="file-input"
                              id="profile-image-upload"
                            />
                            <label htmlFor="profile-image-upload" className="upload-label">
                              {profileForm.imageUrl ? "Change Image" : "Upload Image"}
                            </label>
                            {profileForm.imageUrl && (
                              <div className="image-preview profile-preview">
                                <img src={profileForm.imageUrl} alt="Profile preview" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                            className="form-input"
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Email (Cannot be changed)</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            disabled
                            className="form-input disabled"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Role</label>
                          <input
                            type="text"
                            value={userProfile.role}
                            disabled
                            className="form-input disabled"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Mobile Number</label>
                          <input
                            type="tel"
                            name="mobileNumber"
                            value={profileForm.mobileNumber || ""}
                            onChange={(e) => setProfileForm({...profileForm, mobileNumber: e.target.value})}
                            placeholder="+91 9876543210"
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary-visitor" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditing(false);
                              setError("");
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
            </>
          )}
        </div>
      </main>

      {/* Event Details modal */}
      {selectedEvent && (
        <div className="modal-visitor-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-visitor-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-visitor-close" onClick={() => setSelectedEvent(null)}>×</button>
            <div className="modal-visitor-header">
              <img 
                src={selectedEvent.imageUrl || "https://via.placeholder.com/400x200?text=Event"} 
                alt={selectedEvent.title} 
                className="modal-visitor-image" 
              />
              <h2>{selectedEvent.title}</h2>
            </div>
            <div className="modal-visitor-body">
              <div className="modal-visitor-info">
                <p><strong>Category:</strong> {selectedEvent.category}</p>
                <p><strong>Date:</strong> {formatDateTime(selectedEvent.date)}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Organizer:</strong> {selectedEvent.organizerName}</p>
                {selectedEvent.maxAttendees && (
                  <p><strong>Capacity:</strong> {selectedEvent.currentAttendees || 0} / {selectedEvent.maxAttendees}</p>
                )}
                <p><strong>Type:</strong> {selectedEvent.eventType === 'PRIVATE' ? '🔒 Private' : '🌐 Public'}</p>
              </div>
              <div className="modal-visitor-description">
                <h3>About this event</h3>
                <p>{selectedEvent.description}</p>
              </div>
            </div>
            <div className="modal-visitor-footer">
              {!registeredEventIds.has(selectedEvent.id) && (
                <button
                  className="btn btn-primary-visitor"
                  onClick={() => {
                    handleRegister(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  disabled={selectedEvent.maxAttendees && selectedEvent.currentAttendees >= selectedEvent.maxAttendees}
                >
                  Register Now
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private Event Code Popup */}
      {showPrivateCodePopup && privateEventToRegister && (
        <div className="modal-visitor-overlay" onClick={() => {
          setShowPrivateCodePopup(false);
          setPrivateEventToRegister(null);
          setPrivateCode("");
          setPrivateCodeError("");
        }}>
          <div className="private-code-modal-visitor" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-visitor-close" 
              onClick={() => {
                setShowPrivateCodePopup(false);
                setPrivateEventToRegister(null);
                setPrivateCode("");
                setPrivateCodeError("");
              }}
            >
              ×
            </button>
            
            <div className="private-code-header">
              <h2>🔒 Private Event</h2>
              <p>Enter the private code to register for <strong>{privateEventToRegister.title}</strong></p>
            </div>
            
            <div className="private-code-body">
              <div className="form-group">
                <label>Private Code *</label>
                <input
                  type="text"
                  value={privateCode}
                  onChange={(e) => {
                    setPrivateCode(e.target.value);
                    setPrivateCodeError("");
                  }}
                  placeholder="Enter private code"
                  className={privateCodeError ? "error-input" : ""}
                  autoFocus
                />
                {privateCodeError && (
                  <p className="error-message">{privateCodeError}</p>
                )}
              </div>
            </div>
            
            <div className="private-code-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPrivateCodePopup(false);
                  setPrivateEventToRegister(null);
                  setPrivateCode("");
                  setPrivateCodeError("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary-visitor"
                onClick={handlePrivateEventRegister}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}