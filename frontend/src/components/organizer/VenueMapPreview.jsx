// ================================================================
// FILE: VenueMapPreview.jsx - FIXED VERSION
// Location: EventZen-frontend/src/components/organizer/VenueMapPreview.jsx
// CHANGE: Line 40 - Correct API endpoint
// ================================================================

import React, { useState, useEffect } from "react";
import { MapPin, Loader, X, Maximize2 } from "lucide-react";
import API from "../../services/api";
import "../../styles/Organizer Dashboard/VenueMapPreview.css";

export default function VenueMapPreview({ venueId, onClose }) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (venueId) {
      fetchVenueDetails();
    }
  }, [venueId]);

  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: Correct endpoint
      const response = await API.get(`/organizer/venues/${venueId}`);
      setVenue(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching venue:", err);
      setError("Failed to load venue details");
    } finally {
      setLoading(false);
    }
  };

  if (!venueId) return null;

  return (
    <div
      className={`venue-map-modal-overlay ${fullscreen ? "fullscreen" : ""}`}
      onClick={onClose}
    >
      <div
        className={`venue-map-modal ${fullscreen ? "fullscreen" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="map-header">
          <div className="header-content">
            <MapPin size={20} />
            <h3>{loading ? "Loading..." : venue?.name || "Venue Map"}</h3>
          </div>
          <div className="header-actions">
            <button
              className="fullscreen-btn"
              onClick={() => setFullscreen(!fullscreen)}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <Maximize2 size={18} />
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="map-content">
          {loading ? (
            <div className="map-loading">
              <Loader size={32} className="spinning" />
              <p>Loading venue map...</p>
            </div>
          ) : error ? (
            <div className="map-error">
              <p>{error}</p>
            </div>
          ) : venue ? (
            <div className="map-details">
              {/* Venue Image */}
              {venue.imageUrl && (
                <div className="venue-image-container">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="venue-image"
                  />
                </div>
              )}

              {/* Venue Info */}
              <div className="venue-info-grid">
                <div className="info-item">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{venue.location}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Capacity:</span>
                  <span className="info-value">{venue.capacity} people</span>
                </div>

                {venue.description && (
                  <div className="info-item full-width">
                    <span className="info-label">Description:</span>
                    <p className="info-value">{venue.description}</p>
                  </div>
                )}

                {venue.amenities && (
                  <div className="info-item full-width">
                    <span className="info-label">Amenities:</span>
                    <div className="amenities-list">
                      {venue.amenities.split(",").map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">
                          {amenity.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Map Data (if available)
              {venue.mapData && (
                <div className="map-data-container">
                  <h4>Venue Layout</h4>
                  <div className="map-placeholder">
                    <MapPin size={48} />
                    <p>Map visualization coming soon</p>
                    <small>Map data: {venue.mapData}</small>
                  </div>
                </div>
              )} */}
            </div>
          ) : (
            <div className="map-empty">
              <MapPin size={48} />
              <p>No venue data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}