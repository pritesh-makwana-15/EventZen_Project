// ================================================================
// FILE: src/components/Visitor dashboard/VenueMapViewer.jsx
// PURPOSE: Display venue layout/map
// ================================================================

import React, { useState, useEffect } from "react";
import { MapPin, X, Loader, Map } from "lucide-react";
import { getVenueDetails } from "../../services/visitorService";

export default function VenueMapViewer({ venueId, onClose }) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (venueId) {
      loadVenueDetails();
    }
  }, [venueId]);

  const loadVenueDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getVenueDetails(venueId);
      setVenue(data);
    } catch (err) {
      console.error("Error loading venue:", err);
      setError("Failed to load venue details");
    } finally {
      setLoading(false);
    }
  };

  const renderMapData = () => {
    if (!venue.mapData) {
      return (
        <div className="vis-no-map">
          <Map size={48} color="#ccc" />
          <p>No map data available for this venue</p>
        </div>
      );
    }

    try {
      // Parse map data (JSON string)
      const mapInfo = typeof venue.mapData === 'string' 
        ? JSON.parse(venue.mapData) 
        : venue.mapData;

      // Display map information
      return (
        <div className="vis-map-details">
          {mapInfo.parking && (
            <div className="vis-map-section">
              <h4>🅿️ Parking</h4>
              <p>{mapInfo.parking}</p>
            </div>
          )}
          
          {mapInfo.entrances && (
            <div className="vis-map-section">
              <h4>🚪 Entry Gates</h4>
              <ul>
                {Array.isArray(mapInfo.entrances) 
                  ? mapInfo.entrances.map((gate, idx) => (
                      <li key={idx}>{gate}</li>
                    ))
                  : <li>{mapInfo.entrances}</li>
                }
              </ul>
            </div>
          )}
          
          {mapInfo.halls && (
            <div className="vis-map-section">
              <h4>🏛️ Halls</h4>
              <ul>
                {Array.isArray(mapInfo.halls) 
                  ? mapInfo.halls.map((hall, idx) => (
                      <li key={idx}>{hall}</li>
                    ))
                  : <li>{mapInfo.halls}</li>
                }
              </ul>
            </div>
          )}
          
          {mapInfo.seating && (
            <div className="vis-map-section">
              <h4>💺 Seating Zones</h4>
              <ul>
                {Array.isArray(mapInfo.seating) 
                  ? mapInfo.seating.map((zone, idx) => (
                      <li key={idx}>{zone}</li>
                    ))
                  : <li>{mapInfo.seating}</li>
                }
              </ul>
            </div>
          )}

          {mapInfo.facilities && (
            <div className="vis-map-section">
              <h4>🏥 Facilities</h4>
              <ul>
                {Array.isArray(mapInfo.facilities) 
                  ? mapInfo.facilities.map((facility, idx) => (
                      <li key={idx}>{facility}</li>
                    ))
                  : <li>{mapInfo.facilities}</li>
                }
              </ul>
            </div>
          )}

          {mapInfo.notes && (
            <div className="vis-map-section">
              <h4>ℹ️ Additional Information</h4>
              <p>{mapInfo.notes}</p>
            </div>
          )}
        </div>
      );
    } catch (err) {
      console.error("Error parsing map data:", err);
      return (
        <div className="vis-map-error">
          <p>Unable to display map information</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="vis-venue-map-modal">
        <div className="vis-venue-map-content">
          <div className="vis-loading-center">
            <Loader size={40} className="vis-spinner" />
            <p>Loading venue details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vis-venue-map-modal">
        <div className="vis-venue-map-content">
          <div className="vis-venue-map-header">
            <h2>Venue Map</h2>
            {onClose && (
              <button onClick={onClose} className="vis-venue-close">
                <X size={24} />
              </button>
            )}
          </div>
          <div className="vis-map-error">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vis-venue-map-modal">
      <div className="vis-venue-map-content">
        <div className="vis-venue-map-header">
          <div>
            <h2>{venue.name}</h2>
            <p className="vis-venue-address">
              <MapPin size={16} />
              {venue.address}, {venue.city}, {venue.state}
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="vis-venue-close">
              <X size={24} />
            </button>
          )}
        </div>

        <div className="vis-venue-map-body">
          {venue.imageUrl && (
            <div className="vis-venue-image-container">
              <img src={venue.imageUrl} alt={venue.name} />
            </div>
          )}

          {venue.description && (
            <div className="vis-venue-description">
              <h3>About</h3>
              <p>{venue.description}</p>
            </div>
          )}

          {venue.amenities && (
            <div className="vis-venue-amenities">
              <h3>Amenities</h3>
              <p>{venue.amenities}</p>
            </div>
          )}

          {venue.capacity && (
            <div className="vis-venue-capacity">
              <h3>Capacity</h3>
              <p>{venue.capacity} people</p>
            </div>
          )}

          <div className="vis-venue-map-section">
            <h3>Venue Layout</h3>
            {renderMapData()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .vis-venue-map-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .vis-venue-map-content {
          background: white;
          border-radius: 12px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .vis-venue-map-header {
          padding: 20px;
          border-bottom: 2px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .vis-venue-map-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #333;
        }

        .vis-venue-address {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .vis-venue-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #666;
          transition: all 0.2s;
        }

        .vis-venue-close:hover {
          color: #333;
          transform: rotate(90deg);
        }

        .vis-venue-map-body {
          padding: 20px;
        }

        .vis-venue-image-container {
          margin-bottom: 20px;
          border-radius: 8px;
          overflow: hidden;
        }

        .vis-venue-image-container img {
          width: 100%;
          height: 300px;
          object-fit: cover;
        }

        .vis-venue-description,
        .vis-venue-amenities,
        .vis-venue-capacity,
        .vis-venue-map-section {
          margin-bottom: 20px;
        }

        .vis-venue-map-body h3 {
          font-size: 18px;
          color: #333;
          margin: 0 0 12px 0;
          font-weight: 600;
        }

        .vis-venue-description p,
        .vis-venue-amenities p,
        .vis-venue-capacity p {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .vis-map-details {
          display: grid;
          gap: 16px;
        }

        .vis-map-section {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .vis-map-section h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #333;
        }

        .vis-map-section p {
          margin: 0;
          color: #666;
          line-height: 1.5;
        }

        .vis-map-section ul {
          margin: 0;
          padding-left: 20px;
          color: #666;
        }

        .vis-map-section li {
          margin-bottom: 4px;
        }

        .vis-no-map,
        .vis-map-error {
          text-align: center;
          padding: 40px;
          color: #999;
        }

        .vis-loading-center {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .vis-loading-center p {
          margin-top: 16px;
        }

        @media (max-width: 767px) {
          .vis-venue-map-content {
            max-width: 95%;
            max-height: 95vh;
          }

          .vis-venue-map-header h2 {
            font-size: 20px;
          }

          .vis-venue-image-container img {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}