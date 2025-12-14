// ================================================================
// FILE 1: src/pages/admin/VenueConflicts.jsx
// ================================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, Calendar, Clock, ArrowLeft, Loader } from "lucide-react";
import { getVenueConflicts, getVenueById } from "../../services/adminService";
import { formatDateDDMMYYYY, formatTimeAMPM } from "../../utils/dateTime";
// import "../../styles/Admin Dashboard/Conflicts.css";
import "../../styles/Admin Dashborad/Conflicts.css";

export default function VenueConflicts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [venueData, conflictsData] = await Promise.all([
        getVenueById(id),
        getVenueConflicts(id),
      ]);
      setVenue(venueData);
      setConflicts(conflictsData);
    } catch (err) {
      console.error("Error loading conflicts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="conflicts-loading">
        <Loader className="spinner" size={48} />
        <p>Loading conflicts...</p>
      </div>
    );
  }

  return (
    <div className="conflicts-container">
      <div className="conflicts-header">
        <button className="btn-back" onClick={() => navigate("/admin/venues")}>
          <ArrowLeft size={20} /> Back to Venues
        </button>
        
        <div className="header-info">
          <h1>Booking Conflicts</h1>
          <p>{venue?.name}</p>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="no-conflicts">
          <AlertTriangle size={64} className="icon-success" />
          <h2>No Conflicts Found</h2>
          <p>This venue has no overlapping bookings.</p>
        </div>
      ) : (
        <div className="conflicts-list">
          <div className="conflicts-summary">
            <AlertTriangle size={24} />
            <span>{conflicts.length} conflict(s) detected</span>
          </div>

          {conflicts.map((conflict, idx) => (
            <div key={idx} className="conflict-card">
              <div className="conflict-header">
                <AlertTriangle size={20} className="icon-warning" />
                <h3>Conflict #{idx + 1}</h3>
              </div>

              <div className="conflict-events">
                {/* Event 1 */}
                <div className="conflict-event event-1">
                  <div className="event-badge">Event 1</div>
                  <h4>{conflict.eventTitle1}</h4>
                  <div className="event-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>
                        {formatDateDDMMYYYY(conflict.startDate1)} - {formatDateDDMMYYYY(conflict.endDate1)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>
                        {formatTimeAMPM(conflict.startTime1)} - {formatTimeAMPM(conflict.endTime1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="conflict-vs">VS</div>

                {/* Event 2 */}
                <div className="conflict-event event-2">
                  <div className="event-badge">Event 2</div>
                  <h4>{conflict.eventTitle2}</h4>
                  <div className="event-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>
                        {formatDateDDMMYYYY(conflict.startDate2)} - {formatDateDDMMYYYY(conflict.endDate2)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>
                        {formatTimeAMPM(conflict.startTime2)} - {formatTimeAMPM(conflict.endTime2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="conflict-actions">
                <button
                  className="btn-view"
                  onClick={() => navigate(`/admin/events/${conflict.eventId1}`)}
                >
                  View Event 1
                </button>
                <button
                  className="btn-view"
                  onClick={() => navigate(`/admin/events/${conflict.eventId2}`)}
                >
                  View Event 2
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}