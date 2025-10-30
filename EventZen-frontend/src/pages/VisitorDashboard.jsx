import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Visitor page styling/VisitorDashboard.css";
import API from "../services/api";
import { registerForEvent, getMyRegistrations, cancelRegistration } from "../services/registrations";

export default function VisitorDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("events");
  
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [allEvents, setAllEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [showPrivateCodePopup, setShowPrivateCodePopup] = useState(false);
  const [privateEventToRegister, setPrivateEventToRegister] = useState(null);
  const [privateCode, setPrivateCode] = useState("");
  const [privateCodeError, setPrivateCodeError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [organizerFilter, setOrganizerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [registrationFilter, setRegistrationFilter] = useState("all");
  const [regEventNameFilter, setRegEventNameFilter] = useState("");
  const [regCategoryFilter, setRegCategoryFilter] = useState("");
  const [regLocationFilter, setRegLocationFilter] = useState("");
  const [regOrganizerFilter, setRegOrganizerFilter] = useState("");
  const [regTypeFilter, setRegTypeFilter] = useState("");

  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    imageUrl: ""
  });

  useEffect(() => {
    loadUserData();
  }, []);

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
      
      const upcomingEvents = response.data.filter(event => {
        const eventDate = new Date(event.date);
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

  const handleRegister = async (eventId) => {
    try {
      const storedUserId = userId || localStorage.getItem("userId");
      if (!storedUserId) {
        setError("Please login to register for events");
        return;
      }

      const event = allEvents.find(e => e.id === eventId);
      
      if (event && event.eventType === "PRIVATE") {
        setPrivateEventToRegister(event);
        setShowPrivateCodePopup(true);
        setPrivateCode("");
        setPrivateCodeError("");
        return;
      }

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

  const handlePrivateEventRegister = async () => {
    if (!privateCode.trim()) {
      setPrivateCodeError("Please enter the private code");
      return;
    }

    try {
      const storedUserId = userId || localStorage.getItem("userId");
      
      await registerForEvent(privateEventToRegister.id, storedUserId, privateCode);
      
      setRegisteredEventIds(prev => new Set([...prev, privateEventToRegister.id]));
      setSuccess("Successfully registered for the event!");
      setTimeout(() => setSuccess(""), 3000);
      
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

  const handleReset = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setLocationFilter("");
    setOrganizerFilter("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const handleRegistrationReset = () => {
    setRegistrationFilter("all");
    setRegEventNameFilter("");
    setRegCategoryFilter("");
    setRegLocationFilter("");
    setRegOrganizerFilter("");
    setRegTypeFilter("");
  };

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

  const getFilteredRegistrations = () => {
    const now = new Date();
    
    return myRegistrations.filter(reg => {
      if (!reg.event) return false;
      
      const eventDate = new Date(reg.event.date);
      
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
    <div className="vis-visitor-dashboard">
      <aside className="vis-sidebar">
        <div className="vis-logo">
          <div className="vis-logo-icon">
            <img src="/src/assets/EZ-logo1.png" alt="logo" className="vis-logo-img" />
          </div>
          <span className="vis-logo-text">EventZen</span>
        </div>

        <nav className="vis-nav-menu-visitor">
          <button
            className={`vis-nav-item ${activePage === "events" ? "vis-active" : ""}`}
            onClick={() => setActivePage("events")}
          >
            <span className="vis-nav-icon">📅</span>
            <span>Events</span>
          </button>
          <button
            className={`vis-nav-item ${activePage === "registrations" ? "vis-active" : ""}`}
            onClick={() => setActivePage("registrations")}
          >
            <span className="vis-nav-icon">🎟️</span>
            <span>My Registrations</span>
          </button>
          <button
            className={`vis-nav-item ${activePage === "profile" ? "vis-active" : ""}`}
            onClick={() => setActivePage("profile")}
          >
            <span className="vis-nav-icon">👤</span>
            <span>Profile</span>
          </button>
          <button className="vis-nav-item vis-logout" onClick={handleLogout}>
            <span className="vis-nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="vis-main-content">
        <div className="vis-content-wrapper">
          {error && (
            <div className="vis-alert vis-error">
              {error}
              <button onClick={() => setError("")} className="vis-alert-close">×</button>
            </div>
          )}
          {success && (
            <div className="vis-alert vis-success">
              {success}
              <button onClick={() => setSuccess("")} className="vis-alert-close">×</button>
            </div>
          )}

          {loading ? (
            <div className="vis-loading-state">
              <div className="vis-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
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
                      placeholder="🔍 Search events..."
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
                    
                    <button 
                      className="vis-reset-btn-visitor" 
                      onClick={handleReset}
                      aria-label="Reset all filters"
                    >
                      Reset Filters
                    </button>
                  </div>

                  <div className="vis-events-grid">
                    {getFilteredEvents().length > 0 ? (
                      getFilteredEvents().map(event => (
                        <div key={event.id} className="vis-event-card-visitor">
                          <div className="vis-event-image">
                            <img 
                              src={event.imageUrl || "https://via.placeholder.com/400x200?text=Event"} 
                              alt={event.title} 
                            />
                            <span className={`vis-event-badge ${
                              registeredEventIds.has(event.id) 
                                ? 'vis-registered' 
                                : event.eventType === 'PRIVATE' 
                                  ? 'vis-private' 
                                  : 'vis-public'
                            }`}>
                              {registeredEventIds.has(event.id) 
                                ? '✓ Registered' 
                                : event.eventType === 'PRIVATE' 
                                  ? '🔒 Private' 
                                  : '🌐 Public'}
                            </span>
                          </div>
                          <div className="vis-event-details-visitor">
                            <h3>{event.title}</h3>
                            <span className="vis-event-category">{event.category}</span>
                            <div className="vis-event-info-grid">
                              <p className="vis-event-date">📅 {formatDateTime(event.date)}</p>
                              <p className="vis-event-location">📍  {event.location}</p>
                              <p className="vis-event-organizer">👤 {event.organizerName}</p>
                              {event.maxAttendees && (
                                <p className="vis-event-capacity">
                                  👥 {event.currentAttendees || 0}/{event.maxAttendees}
                                </p>
                              )}
                            </div>
                            <div className="vis-event-actions">
                              {registeredEventIds.has(event.id) ? (
                                <button className="vis-btn vis-btn-registered" disabled>
                                  Registered
                                </button>
                              ) : (
                                <button
                                  className="vis-btn vis-btn-primary-visitor"
                                  onClick={() => handleRegister(event.id)}
                                  disabled={event.maxAttendees && event.currentAttendees >= event.maxAttendees}
                                >
                                  {event.maxAttendees && event.currentAttendees >= event.maxAttendees ? "Full" : "Register Now"}
                                </button>
                              )}
                              <button
                                className="vis-btn vis-btn-secondary"
                                onClick={() => setSelectedEvent(event)}
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="vis-no-events">
                        <p>No events found matching your filters</p>
                        <button className="vis-btn vis-btn-primary-visitor" onClick={handleReset}>
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activePage === "registrations" && (
                <section className="vis-registrations-page">
                  <div className="vis-page-header">
                    <h1>My Registrations</h1>
                    <p className="vis-subtitle">Manage your event registrations</p>
                  </div>

                  <div className="vis-stats-cards">
                    <div className="vis-stat-card-visitor">
                      <div className="vis-stat-icon">📊</div>
                      <div className="vis-stat-info">
                        <h3>{myRegistrations.length}</h3>
                        <p>Total Registrations</p>
                      </div>
                    </div>
                    <div className="vis-stat-card-visitor">
                      <div className="vis-stat-icon">🚀</div>
                      <div className="vis-stat-info">
                        <h3>{upcomingRegistrations.length}</h3>
                        <p>Upcoming Events</p>
                      </div>
                    </div>
                    <div className="vis-stat-card-visitor">
                      <div className="vis-stat-icon">✓</div>
                      <div className="vis-stat-info">
                        <h3>{pastRegistrations.length}</h3>
                        <p>Completed Events</p>
                      </div>
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
                        Reset Filters
                      </button>
                    </div>
                  </div>

                  {getFilteredRegistrations().length > 0 ? (
                    <div className="vis-registrations-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Organizer</th>
                            <th>Type</th>
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
                                <td>{reg.event.organizerName}</td>
                                <td>
                                  <span className={`vis-type-badge-vis ${
  reg.event.eventType === 'PRIVATE'
    ? 'vis-private'
    : reg.event.eventType === 'PUBLIC'
      ? 'vis-public'
      : ''
}`}
>
                                    {reg.event.eventType === 'PRIVATE' ? '🔒 Private' : '🌐 Public'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`vis-status-badge-vis ${isUpcoming ? 'vis-upcoming' : 'vis-past'}`}>
                                    {isUpcoming ? 'Upcoming' : 'Completed'}
                                  </span>
                                </td>
                                <td>
                                  <div className="vis-table-actions">
                                    <button
                                      className="vis-btn-view"
                                      onClick={() => setSelectedEvent(reg.event)}
                                    >
                                      View
                                    </button>
                                    {isUpcoming && (
                                      <button
                                        className="vis-btn-cancel"
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
                    <div className="vis-no-registrations">
                      <p>You haven't registered for any events yet</p>
                      <button className="vis-btn vis-btn-primary-visitor" onClick={() => setActivePage("events")}>
                        Browse Events
                      </button>
                    </div>
                  )}
                </section>
              )}

              {activePage === "profile" && userProfile && (
                <section className="vis-profile-page">
                  <div className="vis-profile-container">
                    <div className="vis-form-header">
                      <h2>My Profile</h2>
                      <p className="vis-form-subtitle">Manage your profile information</p>
                    </div>
                    
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
                        <div className="vis-form-group">
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
                              {profileForm.imageUrl ? "Change Image" : "Upload Image"}
                            </label>
                            {profileForm.imageUrl && (
                              <div className="vis-image-preview vis-profile-preview">
                                <img src={profileForm.imageUrl} alt="Profile preview" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="vis-form-group">
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
                        
                        <div className="vis-form-group">
                          <label className="vis-form-label">Email (Cannot be changed)</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            disabled
                            className="vis-form-input vis-disabled"
                          />
                        </div>
                        
                        <div className="vis-form-group">
                          <label className="vis-form-label">Role</label>
                          <input
                            type="text"
                            value={userProfile.role}
                            disabled
                            className="vis-form-input vis-disabled"
                          />
                        </div>
                        
                        <div className="vis-form-group">
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

      {selectedEvent && (
        <div className="vis-modal-visitor-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="vis-modal-visitor-content" onClick={(e) => e.stopPropagation()}>
            <button className="vis-modal-visitor-close" onClick={() => setSelectedEvent(null)}>×</button>
            <div className="vis-modal-visitor-header">
              <img 
                src={selectedEvent.imageUrl || "https://via.placeholder.com/400x200?text=Event"} 
                alt={selectedEvent.title} 
                className="vis-modal-visitor-image" 
              />
              <h2>{selectedEvent.title}</h2>
            </div>
            <div className="vis-modal-visitor-body">
              <div className="vis-modal-visitor-info">
                <p><strong>Category:</strong> {selectedEvent.category}</p>
                <p><strong>Date:</strong> {formatDateTime(selectedEvent.date)}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Organizer:</strong> {selectedEvent.organizerName}</p>
                {selectedEvent.maxAttendees && (
                  <p><strong>Capacity:</strong> {selectedEvent.currentAttendees || 0} / {selectedEvent.maxAttendees}</p>
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
                    handleRegister(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  disabled={selectedEvent.maxAttendees && selectedEvent.currentAttendees >= selectedEvent.maxAttendees}
                >
                  Register Now
                </button>
              )}
              <button className="vis-btn vis-btn-secondary" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivateCodePopup && privateEventToRegister && (
        <div className="vis-modal-visitor-overlay" onClick={() => {
          setShowPrivateCodePopup(false);
          setPrivateEventToRegister(null);
          setPrivateCode("");
          setPrivateCodeError("");
        }}>
          <div className="vis-private-code-modal-visitor" onClick={(e) => e.stopPropagation()}>
            <button 
              className="vis-modal-visitor-close" 
              onClick={() => {
                setShowPrivateCodePopup(false);
                setPrivateEventToRegister(null);
                setPrivateCode("");
                setPrivateCodeError("");
              }}
            >
              ×
            </button>
            
            <div className="vis-private-code-header">
              <h2>🔒 Private Event</h2>
              <p>Enter the private code to register for <strong>{privateEventToRegister.title}</strong></p>
            </div>
            
            <div className="vis-private-code-body">
              <div className="vis-form-group">
                <label>Private Code *</label>
                <input
                  type="text"
                  value={privateCode}
                  onChange={(e) => {
                    setPrivateCode(e.target.value);
                    setPrivateCodeError("");
                  }}
                  placeholder="Enter private code"
                  className={privateCodeError ? "vis-error-input" : ""}
                  autoFocus
                />
                {privateCodeError && (
                  <p className="vis-error-message">{privateCodeError}</p>
                )}
              </div>
            </div>
            
            <div className="vis-private-code-footer">
              <button
                className="vis-btn vis-btn-secondary"
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
                className="vis-btn vis-btn-primary-visitor"
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