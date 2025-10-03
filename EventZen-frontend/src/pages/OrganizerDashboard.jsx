// src/pages/OrganizerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Organizer Dashboard/OrganizerDashboard.css";

// ============ MyEvents Component ============
// import React, { useState, useEffect } from "react";
// import API from "../services/api";
// import "../styles/Organizer Dashboard/OrganizerDashboard.css";

function MyEvents({ onEditEvent }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showorgModal, setShoworgModal] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

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

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      setLoading(true);
      await API.delete(`/events/${eventId}`);
      await fetchMyEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.response?.data?.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShoworgModal(true);
  };

  const handleCloseorgModal = () => {
    setShoworgModal(false);
    setSelectedEvent(null);
  };

  const formatDateDDMMYYYY = (isoDateStr) => {
    const date = new Date(isoDateStr);
    return date.toLocaleDateString('en-GB');
  };

  const formatTimeHHMM = (isoDateStr) => {
    const date = new Date(isoDateStr);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

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

  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const pastEvents = totalEvents - upcomingEvents;

  if (loading) {
    return <div className="loading-spinner">Loading your events...</div>;
  }

  return (
    <div className="my-events">
      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{totalEvents}</span>
            <span className="stat-label">Total Events</span>
          </div>
        </div>
        <div className="stat-card upcoming">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <span className="stat-value">{upcomingEvents}</span>
            <span className="stat-label">Upcoming Events</span>
          </div>
        </div>
        <div className="stat-card past">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <span className="stat-value">{pastEvents}</span>
            <span className="stat-label">Completed Events</span>
          </div>
        </div>
      </div>

      <div className="events-header">
        <h2 className="section-title">My Events</h2>
        <div className="filter-container">
          <label>Filter by:</label>
          <select 
            value={eventFilter} 
            onChange={(e) => setEventFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No events found</h3>
          <p>
            {eventFilter === "all" 
              ? "You haven't created any events yet."
              : `No ${eventFilter} events found.`
            }
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="events-table">
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
                    <td><span className="event-title">{event.title}</span></td>
                    <td>{formatDateDDMMYYYY(event.date)}</td>
                    <td>{formatTimeHHMM(event.date)}</td>
                    <td><span className="category-badge">{event.category}</span></td>
                    <td>
                      <span className={`type-badge ${event.eventType?.toLowerCase()}`}>
                        {event.eventType || 'PUBLIC'}
                      </span>
                    </td>
                    <td className="attendees-cell">
                      {(event.currentAttendees || 0)} / {event.maxAttendees || 0}
                    </td>
                    <td>
                      <span className={`status-badge ${isUpcoming ? 'upcoming' : 'past'}`}>
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
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
                        ) : null}
                        <button 
                          className="action-btn view"
                          onClick={() => handleViewDetails(event)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showorgModal && selectedEvent && (
        <div className="orgModal-overlay" onClick={handleCloseorgModal}>
          <div className="orgModal-content" onClick={(e) => e.stopPropagation()}>
            <button className="orgModal-close" onClick={handleCloseorgModal}>×</button>
            
            <div className="orgModal-header">
              <img 
                src={selectedEvent.imageUrl || defaultImages[selectedEvent.category] || defaultImages["Other"]} 
                alt={selectedEvent.title}
                className="orgModal-image"
              />
              <h2>{selectedEvent.title}</h2>
              <span className="category-badge">{selectedEvent.category}</span>
            </div>

            <div className="orgModal-body">
              <div className="detail-row">
                <strong>Description</strong>
                <p>{selectedEvent.description}</p>
              </div>

              <div className="detail-row">
                <strong>Date & Time</strong>
                <p>{formatDateDDMMYYYY(selectedEvent.date)} at {formatTimeHHMM(selectedEvent.date)}</p>
              </div>

              <div className="detail-row">
                <strong>Location</strong>
                <p>{selectedEvent.location || "Not specified"}</p>
              </div>

              <div className="detail-row">
                <strong>Event Type</strong>
                <span className={`type-badge ${selectedEvent.eventType?.toLowerCase()}`}>
                  {selectedEvent.eventType || 'PUBLIC'}
                </span>
              </div>

              {selectedEvent.eventType === "PRIVATE" && selectedEvent.privateCode && (
                <div className="detail-row">
                  <strong>Private Code</strong>
                  <span className="private-code">{selectedEvent.privateCode}</span>
                </div>
              )}

              <div className="detail-row">
                <strong>Attendees</strong>
                <p>{selectedEvent.currentAttendees || 0} / {selectedEvent.maxAttendees || "Unlimited"}</p>
              </div>

              <div className="detail-row">
                <strong>Status</strong>
                <span className={`status-badge ${new Date(selectedEvent.date) > new Date() ? 'upcoming' : 'past'}`}>
                  {new Date(selectedEvent.date) > new Date() ? 'Upcoming' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// export default MyEvents;
// window.location.href = `/events/${event.id}`;

// ============ CreateEventForm Component (UPDATED WITH VALIDATION) ============
function CreateEventForm({ editingEvent, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    state: "",
    city: "",
    address: "",
    category: "",
    imageUrl: "",
    maxAttendees: "",
    eventType: "PUBLIC",
    privateCode: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);

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
    Punjab: ["Amritsar", "Ludhiana", "Chandigarh"]
  };

  const eventCategories = [
    "Music", "Technology", "Sports", "Art", "Business", 
    "Education", "Food", "Health", "Travel", "Entertainment", "Other"
  ];

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

  useEffect(() => {
    if (editingEvent) {
      const eventDate = new Date(editingEvent.date);
      const dateStr = eventDate.toISOString().slice(0, 10);
      const timeStr = eventDate.toTimeString().slice(0, 5);

      const locationParts = editingEvent.location?.split(", ") || [];
      let state = "", city = "", address = editingEvent.location || "";
      
      if (locationParts.length >= 3) {
        state = locationParts[locationParts.length - 1];
        city = locationParts[locationParts.length - 2];
        address = locationParts.slice(0, -2).join(", ");
      } else if (locationParts.length === 2) {
        city = locationParts[locationParts.length - 1];
        address = locationParts[0];
      }

      setFormData({
        title: editingEvent.title || "",
        description: editingEvent.description || "",
        date: dateStr,
        time: timeStr,
        state: state,
        city: city,
        address: address,
        category: editingEvent.category || "",
        imageUrl: editingEvent.imageUrl || "",
        maxAttendees: editingEvent.maxAttendees || "",
        eventType: editingEvent.eventType || "PUBLIC",
        privateCode: editingEvent.privateCode || ""
      });
    }
  }, [editingEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear general error message
    if (error) {
      setError("");
    }

    // Reset city when state changes
    if (name === "state") {
      setFormData(prev => ({ ...prev, city: "" }));
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
      const formDataImg = new FormData();
      formDataImg.append('file', file);
      
      const response = await API.post('/uploads', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validations
    if (!formData.title.trim()) {
      errors.title = "Event title is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!formData.date) {
      errors.date = "Date is required";
    }
    
    if (!formData.time) {
      errors.time = "Time is required";
    }
    
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    // Date/time validation
    if (formData.date && formData.time) {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      if (eventDateTime <= new Date()) {
        errors.date = "Event date and time must be in the future";
      }
    }
    
    // Max attendees validation
    if (formData.maxAttendees && (isNaN(formData.maxAttendees) || parseInt(formData.maxAttendees) <= 0)) {
      errors.maxAttendees = "Max attendees must be a positive number";
    }
    
    // Private code validation
    if (formData.eventType === "PRIVATE" && !formData.privateCode.trim()) {
      errors.privateCode = "Private code is required for private events";
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill out all required fields correctly");
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      const requestData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        category: formData.category,
        imageUrl: formData.imageUrl || defaultImages[formData.category] || defaultImages["Other"],
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        eventType: formData.eventType,
        privateCode: formData.eventType === "PRIVATE" ? formData.privateCode : null
      };

      if (editingEvent) {
        await API.put(`/events/${editingEvent.id}`, requestData);
      } else {
        await API.post("/events", requestData);
      }

      onSuccess(editingEvent ? "Event updated successfully!" : "Event created successfully!");
      
    } catch (err) {
      console.error("Error saving event:", err);
      
      if (err.response?.data && typeof err.response.data === 'object') {
        const errorMessages = Object.values(err.response.data).join(", ");
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || "Failed to save event");
      }
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  };

  return (
    <div className="create-event-wrapper">
      <div className="form-header">
        <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
        <p className="form-subtitle">Fill in the details below to {editingEvent ? "update" : "create"} your event</p>
      </div>
      
      {error && <div className="alert error">{error}</div>}

      <form className="event-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <label className="form-label">Event Image</label>
          <div className="image-upload-area">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImageFile(file);
                handleImageUpload(file);
              }}
              className="file-input"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="upload-label">
              {formData.imageUrl ? "Change Image" : "Upload Image"}
            </label>
            {formData.imageUrl && (
              <div className="image-preview">
                <img src={formData.imageUrl} alt="Event preview" />
              </div>
            )}
            <small className="form-hint">
              Upload an image or leave empty to use a default image based on category
            </small>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-input ${fieldErrors.category ? 'error-field' : ''}`}
            >
              <option value="">Select Category</option>
              {eventCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <span className="error-message">{fieldErrors.category}</span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event name"
              className={`form-input ${fieldErrors.title ? 'error-field' : ''}`}
            />
            {fieldErrors.title && (
              <span className="error-message">{fieldErrors.title}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Event description"
            rows="4"
            className={`form-textarea ${fieldErrors.description ? 'error-field' : ''}`}
          />
          {fieldErrors.description && (
            <span className="error-message">{fieldErrors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Address *</label>
          <textarea 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter venue details, landmark, or address"
            rows="2"
            className={`form-textarea ${fieldErrors.address ? 'error-field' : ''}`}
          />
          {fieldErrors.address && (
            <span className="error-message">{fieldErrors.address}</span>
          )}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="form-input"
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
            <label className="form-label">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
              className="form-input"
            >
              <option value="">Select City</option>
              {formData.state &&
                stateCityData[formData.state].map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={getTomorrowDate()}
              className={`form-input ${fieldErrors.date ? 'error-field' : ''}`}
            />
            {fieldErrors.date && (
              <span className="error-message">{fieldErrors.date}</span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Time *</label>
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`form-input ${fieldErrors.time ? 'error-field' : ''}`}
            />
            {fieldErrors.time && (
              <span className="error-message">{fieldErrors.time}</span>
            )}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Max Attendees</label>
            <input 
              type="number" 
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="1"
              className={`form-input ${fieldErrors.maxAttendees ? 'error-field' : ''}`}
            />
            {fieldErrors.maxAttendees && (
              <span className="error-message">{fieldErrors.maxAttendees}</span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Event Type *</label>
            <select 
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="form-input"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        {formData.eventType === "PRIVATE" && (
          <div className="form-group">
            <label className="form-label">Private Code *</label>
            <input 
              type="text" 
              name="privateCode"
              value={formData.privateCode}
              onChange={handleChange}
              placeholder="Enter private access code"
              className={`form-input ${fieldErrors.privateCode ? 'error-field' : ''}`}
            />
            {fieldErrors.privateCode && (
              <span className="error-message">{fieldErrors.privateCode}</span>
            )}
            <small className="form-hint">
              Attendees will need this code to register for the event
            </small>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ============ Profile Component ============
function Profile({ onCancel, onSuccess }) {
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    role: "",
    mobileNumber: "",
    imageUrl: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/users/profile");
      setProfile(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
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
      
      setProfile(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      setIsEditing(false);
      onSuccess("Profile updated successfully!");
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.id) {
    return <div className="loading-spinner">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="form-header">
        <h2>My Profile</h2>
        <p className="form-subtitle">Manage your profile information</p>
      </div>
      
      {error && <div className="alert error">{error}</div>}

      {!isEditing ? (
        <div className="profile-view-card">
          <div className="profile-avatar-wrapper">
            <img 
              src={profile.imageUrl || "/src/assets/EZ-logo1.png"} 
              alt="Profile" 
              className="profile-avatar"
            />
          </div>
          <div className="profile-details">
            <h3 className="profile-name">{profile.name}</h3>
            <p className="profile-email">{profile.email}</p>
            <span className="role-badge">{profile.role}</span>
            <div className="profile-meta">
              <div className="meta-item">
                <span className="meta-label">Mobile:</span>
                <span className="meta-value">{profile.mobileNumber || "Not provided"}</span>
              </div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="profile-edit-form" onSubmit={handleSubmit}>
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
                {profile.imageUrl ? "Change Image" : "Upload Image"}
              </label>
              {profile.imageUrl && (
                <div className="image-preview profile-preview">
                  <img src={profile.imageUrl} alt="Profile preview" />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email (Cannot be changed)</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="form-input disabled"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="form-input disabled"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              name="mobileNumber"
              value={profile.mobileNumber || ""}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="form-input"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setError("");
                fetchProfile();
                onCancel();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ============ Main Dashboard Component ============
export default function OrganizerDashboard() {
  const navigate = useNavigate();
  
  const [activePage, setActivePage] = useState("myEvents");
  const [success, setSuccess] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setActivePage("createEvent");
  };

  const handleCreateEventSuccess = (message) => {
    setSuccess(message);
    setEditingEvent(null);
    setActivePage("myEvents");
    
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleCancelForm = () => {
    setEditingEvent(null);
    setActivePage("myEvents");
  };

  const handleProfileSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleProfileCancel = () => {
    setActivePage("myEvents");
  };

  return (
    <div className="organizer-dashboard">
      <nav className="top-navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🎯</span>
          <span className="brand-text">EventZen Organizer</span>
        </div>
        <ul className="nav-menu">
          <li 
            onClick={() => {
              setActivePage("myEvents");
              setEditingEvent(null);
            }}
            className={activePage === "myEvents" ? "nav-item active" : "nav-item"}
          >
            My Events
          </li>
          <li 
            onClick={() => {
              setActivePage("createEvent");
              setEditingEvent(null);
            }}
            className={activePage === "createEvent" ? "nav-item active" : "nav-item"}
          >
            Create Event
          </li>
          <li 
            onClick={() => setActivePage("profile")}
            className={activePage === "profile" ? "nav-item active" : "nav-item"}
          >
            My Profile
          </li>
          <li onClick={handleLogout} className="nav-item logout">
            Logout
          </li>
        </ul>
      </nav>

      {success && <div className="alert success">{success}</div>}

      <main className="dashboard-main">
        {activePage === "myEvents" && (
          <MyEvents onEditEvent={handleEditEvent} />
        )}
        
        {activePage === "createEvent" && (
          <CreateEventForm
            editingEvent={editingEvent}
            onCancel={handleCancelForm}
            onSuccess={handleCreateEventSuccess}
          />
        )}
        
        {activePage === "profile" && (
          <Profile
            onCancel={handleProfileCancel}
            onSuccess={handleProfileSuccess}
          />
        )}
      </main>
    </div>
  );
}