// src/pages/OrganizerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Organizer Dashboard/OrganizerDashboard.css";
import API from "../services/api";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  
  // ===== STATE MANAGEMENT =====
  const [activePage, setActivePage] = useState("myEvents");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Events state
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    role: "",
    mobileNumber: "",
    imageUrl: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Create/Edit event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    imageUrl: ""
  });

  // State → Cities mapping (keeping your existing data)
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const stateCityData = {
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

  // ===== EFFECTS =====
  useEffect(() => {
    fetchMyEvents();
    fetchProfile();
  }, []);

  // ===== API CALLS =====
  
  // Fetch organizer's events
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

  // Fetch organizer profile
  const fetchProfile = async () => {
    try {
      const response = await API.get("/users/profile");
      setProfile(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    }
  };

  // Create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Build location string
      const fullLocation = selectedState && selectedCity 
        ? `${eventForm.location}, ${selectedCity}, ${selectedState}`
        : eventForm.location;

      const eventData = {
        ...eventForm,
        location: fullLocation,
        date: new Date(eventForm.date).toISOString()
      };

      await API.post("/events", eventData);
      setSuccess("Event created successfully!");
      
      // Reset form
      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        imageUrl: ""
      });
      setSelectedState("");
      setSelectedCity("");
      
      // Refresh events and switch to my events page
      await fetchMyEvents();
      setActivePage("myEvents");
      
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  // Update existing event
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const fullLocation = selectedState && selectedCity 
        ? `${eventForm.location}, ${selectedCity}, ${selectedState}`
        : eventForm.location;

      const eventData = {
        ...eventForm,
        location: fullLocation,
        date: new Date(eventForm.date).toISOString()
      };

      await API.put(`/events/${editingEvent.id}`, eventData);
      setSuccess("Event updated successfully!");
      
      // Reset form
      setEditingEvent(null);
      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        imageUrl: ""
      });
      setSelectedState("");
      setSelectedCity("");
      
      // Refresh events and switch to my events page
      await fetchMyEvents();
      setActivePage("myEvents");
      
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.response?.data?.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      setLoading(true);
      await API.delete(`/events/${eventId}`);
      setSuccess("Event deleted successfully!");
      await fetchMyEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.response?.data?.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  // Edit event - populate form
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    
    // Parse location to extract state/city
    const locationParts = event.location.split(", ");
    if (locationParts.length >= 3) {
      setSelectedState(locationParts[locationParts.length - 1]);
      setSelectedCity(locationParts[locationParts.length - 2]);
      setEventForm({
        ...event,
        location: locationParts.slice(0, -2).join(", "),
        date: new Date(event.date).toISOString().slice(0, 16) // Format for datetime-local
      });
    } else {
      setEventForm({
        ...event,
        date: new Date(event.date).toISOString().slice(0, 16)
      });
    }
    
    setActivePage("createEvent");
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const profileData = {
        name: profile.name,
        mobileNumber: profile.mobileNumber,
        profileImage: profile.imageUrl
      };

      const response = await API.put("/users/profile", profileData);
      setProfile(response.data);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  // Form change handlers
  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const pastEvents = totalEvents - upcomingEvents;

  return (
    <div className="organizer-dashboard">
      {/* ===== Top Navigation ===== */}
      <nav className="top-nav">
        <h2 className="logo">EventZen Organizer</h2>
        <ul>
          <li 
            onClick={() => setActivePage("myEvents")}
            className={activePage === "myEvents" ? "active" : ""}
          >
            My Events
          </li>
          <li 
            onClick={() => {
              setActivePage("createEvent");
              setEditingEvent(null);
              setEventForm({
                title: "",
                description: "",
                date: "",
                location: "",
                category: "",
                imageUrl: ""
              });
            }}
            className={activePage === "createEvent" ? "active" : ""}
          >
            Create Event
          </li>
          <li 
            onClick={() => setActivePage("profile")}
            className={activePage === "profile" ? "active" : ""}
          >
            My Profile
          </li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      {/* ===== Messages ===== */}
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      {loading && <div className="loading">Loading...</div>}

      {/* ===== My Events (Overview + Events) ===== */}
      {activePage === "myEvents" && (
        <section className="my-events">
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

          {/* Events Table */}
          <h3 className="section-title">My Events</h3>
          {events.length === 0 ? (
            <div className="no-events">
              <p>You haven't created any events yet.</p>
              <button 
                onClick={() => setActivePage("createEvent")}
                className="create-first-event-btn"
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date & Time</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const eventDate = new Date(event.date);
                  const isUpcoming = eventDate > new Date();
                  return (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td>{eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString()}</td>
                      <td>{event.category}</td>
                      <td>{event.location}</td>
                      <td>
                        <span className={`status ${isUpcoming ? 'upcoming' : 'past'}`}>
                          {isUpcoming ? 'Upcoming' : 'Past'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="action-btn edit"
                          onClick={() => handleEditEvent(event)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* ===== Create/Edit Event Form ===== */}
      {activePage === "createEvent" && (
        <section className="create-event">
          <h3>{editingEvent ? "Edit Event" : "Create New Event"}</h3>
          <form 
            className="event-form" 
            onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          >
            <div className="form-group">
              <label>Event Image URL</label>
              <input 
                type="url" 
                name="imageUrl"
                value={eventForm.imageUrl}
                onChange={handleEventFormChange}
                placeholder="https://example.com/event-image.jpg"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <input 
                  type="text" 
                  name="category"
                  value={eventForm.category}
                  onChange={handleEventFormChange}
                  placeholder="e.g. Music, Tech, Sports"
                  required
                />
              </div>
              <div className="form-group">
                <label>Event Name *</label>
                <input 
                  type="text" 
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  placeholder="Enter event name"
                  required
                />
              </div>
            </div>

            {/* State and City selection */}
            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity(""); // reset city when state changes
                  }}
                >
                  <option value="">Select State</option>
                  {Object.keys(stateCityData).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {selectedState &&
                    stateCityData[selectedState].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Detailed event location */}
            <div className="form-group">
              <label>Detailed Location *</label>
              <textarea 
                name="location"
                value={eventForm.location}
                onChange={handleEventFormChange}
                placeholder="Enter venue details, landmark, or address"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Date & Time *</label>
              <input 
                type="datetime-local" 
                name="date"
                value={eventForm.date}
                onChange={handleEventFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea 
                name="description"
                value={eventForm.description}
                onChange={handleEventFormChange}
                placeholder="Event description"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
              </button>
              {editingEvent && (
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setEditingEvent(null);
                    setActivePage("myEvents");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* ===== Profile ===== */}
      {activePage === "profile" && (
        <section className="profile-settings">
          <h3>My Profile</h3>
          {!isEditing ? (
            <div className="profile-card">
              <div className="profile-avatar">
                <img 
                  src={profile.imageUrl || "../src/assets/EZ-logo1.png"} 
                  alt="Profile" 
                />
              </div>
              <div className="profile-info">
                <h4>{profile.name}</h4>
                <p>{profile.email}</p>
                <span className="role-tag">{profile.role}</span>
                <div className="profile-meta">
                  <p><strong>Mobile:</strong> {profile.mobileNumber || "Not provided"}</p>
                </div>
              </div>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <form className="profile-form" onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Profile Image URL</label>
                <input 
                  type="url" 
                  name="imageUrl"
                  value={profile.imageUrl || ""}
                  onChange={handleProfileChange}
                  placeholder="https://example.com/profile-image.jpg"
                />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={profile.mobileNumber || ""}
                  onChange={handleProfileChange}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={profile.role} readOnly style={{ backgroundColor: "#f5f5f5" }} />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile(); // Reset changes
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}