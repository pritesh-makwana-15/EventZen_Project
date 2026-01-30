// ================================================================
// FILE: src/pages/admin/VenueList.jsx
// Admin Venue List with CRUD operations
// ================================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, Plus, Edit, Trash2, Eye, AlertCircle, 
  Building2, Users, Loader, Search 
} from "lucide-react";
import {
  getAllVenues,
  deleteVenue,
  getVenueConflicts,
} from "../../services/adminService";
// import "../../styles/Admin Dashboard/AdminVenues.css";
import "../../styles/Admin Dashborad/AdminVenues.css";

export default function VenueList() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  
  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterCity, venues]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const data = await getAllVenues();
      setVenues(data);
      setFilteredVenues(data);
    } catch (err) {
      setError("Failed to load venues");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...venues];

    if (searchTerm) {
      filtered = filtered.filter((v) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCity) {
      filtered = filtered.filter((v) =>
        v.city?.toLowerCase() === filterCity.toLowerCase()
      );
    }

    setFilteredVenues(filtered);
  };

  const handleDelete = async () => {
    try {
      await deleteVenue(venueToDelete.id);
      setSuccess("Venue deleted successfully!");
      setShowDeleteModal(false);
      loadVenues();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Failed to delete venue");
      setShowDeleteModal(false);
    }
  };

  const openDeleteModal = (venue) => {
    setVenueToDelete(venue);
    setShowDeleteModal(true);
  };

  const viewConflicts = (venueId) => {
    navigate(`/admin/venues/${venueId}/conflicts`);
  };

  const uniqueCities = [...new Set(venues.map((v) => v.city).filter(Boolean))];

  if (loading) {
    return (
      <div className="venue-loading">
        <Loader className="spinner" size={48} />
        <p>Loading venues...</p>
      </div>
    );
  }

  return (
    <div className="venue-list-container">
      <div className="venue-header">
        <div className="venue-header-left">
          <Building2 size={32} className="header-icon" />
          <div>
            <h1>Venue Management</h1>
            <p>{filteredVenues.length} venues found</p>
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/admin/venues/add")}
        >
          <Plus size={20} /> Add New Venue
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="venue-filters">
        <div className="filter-group">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by venue name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <MapPin size={18} />
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          >
            <option value="">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Venue Grid */}
      <div className="venue-grid">
        {filteredVenues.map((venue) => (
          <div key={venue.id} className="venue-card">
            <div className="venue-card-header">
              <img
                src={venue.imageUrl || "https://via.placeholder.com/400x200/667eea/ffffff?text=Venue"}
                alt={venue.name}
                className="venue-image"
              />
              {!venue.isActive && (
                <span className="venue-badge inactive">Inactive</span>
              )}
            </div>

            <div className="venue-card-body">
              <h3>{venue.name}</h3>
              
              <div className="venue-info">
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{venue.city}, {venue.state}</span>
                </div>
                
                <div className="info-item">
                  <Users size={16} />
                  <span>Capacity: {venue.capacity}</span>
                </div>
                
                <div className="info-item">
                  <Building2 size={16} />
                  <span>{venue.totalEvents || 0} Events</span>
                </div>
              </div>

              <div className="venue-actions">
                <button
                  className="btn-icon btn-view"
                  onClick={() => viewConflicts(venue.id)}
                  title="View Conflicts"
                >
                  <Eye size={18} />
                </button>
                
                <button
                  className="btn-icon btn-edit"
                  onClick={() => navigate(`/admin/venues/edit/${venue.id}`)}
                  title="Edit Venue"
                >
                  <Edit size={18} />
                </button>
                
                <button
                  className="btn-icon btn-delete"
                  onClick={() => openDeleteModal(venue)}
                  title="Delete Venue"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="no-venues">
          <Building2 size={64} />
          <p>No venues found</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/admin/venues/add")}
          >
            Create Your First Venue
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Venue</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{venueToDelete?.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}