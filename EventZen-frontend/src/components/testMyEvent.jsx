// src/components/MyEvents.jsx
import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/Organizer Dashboard/MyEvents.css";

export default function MyEvents({ onEditEvent }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState("all"); // all, upcoming, past
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch events
  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Filter events when events, filter, or search term changes
  useEffect(() => {
    filterEvents();
  }, [events, eventFilter, searchTerm]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/events/my-events");
      setEvents(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load your events");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    let filtered = [...events];

    // Filter by time period
    if (eventFilter === "upcoming") {
      filtered = events.filter(event => new Date(event.date) > now);
    } else if (eventFilter === "past") {
      filtered = events.filter(event => new Date(event.date) <= now);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort events in ascending order (earliest first for upcoming, latest first for past)
    if (eventFilter === "past") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      await API.delete(`/events/${eventId}`);
      await fetchMyEvents(); // Refresh events
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.response?.data?.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  // Format date to dd/MM/yyyy
  const formatDateDDMMYYYY = (isoDateStr) => {
    const date = new Date(isoDateStr);
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
  };

  // Format time to HH:mm (24-hour format)
  const formatTimeHHMM = (isoDateStr) => {
    const date = new Date(isoDateStr);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Get relative time (e.g., "in 2 days", "2 days ago")
  const getRelativeTime = (dateStr) => {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      if (diffDays === 1) return "Tomorrow";
      if (diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
      return `In ${Math.ceil(diffDays / 30)} months`;
    } else {
      const absDays = Math.abs(diffDays);
      if (absDays === 0) return "Today";
      if (absDays === 1) return "Yesterday";
      if (absDays <= 7) return `${absDays} days ago`;
      if (absDays <= 30) return `${Math.ceil(absDays / 7)} weeks ago`;
      return `${Math.ceil(absDays / 30)} months ago`;
    }
  };

  // Default images by category
  const defaultImages = {
    "Music": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    "Technology": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
    "Art": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
    "Business": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    "Education": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
    "Food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    "Health": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    "Travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
    "Entertainment": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&h=300&fit=crop",
    "Other": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop"
  };

  // Statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const pastEvents = totalEvents - upcomingEvents;

  if (loading) {
    return (
      <div className="my-events">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-events">
      {error && (
        <div className="alert error">
          <span className="error-icon">⚠️</span>
          {error}
          <button className="close-alert" onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="overview-section">
        <h2 className="main-title">My Events Dashboard</h2>
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Events</h3>
              <span className="stat-number">{totalEvents}</span>
            </div>
          </div>
          <div className="stat-card upcoming">
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <h3>Upcoming</h3>
              <span className="stat-number">{upcomingEvents}</span>
            </div>
          </div>
          <div className="stat-card past">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Completed</h3>
              <span className="stat-number">{pastEvents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="controls-section">
        <h3 className="section-title">Event Management</h3>
        <div className="controls-wrapper">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events by title, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filter-group">
            <label htmlFor="event-filter">Filter:</label>
            <select 
              id="event-filter"
              value={eventFilter} 
              onChange={(e) => setEventFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">All Events ({totalEvents})</option>
              <option value="upcoming">Upcoming ({upcomingEvents})</option>
              <option value="past">Past ({pastEvents})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <div className="no-events-icon">📅</div>
          <h3>No Events Found</h3>
          <p>
            {searchTerm ? (
              `No events match "${searchTerm}". Try adjusting your search terms.`
            ) : eventFilter === "all" ? (
              "You haven't created any events yet. Create your first event to get started!"
            ) : (
              `No ${eventFilter} events found.`
            )}
          </p>
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="events-section">
          <div className="results-header">
            <p className="results-count">
              Showing {filteredEvents.length} of {totalEvents} events
            </p>
          </div>
          
          <div className="table-container">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Time</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const isUpcoming = eventDate > new Date();
                  return (
                    <tr key={event.id} className={isUpcoming ? 'upcoming-event' : 'past-event'}>
                      <td className="event-info" data-label="Event">
                        <div className="event-details">
                          <img 
                            src={event.imageUrl || defaultImages[event.category] || defaultImages["Other"]} 
                            alt={event.title}
                            className="event-thumbnail"
                            loading="lazy"
                          />
                          <div className="event-text">
                            <h4 className="event-title">{event.title}</h4>
                            <p className="event-location">{event.location || 'Location not specified'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="date-time" data-label="Date & Time">
                        <div className="datetime-info">
                          <span className="date">{formatDateDDMMYYYY(event.date)}</span>
                          <span className="time">{formatTimeHHMM(event.date)}</span>
                          <span className="relative-time">{getRelativeTime(event.date)}</span>
                        </div>
                      </td>
                      <td data-label="Category">
                        <span className={`category-badge ${event.category?.toLowerCase()}`}>
                          {event.category}
                        </span>
                      </td>
                      <td data-label="Type">
                        <span className={`event-type ${event.eventType?.toLowerCase() || 'public'}`}>
                          {event.eventType === 'PRIVATE' ? '🔒 Private' : '🌐 Public'}
                        </span>
                      </td>
                      <td data-label="Attendees">
                        <div className="attendee-info">
                          <span className="attendee-count">
                            {event.currentAttendees || 0} / {event.maxAttendees || '∞'}
                          </span>
                          {event.maxAttendees && (
                            <div className="attendee-progress">
                              <div 
                                className="progress-bar"
                                style={{
                                  width: `${Math.min(100, ((event.currentAttendees || 0) / event.maxAttendees) * 100)}%`
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td data-label="Status">
                        <span className={`status-badge ${isUpcoming ? 'upcoming' : 'past'}`}>
                          {isUpcoming ? '🟢 Upcoming' : '🔵 Completed'}
                        </span>
                      </td>
                      <td className="actions" data-label="Actions">
                        <div className="action-buttons">
                          {isUpcoming ? (
                            <>
                              <button 
                                className="action-btn edit"
                                onClick={() => onEditEvent(event)}
                                title="Edit Event"
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                className="action-btn delete"
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Delete Event"
                              >
                                🗑️ Delete
                              </button>
                            </>
                          ) : (
                            <button 
                              className="action-btn view"
                              onClick={() => {
                                window.location.href = `/events/${event.id}`;
                              }}
                              title="View Event Details"
                            >
                              👁️ View
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
        </div>
      )}
    </div>
  );
}