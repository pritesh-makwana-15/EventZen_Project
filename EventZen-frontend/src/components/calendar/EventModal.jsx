// ================================================================
// FILE: D:\EventZen-frontend\src\components\calendar\EventModal.jsx
// PART 1/2 - Event Edit Modal Component
// ================================================================

import React, { useState, useEffect } from "react";
import { X, Save, Loader, Calendar, Clock, MapPin, Users, Tag } from "lucide-react";
import { updateEventAdmin } from "../../services/adminService";
import { formatDateDDMMYYYY, formatTimeAMPM } from "../../utils/dateTime";

const EventModal = ({ event, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    address: "",
    city: "",
    state: "",
    category: "",
    maxAttendees: "",
    eventType: "PUBLIC",
    privateCode: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        startDate: event.startDate || "",
        startTime: event.startTime || "",
        endDate: event.endDate || "",
        endTime: event.endTime || "",
        address: event.address || "",
        city: event.city || "",
        state: event.state || "",
        category: event.category || "",
        maxAttendees: event.maxAttendees || "",
        eventType: event.eventType || "PUBLIC",
        privateCode: event.privateCode || "",
        imageUrl: event.imageUrl || "",
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate dates
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (end <= start) {
        setError("End date/time must be after start date/time");
        setLoading(false);
        return;
      }

      await updateEventAdmin(event.id, formData);
      setSuccess("Event updated successfully!");
      setTimeout(() => {
        onUpdate();
      }, 1500);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.response?.data?.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Technology", "Business", "Music", "Health", "Food",
    "Art", "Community", "Entertainment", "Education", "Sports", "Other"
  ];

  // CONTINUED IN PART 2...
  // ================================================================
// FILE: D:\EventZen-frontend\src\components\calendar\EventModal.jsx
// PART 2/2 - Render Function
// ================================================================

// ... CONTINUED FROM PART 1

  return (
    <div className="cal-modal-overlay" onClick={onClose}>
      <div className="cal-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="cal-modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        <div className="cal-modal-header">
          <h2>{isEditing ? "Edit Event" : "Event Details"}</h2>
        </div>

        {error && <div className="cal-alert cal-alert-error">{error}</div>}
        {success && <div className="cal-alert cal-alert-success">{success}</div>}

        {!isEditing ? (
          // VIEW MODE
          <div className="cal-modal-body">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="cal-event-image" />
            )}
            
            <div className="cal-event-details">
              <h3>{event.title}</h3>
              
              <div className="cal-detail-row">
                <Calendar size={18} />
                <span><strong>Start:</strong> {formatDateDDMMYYYY(event.startDate)} at {formatTimeAMPM(event.startTime)}</span>
              </div>
              
              <div className="cal-detail-row">
                <Calendar size={18} />
                <span><strong>End:</strong> {formatDateDDMMYYYY(event.endDate)} at {formatTimeAMPM(event.endTime)}</span>
              </div>
              
              <div className="cal-detail-row">
                <MapPin size={18} />
                <span>{event.address}, {event.city}, {event.state}</span>
              </div>
              
              <div className="cal-detail-row">
                <Tag size={18} />
                <span>{event.category}</span>
              </div>
              
              <div className="cal-detail-row">
                <Users size={18} />
                <span>{event.organizerName}</span>
              </div>
              
              {event.maxAttendees && (
                <div className="cal-detail-row">
                  <Users size={18} />
                  <span>Capacity: {event.currentAttendees || 0} / {event.maxAttendees}</span>
                </div>
              )}
              
              <div className="cal-detail-row">
                <span className={`cal-type-badge ${event.eventType?.toLowerCase()}`}>
                  {event.eventType === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                </span>
              </div>
              
              {event.description && (
                <div className="cal-description">
                  <h4>Description</h4>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // EDIT MODE
          <form onSubmit={handleSubmit} className="cal-modal-form">
            <div className="cal-form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="cal-form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="cal-form-row">
              <div className="cal-form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cal-form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="cal-form-row">
              <div className="cal-form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cal-form-group">
                <label>End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="cal-form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="cal-form-row">
              <div className="cal-form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="cal-form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="cal-form-row">
              <div className="cal-form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="cal-form-group">
                <label>Max Attendees</label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>

            <div className="cal-form-row">
              <div className="cal-form-group">
                <label>Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
              {formData.eventType === "PRIVATE" && (
                <div className="cal-form-group">
                  <label>Private Code</label>
                  <input
                    type="text"
                    name="privateCode"
                    value={formData.privateCode}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div className="cal-form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>
          </form>
        )}

        <div className="cal-modal-footer">
          {!isEditing ? (
            <>
              <button className="cal-btn cal-btn-secondary" onClick={onClose}>
                Close
              </button>
              <button className="cal-btn cal-btn-primary" onClick={() => setIsEditing(true)}>
                Edit Event
              </button>
            </>
          ) : (
            <>
              <button 
                className="cal-btn cal-btn-secondary" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="cal-btn cal-btn-primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="cal-spinner-small" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;