// src/components/MyEvents.jsx
import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function MyEvents({ onEditEvent }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState("all"); // all, upcoming, past
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch events
  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Filter events when events or filter changes
  useEffect(() => {
    filterEvents();
  }, [events, eventFilter]);

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

    if (eventFilter === "upcoming") {
      filtered = events.filter(event => new Date(event.date) > now);
    } else if (eventFilter === "past") {
      filtered = events.filter(event => new Date(event.date) <= now);
    }

    // Sort events in ascending order (earliest first)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      setLoading(true);
      await API.delete(`/events/${eventId}`);
      await fetchMyEvents(); // Refresh events
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
    return <div className="loading">Loading your events...</div>;
  }

  return (
    <div className="my-events">
      {error && <div className="alert error">{error}</div>}

      {/* Overview Stats */}
      <div className="overview">
        <div className="card">
          Total Events <span>{totalEvents}</span>
        </div>
        <div className="card">
          Upcoming Events <span>{upcomingEvents}</span>
        </div>
        <div className="card">
          Past Events <span>{pastEvents}</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h3 className="section-title">My Events</h3>
        <div className="event-filter">
          <label>Filter by:</label>
          <select 
            value={eventFilter} 
            onChange={(e) => setEventFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <p>
            {eventFilter === "all" 
              ? "You haven't created any events yet."
              : `No ${eventFilter} events found.`
            }
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Date</th>
                <th>Time</th>
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
                  <tr key={event.id}>
                    <td>
                      <img 
                        src={event.imageUrl || defaultImages[event.category] || defaultImages["Other"]} 
                        alt={event.title}
                        className="event-thumbnail"
                      />
                    </td>
                    <td>{event.title}</td>
                    <td>{formatDateDDMMYYYY(event.date)}</td>
                    <td>{formatTimeHHMM(event.date)}</td>
                    <td>{event.category}</td>
                    <td>
                      <span className={`event-type ${event.eventType?.toLowerCase()}`}>
                        {event.eventType || 'PUBLIC'}
                      </span>
                    </td>
                    <td>
                      {(event.currentAttendees || 0)} / {event.maxAttendees || 0}
                    </td>
                    <td>
                      <span className={`status ${isUpcoming ? 'upcoming' : 'past'}`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </td>
                    <td>
                      {isUpcoming ? (
                        <>
                          <button 
                            className="action-btn edit"
                            onClick={() => onEditEvent(event)}
                          >
                            Edit
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button 
                          className="action-btn view"
                          onClick={() => {
                            // Navigate to event details page
                            window.location.href = `/events/${event.id}`;
                          }}
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
