
// ================================================================
// FILE 1: src/pages/admin/AddVenue.jsx
// ================================================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Save, X, Upload } from "lucide-react";
import { createVenue } from "../../services/adminService";
// import "../../styles/Admin Dashboard/AdminVenues.css";
import "../../styles/Admin Dashborad/AdminVenues.css";

export default function AddVenue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    capacity: "",
    imageUrl: "",
    mapData: "",
    unavailableDates: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const venueData = {
        ...formData,
        capacity: parseInt(formData.capacity),
      };

      await createVenue(venueData);
      navigate("/admin/venues");
    } catch (err) {
      setError(err.response?.data || "Failed to create venue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="venue-form-container">
      <div className="venue-form-header">
        <div className="form-header-icon">
          <Building2 size={28} />
        </div>
        <h2>Add New Venue</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="venue-form">
        <div className="form-row">
          <div className="form-group">
            <label>Venue Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter venue name"
            />
          </div>

          <div className="form-group">
            <label>Capacity *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              placeholder="Maximum capacity"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label>Map Data (JSON - Optional)</label>
          <textarea
            name="mapData"
            value={formData.mapData}
            onChange={handleChange}
            placeholder='{"seats": [...], "sections": [...]}'
            rows="4"
          />
          <small>Enter venue map data in JSON format</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/venues")}
          >
            <X size={18} /> Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : <><Save size={18} /> Create Venue</>}
          </button>
        </div>
      </form>
    </div>
  );
}
