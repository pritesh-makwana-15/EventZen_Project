// ================================================================
// FILE 3: VenueSelector.jsx
// Location: D:\EventZen-frontend\src\components\organizer\VenueSelector.jsx
// ================================================================
import React, { useState, useEffect } from "react";
import { MapPin, AlertCircle, CheckCircle, Loader, X } from "lucide-react";
import API from "../../services/api";
import "../../styles/Organizer Dashboard/VenueSelector.css";

export default function VenueSelector({
  selectedVenueId,
  onVenueSelect,
  startDate,
  endDate,
  excludeEventId = null,
  onLocationUpdate,
}) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenueId && startDate && endDate) {
      checkAvailability();
    } else {
      setAvailability(null);
    }
  }, [selectedVenueId, startDate, endDate]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await API.get("/organizer/venues");
      setVenues(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching venues:", err);
      setError("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      setChecking(true);
      const params = {
        startDate: startDate,
        endDate: endDate,
      };
      
      if (excludeEventId) {
        params.excludeEventId = excludeEventId;
      }

      const response = await API.get(
        `/organizer/venues/${selectedVenueId}/availability`,
        { params }
      );

      setAvailability(response.data);
      setError("");
    } catch (err) {
      console.error("Error checking availability:", err);
      setError("Failed to check venue availability");
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  };

  const handleVenueChange = async (e) => {
    const venueId = e.target.value;
    
    if (!venueId) {
      onVenueSelect(null);
      setAvailability(null);
      if (onLocationUpdate) {
        onLocationUpdate({ address: "", capacity: "" });
      }
      return;
    }

    try {
      const response = await API.get(`/organizer/venues/${venueId}`);
      const venue = response.data;

      onVenueSelect(venueId);

      if (onLocationUpdate) {
        onLocationUpdate({
          address: venue.location || "",
          capacity: venue.capacity || "",
        });
      }
    } catch (err) {
      console.error("Error fetching venue details:", err);
      setError("Failed to load venue details");
    }
  };

  const getAvailabilityMessage = () => {
    if (!availability) return null;

    if (availability.available) {
      return (
        <div className="availability-message available">
          <CheckCircle size={16} />
          <span>✓ Venue is available</span>
        </div>
      );
    } else {
      return (
        <div className="availability-message unavailable">
          <AlertCircle size={16} />
          <div>
            <strong>⚠ Venue not available</strong>
            {availability.conflicts && availability.conflicts.length > 0 && (
              <div className="conflicts-list">
                <p>Conflicting events:</p>
                <ul>
                  {availability.conflicts.map((conflict, idx) => (
                    <li key={idx}>
                      <strong>{conflict.eventTitle}</strong>
                      <br />
                      {conflict.startDate} to {conflict.endDate}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="venue-selector-container">
      <label className="venue-label">
        Select Venue *
        {checking && <Loader size={14} className="checking-spinner" />}
      </label>

      {error && (
        <div className="venue-error" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <select
        value={selectedVenueId || ""}
        onChange={handleVenueChange}
        className="venue-select"
        disabled={loading}
      >
        <option value="">-- Select a venue --</option>
        {venues.map((venue) => (
          <option key={venue.id} value={venue.id}>
            {venue.name} (Capacity: {venue.capacity})
          </option>
        ))}
      </select>

      {selectedVenueId && (
        <div className="venue-info">
          <MapPin size={16} />
          <span>
            {venues.find((v) => v.id === parseInt(selectedVenueId))?.location || "Location"}
          </span>
        </div>
      )}

      {checking && (
        <div className="checking-message">
          <Loader size={16} className="spinning" />
          Checking availability...
        </div>
      )}

      {!checking && getAvailabilityMessage()}

      {availability && !availability.available && (
        <p className="venue-warning">
          ⚠ You cannot proceed with this venue for the selected dates.
        </p>
      )}
    </div>
  );
}