import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Organizer Dashboard/OrganizerDashboard.css";
import OrganizerAnalyticsPage from "../pages/OrganizerAnalyticsPage";
import {
  Calendar,
  Users,
  User,
  UserPlus,
  LogOut,
  Trash2,
  Edit,
  X,
  Save,
  Loader,
  Eye,
  Filter,
  RotateCcw,
  Upload,
  CircleX,
  ChartBarStacked,
  ImagePlus
} from "lucide-react";

// ============ Toast Notification Component ============
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`org-toast org-toast-${type}`} onClick={onClose} role="alert">
      <span className="org-toast-icon" aria-hidden="true">
        {type === 'success' ? '✓' : '✕'}
      </span>
      <span className="org-toast-message">{message}</span>
    </div>
  );
}

// ============ MyEvents Component ============
function MyEvents({ onEditEvent }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // Filter states
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchName, searchLocation, categoryFilter, typeFilter, statusFilter]);

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

    if (searchName.trim()) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchLocation.trim()) {
      filtered = filtered.filter(event => 
        event.location?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(event => (event.eventType || "PUBLIC") === typeFilter);
    }

    if (statusFilter !== "all") {
      if (statusFilter === "upcoming") {
        filtered = filtered.filter(event => new Date(event.date) > now);
      } else if (statusFilter === "completed") {
        filtered = filtered.filter(event => new Date(event.date) <= now);
      }
    }

    const upcoming = filtered.filter(e => new Date(e.date) > now)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const completed = filtered.filter(e => new Date(e.date) <= now)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredEvents([...upcoming, ...completed]);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      setLoading(true);
      await API.delete(`/events/${eventId}`);
      await fetchMyEvents();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.response?.data?.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchLocation("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
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

  const eventCategories = [
    "Music", "Technology", "Sports", "Art", "Business", 
    "Education", "Food", "Health", "Travel", "Entertainment", "Other"
  ];

  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const pastEvents = totalEvents - upcomingEvents;

  if (loading && events.length === 0) {
    return <div className="org-loading-spinner">Loading your events...</div>;
  }

  return (
    <div className="org-my-events">
      {error && <div className="org-alert org-alert-error">{error}</div>}

      <div className="org-stats-grid">
        <div className="org-stat-card org-stat-total">
          <div className="org-stat-content">
            <div className="org-stat-icon" aria-hidden="true">📊</div>
            <span className="org-stat-value">{totalEvents}</span>
          </div>
          <span className="org-stat-label">Total Events</span>
        </div>
        <div className="org-stat-card org-stat-upcoming">
          <div className="org-stat-content">
          <div className="org-stat-icon" aria-hidden="true">🚀</div>
            <span className="org-stat-value">{upcomingEvents}</span>
          </div>
            <span className="org-stat-label">Upcoming Events</span>
        </div>
        <div className="org-stat-card org-stat-past">
          <div className="org-stat-content">
          <div className="org-stat-icon" aria-hidden="true">✓</div>
            <span className="org-stat-value">{pastEvents}</span>
          </div>
            <span className="org-stat-label">Completed Events</span>
        </div>
      </div>

      {/* <div className="org-events-header">
        <h2 className="org-section-title">My Events</h2>
      </div> */}

      <div className="org-filters-section">
        <div className="org-filters-row">
          <div className="org-filter-container org-filter-search">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="🔍 Search by event name..."
              className="org-filter-input"
              aria-label="Search events by name"
            />
          </div>

          <div className="org-filter-container">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="org-filter-select"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {eventCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="org-filter-container">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="org-filter-select"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <div className="org-filter-container">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="org-filter-select"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="org-filter-container">
            <button 
              className="org-btn-clear-filters" 
              onClick={handleClearFilters}
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="org-empty-state">
          <div className="org-empty-icon" aria-hidden="true">📅</div>
          <h3>No events found</h3>
          <p>
            {events.length === 0 
              ? "You haven't created any events yet."
              : "No events match your current filters."
            }
          </p>
        </div>
      ) : (
        <div className="org-table-container">
          <table className="org-events-table">
            <thead>
              <tr>
                <th scope="col">Image</th>
                <th scope="col">Title</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Category</th>
                <th scope="col">Type</th>
                <th scope="col">Attendees</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
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
                        alt={`${event.title} event image`}
                        className="org-event-thumbnail"
                      />
                    </td>
                    <td><span className="org-event-title">{event.title}</span></td>
                    <td>{formatDateDDMMYYYY(event.date)}</td>
                    <td>{formatTimeHHMM(event.date)}</td>
                    <td><span className="org-category-badge">{event.category}</span></td>
                    <td>
                      <span className={`org-type-badge org-type-${event.eventType?.toLowerCase()}`}>
                        {event.eventType || 'PUBLIC'}
                      </span>
                    </td>
                    <td className="org-attendees-cell">
                      {(event.currentAttendees || 0)} / {event.maxAttendees || 0}
                    </td>
                    <td>
                      <span className={`org-status-badge org-status-${isUpcoming ? 'upcoming' : 'completed'}`}>
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </td>
                    <td>
                      <div className="org-action-buttons">
                        {isUpcoming ? (
                          <>
                            <button 
                              className="org-action-btn org-btn-edit"
                              onClick={() => onEditEvent(event)}
                              aria-label={`Edit ${event.title}`}
                            >
                              Edit
                            </button>
                            <button 
                              className="org-action-btn org-btn-delete"
                              onClick={() => setDeleteConfirm(event)}
                              aria-label={`Delete ${event.title}`}
                            >
                              Delete
                            </button>
                          </>
                        ) : null}
                        <button 
                          className="org-action-btn org-btn-view"
                          onClick={() => handleViewDetails(event)}
                          aria-label={`View details for ${event.title}`}
                        >
                          View
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

      {deleteConfirm && (
        <div className="org-modal-overlay" onClick={() => setDeleteConfirm(null)} role="dialog" aria-modal="true">
          <div className="org-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Event?</h3>
            <p>Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.</p>
            <div className="org-confirm-actions">
              <button 
                className="org-btn-confirm-delete"
                onClick={() => handleDeleteEvent(deleteConfirm.id)}
                aria-label="Confirm delete"
              >
                Yes, Delete
              </button>
              <button 
                className="org-btn-cancel"
                onClick={() => setDeleteConfirm(null)}
                aria-label="Cancel delete"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {showModal && selectedEvent && (
        <div className="org-modal-overlay" onClick={handleCloseModal} role="dialog" aria-modal="true">
          <div className="org-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="org-modal-close" 
              onClick={handleCloseModal} 
              aria-label="Close modal"
            >
              ×
            </button>
            
            <div className="org-modal-header">
              <img 
                src={selectedEvent.imageUrl || defaultImages[selectedEvent.category] || defaultImages["Other"]} 
                alt={`${selectedEvent.title} event`}
                className="org-modal-image"
              />
              <h2>{selectedEvent.title}</h2>
              <span className="org-category-badge">{selectedEvent.category}</span>
            </div>

            <div className="org-modal-body">
              <div className="org-detail-row">
                <strong>Description</strong>
                <p>{selectedEvent.description}</p>
              </div>

              <div className="org-detail-row">
                <strong>Date & Time</strong>
                <p>{formatDateDDMMYYYY(selectedEvent.date)} at {formatTimeHHMM(selectedEvent.date)}</p>
              </div>

              <div className="org-detail-row">
                <strong>Location</strong>
                <p>{selectedEvent.location || "Not specified"}</p>
              </div>

              <div className="org-detail-row">
                <strong>Event Type</strong>
                <span className={`org-type-badge org-type-${selectedEvent.eventType?.toLowerCase()}`}>
                  {selectedEvent.eventType || 'PUBLIC'}
                </span>
              </div>

              {selectedEvent.eventType === "PRIVATE" && selectedEvent.privateCode && (
                <div className="org-detail-row">
                  <strong>Private Code</strong>
                  <span className="org-private-code">{selectedEvent.privateCode}</span>
                </div>
              )}

              <div className="org-detail-row">
                <strong>Attendees</strong>
                <p>{selectedEvent.currentAttendees || 0} / {selectedEvent.maxAttendees || "Unlimited"}</p>
              </div>

              <div className="org-detail-row">
                <strong>Status</strong>
                <span className={`org-status-badge org-status-${new Date(selectedEvent.date) > new Date() ? 'upcoming' : 'completed'}`}>
                  {new Date(selectedEvent.date) > new Date() ? 'Upcoming' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {showModal && selectedEvent && (
  <div className="org-modal-overlay" onClick={handleCloseModal} role="dialog" aria-modal="true">
    <div className="org-modal-content" onClick={(e) => e.stopPropagation()}>
      <button
        className="org-modal-close"
        onClick={handleCloseModal}
        aria-label="Close modal"
      >
        ×
      </button>

      <div className="org-modal-header">
        <img
          src={selectedEvent.imageUrl || defaultImages[selectedEvent.category] || defaultImages["Other"]}
          alt={`${selectedEvent.title} event`}
          className="org-modal-image"
        />
        <h2>{selectedEvent.title}</h2>
        <span className="org-category-badge">{selectedEvent.category}</span>
      </div>

      <div className="org-modal-body">
        <div className="org-event-info">
          <p><strong>Description:</strong> {selectedEvent.description}</p>
          <p><strong>Date:</strong> {formatDateDDMMYYYY(selectedEvent.date)} at {formatTimeHHMM(selectedEvent.date)}</p>
          <p><strong>Location:</strong> {selectedEvent.location || "Not specified"}</p>
          <p>
            <strong>Type:</strong>
            <span className={`org-type-badge org-type-${selectedEvent.eventType?.toLowerCase()}`}>
              {selectedEvent.eventType || "PUBLIC"}
            </span>
          </p>

          {selectedEvent.eventType === "PRIVATE" && selectedEvent.privateCode && (
            <p>
              <strong>Private Code:</strong>
              <span className="org-private-code">{selectedEvent.privateCode}</span>
            </p>
          )}

          <p>
            <strong>Attendees:</strong> {selectedEvent.currentAttendees || 0} /{" "}
            {selectedEvent.maxAttendees || "Unlimited"}
          </p>

          <p>
            <strong>Status:</strong>
            <span
              className={`org-status-badge org-status-${
                new Date(selectedEvent.date) > new Date() ? "upcoming" : "completed"
              }`}
            >
              {new Date(selectedEvent.date) > new Date() ? "Upcoming" : "Completed"}
            </span>
          </p>
        </div>
      </div>

      <div className="org-modal-footer">
        <button className="org-btn-close" onClick={handleCloseModal}>
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

// ============ CreateEventForm Component ============
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
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      
      if (editingEvent.imageUrl) {
        setImagePreview(editingEvent.imageUrl);
      }
    }
  }, [editingEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (error) {
      setError("");
    }

    if (name === "state") {
      setFormData(prev => ({ ...prev, city: "" }));
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    await handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const formDataImg = new FormData();
      formDataImg.append('file', file);
      
      const response = await API.post('/uploads', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
      console.log("✅ Image uploaded successfully:", response.data.url);
    } catch (err) {
      console.error("❌ Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
      setImagePreview(null);
      setImageFile(null);
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
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
    
    if (formData.date && formData.time) {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      if (eventDateTime <= new Date()) {
        errors.date = "Event date and time must be in the future";
      }
    }
    
    if (formData.maxAttendees && (isNaN(formData.maxAttendees) || parseInt(formData.maxAttendees) <= 0)) {
      errors.maxAttendees = "Max attendees must be a positive number";
    }
    
    if (formData.eventType === "PRIVATE" && !formData.privateCode.trim()) {
      errors.privateCode = "Private code is required for private events";
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill out all required fields correctly");
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
        onSuccess("Event updated successfully!");
      } else {
        await API.post("/events", requestData);
        onSuccess("Event created successfully!");
      }
      
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
    <div className="org-create-event-wrapper">
      <div className="org-form-header">
        <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
        <p className="org-form-subtitle">Fill in the details below to {editingEvent ? "update" : "create"} your event</p>
      </div>
      
      {error && <div className="org-alert org-alert-error" role="alert">{error}</div>}

      <form className="org-event-form" onSubmit={handleSubmit} noValidate>
        <div className="org-form-section">
          <label className="org-form-label">Event Image</label>
          <div className="org-image-upload-area">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageSelect}
              className="org-file-input"
              id="org-image-upload"
              disabled={uploading}
              aria-label="Upload event image"
            />
            <label htmlFor="org-image-upload" className="org-upload-label">
              <ImagePlus size={20}/>{uploading ? "Uploading..." : (imagePreview ? "Change Image" : "Upload Image")}
            </label>
            {imagePreview && (
              <div className="org-image-preview">
                <img src={imagePreview} alt="Event preview" />
              </div>
            )}
            <small className="org-form-hint">
              Upload an image or leave empty to use a default image based on category (Max 5MB)
            </small>
          </div>
        </div>

        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">Category *</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`org-form-input ${fieldErrors.category ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.category}
            >
              <option value="">Select Category</option>
              {eventCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <span className="org-error-message" role="alert">{fieldErrors.category}</span>
            )}
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">Event Name *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event name"
              className={`org-form-input ${fieldErrors.title ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.title}
            />
            {fieldErrors.title && (
              <span className="org-error-message" role="alert">{fieldErrors.title}</span>
            )}
          </div>
        </div>

        <div className="org-form-group">
          <label className="org-form-label">Description *</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Event description"
            rows="3"
            className={`org-form-textarea ${fieldErrors.description ? 'org-error-field' : ''}`}
            aria-required="true"
            aria-invalid={!!fieldErrors.description}
          />
          {fieldErrors.description && (
            <span className="org-error-message" role="alert">{fieldErrors.description}</span>
          )}
        </div>

        <div className="org-form-group">
          <label className="org-form-label">Address *</label>
          <textarea 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter venue details, landmark, or address"
            rows="2"
            className={`org-form-textarea ${fieldErrors.address ? 'org-error-field' : ''}`}
            aria-required="true"
            aria-invalid={!!fieldErrors.address}
          />
          {fieldErrors.address && (
            <span className="org-error-message" role="alert">{fieldErrors.address}</span>
          )}
        </div>

        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="org-form-input"
              aria-label="Select state"
            >
              <option value="">Select State</option>
              {Object.keys(stateCityData).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
              className="org-form-input"
              aria-label="Select city"
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

        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">Date *</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={getTomorrowDate()}
              className={`org-form-input ${fieldErrors.date ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.date}
            />
            {fieldErrors.date && (
              <span className="org-error-message" role="alert">{fieldErrors.date}</span>
            )}
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">Time *</label>
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`org-form-input ${fieldErrors.time ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.time}
            />
            {fieldErrors.time && (
              <span className="org-error-message" role="alert">{fieldErrors.time}</span>
            )}
          </div>
        </div>

        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">Max Attendees</label>
            <input 
              type="number" 
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="1"
              className={`org-form-input ${fieldErrors.maxAttendees ? 'org-error-field' : ''}`}
              aria-label="Maximum number of attendees"
            />
            {fieldErrors.maxAttendees && (
              <span className="org-error-message" role="alert">{fieldErrors.maxAttendees}</span>
            )}
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">Event Type *</label>
            <select 
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="org-form-input"
              aria-label="Select event type"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        {formData.eventType === "PRIVATE" && (
          <div className="org-form-group">
            <label className="org-form-label">Private Code *</label>
            <input 
              type="text" 
              name="privateCode"
              value={formData.privateCode}
              onChange={handleChange}
              placeholder="Enter private access code"
              className={`org-form-input ${fieldErrors.privateCode ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.privateCode}
            />
            {fieldErrors.privateCode && (
              <span className="org-error-message" role="alert">{fieldErrors.privateCode}</span>
            )}
            <small className="org-form-hint">
              Attendees will need this code to register for the event
            </small>
          </div>
        )}

        <div className="org-form-actions">
          <button type="submit" className="org-btn-primary" disabled={loading || uploading}>
            {loading ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
          </button>
          <button 
            type="button" 
            className="org-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ============ Profile Component - 🆕 UPDATED WITH TWO-COLUMN LAYOUT + PASSWORD CHANGE ============
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
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🆕 NEW: Password change state (matching Visitor Dashboard)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/users/profile");
      setProfile(response.data);
      if (response.data.imageUrl) {
        setImagePreview(response.data.imageUrl);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    await handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
      console.log("✅ Profile image uploaded successfully:", response.data.url);
    } catch (err) {
      console.error("❌ Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // 🆕 UPDATED: Handle profile update (without password) + separate password update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      
      // Update profile information
      const profileData = {
        name: profile.name,
        mobileNumber: profile.mobileNumber,
        profileImage: profile.imageUrl
      };

      const response = await API.put("/users/profile", profileData);
      setProfile(response.data);
      if (response.data.imageUrl) {
        setImagePreview(response.data.imageUrl);
      }
      
      // 🆕 NEW: If password fields are filled, update password separately
      if (passwordForm.currentPassword && passwordForm.newPassword) {
        try {
          await API.put("/users/password", {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          });
          
          onSuccess("Profile and password updated successfully!");
          setPasswordForm({ currentPassword: "", newPassword: "" });
        } catch (passErr) {
          console.error("Error updating password:", passErr);
          setError(passErr.response?.data || "Failed to update password");
          setLoading(false);
          return;
        }
      } else {
        onSuccess("Profile updated successfully!");
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.id) {
    return <div className="org-loading-spinner">Loading profile...</div>;
  }

  return (
    <div className="org-profile-container">
      {error && <div className="org-alert org-alert-error" role="alert">{error}</div>}

      {!isEditing ? (
        <div className="org-profile-view-card">
          <div className="org-profile-avatar-wrapper">
            <img 
              src={imagePreview || "/src/assets/EZ-logo1.png"} 
              alt={`${profile.name}'s profile`}
              className="org-profile-avatar"
            />
          </div>
          <div className="org-profile-details">
            <h3 className="org-profile-name">{profile.name}</h3>
            <p className="org-profile-email">{profile.email}</p>
            <span className="org-role-badge">{profile.role}</span>
            <div className="org-profile-meta">
              <div className="org-meta-item">
                <span className="org-meta-label">Mobile:</span>
                <span className="org-meta-value">{profile.mobileNumber || "Not provided"}</span>
              </div>
            </div>
          </div>
          <button className="org-btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="org-profile-edit-form" onSubmit={handleSubmit}>
          {/* 🆕 UPDATED: Form header matching Visitor Dashboard */}
          {/* <div className="org-form-header">
            <h2>Edit Profile</h2>
            <p className="org-form-subtitle">Update your profile information and password</p>
          </div> */}

          {/* 🆕 UPDATED: Profile Image Upload - Full Width */}
          <div className="org-form-group org-full-width">
            <label className="org-form-label">Profile Image</label>
            <div className="org-image-upload-area org-image-upload-area2">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageSelect}
                className="org-file-input"
                id="org-profile-image-upload"
                disabled={uploading}
                aria-label="Upload profile image"
              />
              <label htmlFor="org-profile-image-upload" className="org-upload-label org-upload-label2">
                <ImagePlus size={20}/>{uploading ? "Uploading..." : (imagePreview ? "" : "Upload Image")}
              </label>
              {imagePreview && (
                <div className="org-image-preview org-profile-preview">
                  <img src={imagePreview} alt="Profile preview" />
                </div>
              )}
            </div>
          </div>

          {/* 🆕 UPDATED: Two-Column Layout for Form Fields */}
          <div className="org-form-row">
            <div className="org-form-col">
              <label className="org-form-label">Name *</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="org-form-input"
                required
                aria-required="true"
              />
            </div>
            
            <div className="org-form-col">
              <label className="org-form-label">Email (Cannot be changed)</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="org-form-input org-disabled"
                aria-label="Email address (read-only)"
              />
            </div>
          </div>

          <div className="org-form-row">
            <div className="org-form-col">
              <label className="org-form-label">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={profile.mobileNumber || ""}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="org-form-input"
                aria-label="Mobile number"
              />
            </div>
            
            <div className="org-form-col">
              <label className="org-form-label">Role</label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="org-form-input org-disabled"
                aria-label="User role (read-only)"
              />
            </div>
          </div>

          {/* 🆕 NEW: Password Change Section (matching Visitor Dashboard) */}
          <div className="org-password-section">
            {/* <h3 className="org-section-title">Change Password (Optional)</h3> */}
            <p className="org-section-subtitle">Leave empty to keep your current password</p>
            
            <div className="org-form-row">
              <div className="org-form-col">
                <label className="org-form-label">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                  className="org-form-input"
                  aria-label="Current password"
                />
              </div>
              
              <div className="org-form-col">
                <label className="org-form-label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="Enter new password (min 6 characters)"
                  className="org-form-input"
                  aria-label="New password"
                />
              </div>
            </div>
          </div>
          
          <div className="org-form-actions">  
            <button type="submit" className="org-btn-primary" disabled={loading || uploading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="org-btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setError("");
                setPasswordForm({ currentPassword: "", newPassword: "" });
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
  const [toast, setToast] = useState(null);
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
    setToast({ message, type: 'success' });
    setEditingEvent(null);
    setActivePage("myEvents");
  };

  const handleCancelForm = () => {
    setEditingEvent(null);
    setActivePage("myEvents");
  };

  const handleProfileSuccess = (message) => {
    setToast({ message, type: 'success' });
  };

  const handleProfileCancel = () => {
    setActivePage("myEvents");
  };

  return (
    <div className="org-dashboard">
      <nav className="org-top-navbar">
        <div className="org-navbar-brand">
          <span className="org-brand-icon">
            <img src="/src/assets/EZ-logo1.png" alt="EventZen logo" className="org-logo-img" />
          </span>
          <span className="org-brand-text">EventZen Organizer</span>
        </div>
        <ul className="org-nav-menu" role="menubar">
          <li 
            onClick={() => {
              setActivePage("myEvents");
              setEditingEvent(null);
            }}
            className={activePage === "myEvents" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setActivePage("myEvents")}
          >
            <span className="org-nav-icon" aria-hidden="true">📅</span>
            <span>My Events</span>
          </li>
          <li 
            onClick={() => {
              setActivePage("createEvent");
              setEditingEvent(null);
            }}
            className={activePage === "createEvent" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setActivePage("createEvent")}
          >
            <span className="org-nav-icon" aria-hidden="true">🎟️</span>
            <span>Create Event</span>
          </li>
          <li 
            onClick={() => setActivePage("analytics")}
            className={activePage === "analytics" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setActivePage("analytics")}
          >
            <span className="org-nav-icon" aria-hidden="true">📊</span>
            <span>Analytics</span>
          </li>
          <li 
            onClick={() => setActivePage("profile")}
            className={activePage === "profile" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setActivePage("profile")}
          >
            <span className="org-nav-icon" aria-hidden="true">👤</span>
            <span>Profile</span>
          </li>
          <li 
            onClick={handleLogout} 
            className="org-nav-item org-logout"
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleLogout()}
          >
            <span className="org-nav-icon" aria-hidden="true">🚪</span>
            <span>Logout</span>
          </li>
        </ul>
      </nav>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <main className="org-dashboard-main" role="main">
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

        {activePage === "analytics" && (
          <OrganizerAnalyticsPage />
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