// ================================================================
// FILE 2: src/pages/admin/EditVenue.jsx
// ================================================================

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, Save, X, Loader } from "lucide-react";
import { getVenueById, updateVenue } from "../../services/adminService";
import "../../styles/Admin Dashborad/AdminVenues.css";

export default function EditVenue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    capacity: "",
    imageUrl: "",
    mapData: "",
    isActive: true,
  });

  useEffect(() => {
    loadVenue();
  }, [id]);

  const loadVenue = async () => {
    try {
      setFetching(true);
      const venue = await getVenueById(id);
      setFormData({
        name: venue.name || "",
        address: venue.address || "",
        city: venue.city || "",
        state: venue.state || "",
        capacity: venue.capacity?.toString() || "",
        imageUrl: venue.imageUrl || "",
        mapData: venue.mapData || "",
        isActive: venue.isActive ?? true,
      });
    } catch (err) {
      setError("Failed to load venue");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

      await updateVenue(id, venueData);
      navigate("/admin/venues");
    } catch (err) {
      setError(err.response?.data || "Failed to update venue");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="venue-loading">
        <Loader className="spinner" size={48} />
        <p>Loading venue...</p>
      </div>
    );
  }

  return (
    <div className="venue-form-container">
      <div className="venue-form-header">
        <div className="form-header-icon">
          <Building2 size={28} />
        </div>
        <h2>Edit Venue</h2>
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
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
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
          />
        </div>

        <div className="form-group">
          <label>Map Data (JSON)</label>
          <textarea
            name="mapData"
            value={formData.mapData}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Active Venue</span>
          </label>
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
            {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}