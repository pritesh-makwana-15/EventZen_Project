// src/components/CreateEventForm.jsx
import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function CreateEventForm({ editingEvent, onCancel, onSuccess }) {
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
  const [imageFile, setImageFile] = useState(null);

  // State and city data
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

  // Load editing event data
  useEffect(() => {
    if (editingEvent) {
      const eventDate = new Date(editingEvent.date);
      
      // Extract date and time components
      const dateStr = eventDate.toISOString().slice(0, 10); // YYYY-MM-DD
      const timeStr = eventDate.toTimeString().slice(0, 5); // HH:MM

      // Parse location to extract state/city/address
      const locationParts = editingEvent.location.split(", ");
      let state = "", city = "", address = editingEvent.location;
      
      if (locationParts.length >= 3) {
        state = locationParts[locationParts.length - 1];
        city = locationParts[locationParts.length - 2];
        address = locationParts.slice(0, -2).join(", ");
      } else if (locationParts.length === 2) {
        city = locationParts[locationParts.length - 1];
        address = locationParts[0];
      }

      setFormData({
        title: editingEvent.title,
        description: editingEvent.description,
        date: dateStr,
        time: timeStr,
        state: state,
        city: city,
        address: address,
        category: editingEvent.category,
        imageUrl: editingEvent.imageUrl || "",
        maxAttendees: editingEvent.maxAttendees || "",
        eventType: editingEvent.eventType || "PUBLIC",
        privateCode: editingEvent.privateCode || ""
      });
    }
  }, [editingEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Reset city when state changes
    if (name === "state") {
      setFormData(prev => ({ ...prev, city: "" }));
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Validate file
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
      
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push("Event title is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.date) errors.push("Date is required");
    if (!formData.time) errors.push("Time is required");
    if (!formData.address.trim()) errors.push("Address is required");
    if (!formData.category) errors.push("Category is required");
    
    // Check if date/time is in the future
    const eventDateTime = new Date(`${formData.date}T${formData.time}`);
    if (eventDateTime <= new Date()) {
      errors.push("Event date and time must be in the future");
    }
    
    // Validate max attendees
    if (formData.maxAttendees && (isNaN(formData.maxAttendees) || parseInt(formData.maxAttendees) <= 0)) {
      errors.push("Max attendees must be a positive number");
    }
    
    // Validate private code for private events
    if (formData.eventType === "PRIVATE" && !formData.privateCode.trim()) {
      errors.push("Private code is required for private events");
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Prepare request data - convert to backend expected format
      const requestData = {
        title: formData.title,
        description: formData.description,
        date: formData.date, // ISO date format (YYYY-MM-DD)
        time: formData.time, // ISO time format (HH:MM)
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
      
      // Handle validation errors from backend
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
    <div className="create-event">
      <h3>{editingEvent ? "Edit Event" : "Create New Event"}</h3>
      
      {error && <div className="alert error">{error}</div>}

      <form className="event-form" onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="form-group">
          <label>Event Image</label>
          <div className="image-upload-section">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImageFile(file);
                handleImageUpload(file);
              }}
              className="file-input"
            />
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

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {eventCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Event Name *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event name"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div className="form-group">
          <label>Address *</label>
          <textarea 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter venue details, landmark, or address"
            required
          />
        </div>

        {/* State and City */}
        <div className="form-row">
          <div className="form-group">
            <label>State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
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
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
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

        {/* Date and Time */}
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={getTomorrowDate()}
              required
            />
          </div>
          <div className="form-group">
            <label>Time *</label>
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Max Attendees */}
        <div className="form-row">
          <div className="form-group">
            <label>Max Attendees</label>
            <input 
              type="number" 
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="1"
            />
          </div>
        </div>

        {/* Event Type */}
        <div className="form-event-type">
          <div className="form-row">
            <div className="form-group">
              <label>Event Type *</label>
              <select 
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                required
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          {/* Private Code */}
          {formData.eventType === "PRIVATE" && (
            <div className="form-group">
              <label>Private Code *</label>
              <input 
                type="text" 
                name="privateCode"
                value={formData.privateCode}
                onChange={handleChange}
                placeholder="Enter private access code"
                required
              />
              <small className="form-hint">
                Attendees will need this code to register for the event
              </small>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description *</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Event description"
            rows="4"
            required
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}