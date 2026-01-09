// ================================================================
// FILE: PendingEvents.jsx
// Location: src/pages/admin/PendingEvents.jsx
// Purpose: Admin page for approving/rejecting pending events
// ================================================================

import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  X,
  Loader,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getApprovalStats,
} from "../../services/adminService";
import { formatDateDDMMYYYY, formatTimeAMPM } from "../../utils/dateTime";
import "../../styles/Admin Dashborad/PendingEvents.css";

export default function PendingEvents() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadPendingEvents();
    loadStats();
  }, []);

  const loadPendingEvents = async () => {
    try {
      setLoading(true);
      const data = await getPendingEvents();
      setPendingEvents(data);
      setError("");
    } catch (err) {
      console.error("Error loading pending events:", err);
      setError("Failed to load pending events");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getApprovalStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleApprove = async (eventId) => {
    if (!window.confirm("Are you sure you want to approve this event?")) {
      return;
    }

    try {
      setActionLoading(eventId);
      await approveEvent(eventId);
      setSuccess("Event approved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await loadPendingEvents();
      await loadStats();
    } catch (err) {
      console.error("Error approving event:", err);
      setError(err.response?.data?.message || "Failed to approve event");
      setTimeout(() => setError(""), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (event) => {
    setSelectedEvent(event);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setActionLoading(selectedEvent.id);
      await rejectEvent(selectedEvent.id, rejectionReason);
      setSuccess("Event rejected successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowRejectModal(false);
      setSelectedEvent(null);
      setRejectionReason("");
      await loadPendingEvents();
      await loadStats();
    } catch (err) {
      console.error("Error rejecting event:", err);
      setError(err.response?.data?.message || "Failed to reject event");
      setTimeout(() => setError(""), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const defaultImages = {
    Technology: "https://via.placeholder.com/400x200/667eea/ffffff?text=Technology",
    Business: "https://via.placeholder.com/400x200/f59e0b/ffffff?text=Business",
    Music: "https://via.placeholder.com/400x200/ec4899/ffffff?text=Music",
    Health: "https://via.placeholder.com/400x200/10b981/ffffff?text=Health",
    Food: "https://via.placeholder.com/400x200/f97316/ffffff?text=Food",
    Art: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Art",
    Community: "https://via.placeholder.com/400x200/3b82f6/ffffff?text=Community",
    Entertainment: "https://via.placeholder.com/400x200/ef4444/ffffff?text=Entertainment",
    Education: "https://via.placeholder.com/400x200/06b6d4/ffffff?text=Education",
    Sports: "https://via.placeholder.com/400x200/84cc16/ffffff?text=Sports",
    Other: "https://via.placeholder.com/400x200/6b7280/ffffff?text=Event",
  };

  if (loading) {
    return (
      <div className="pending-events-loading">
        <Loader className="spinner" size={48} />
        <p>Loading pending events...</p>
      </div>
    );
  }

  return (
    <div className="pending-events-container">
      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError("")} className="alert-close">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess("")} className="alert-close">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      {/* <div className="pending-events-header">
        <div>
          <h1>Pending Event Approvals</h1>
          <p className="subtitle">Review and approve/reject events submitted by organizers</p>
        </div>
      </div> */}

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card pending">
          <Clock size={28} />
          <div>
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card approved">
          <CheckCircle size={28} />
          <div>
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card rejected">
          <XCircle size={28} />
          <div>
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Events List */}
      {pendingEvents.length === 0 ? (
        <div className="no-events">
          <CheckCircle size={64} />
          <h2>No Pending Events</h2>
          <p>All events have been reviewed!</p>
        </div>
      ) : (
        <div className="events-grid">
          {pendingEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-image">
                <img
                  src={event.imageUrl || defaultImages[event.category] || defaultImages.Other}
                  alt={event.title}
                />
                <span className="event-badge pending">
                  <Clock size={14} />
                  Pending Review
                </span>
              </div>

              <div className="event-content">
                <h3>{event.title}</h3>
                <span className="event-category">{event.category}</span>

                <div className="event-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{formatDateDDMMYYYY(event.startDate)}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{formatTimeAMPM(event.startTime)}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{event.location || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <User size={16} />
                    <span>{event.organizerName}</span>
                  </div>
                </div>

                <div className="event-actions">
                  <button
                    className="btn btn-view"
                    onClick={() => handleViewDetails(event)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    className="btn btn-approve"
                    onClick={() => handleApprove(event.id)}
                    disabled={actionLoading === event.id}
                  >
                    {actionLoading === event.id ? (
                      <Loader className="spinner-small" size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Approve
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleRejectClick(event)}
                    disabled={actionLoading === event.id}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Event</h2>
              <button
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-text">
                You are about to reject: <strong>{selectedEvent.title}</strong>
              </p>
              <p className="modal-subtext">
                Please provide a reason for rejection. The organizer will see this message.
              </p>

              <textarea
                className="rejection-textarea"
                placeholder="Enter rejection reason (required)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                maxLength={1000}
              />
              <small className="char-count">
                {rejectionReason.length}/1000 characters
              </small>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-reject"
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader className="spinner-small" size={16} />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Reject Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowDetailModal(false)}
            >
              <X size={24} />
            </button>

            <div className="modal-header">
              <img
                src={selectedEvent.imageUrl || defaultImages[selectedEvent.category] || defaultImages.Other}
                alt={selectedEvent.title}
                className="modal-image"
              />
              <h2>{selectedEvent.title}</h2>
            </div>

            <div className="modal-body">
              <div className="event-info">
                <p><strong>Category:</strong> {selectedEvent.category}</p>
                <p><strong>Organizer:</strong> {selectedEvent.organizerName}</p>
                <p>
                  <strong>Start:</strong> {formatDateDDMMYYYY(selectedEvent.startDate)} at{" "}
                  {formatTimeAMPM(selectedEvent.startTime)}
                </p>
                <p>
                  <strong>End:</strong> {formatDateDDMMYYYY(selectedEvent.endDate)} at{" "}
                  {formatTimeAMPM(selectedEvent.endTime)}
                </p>
                <p><strong>Location:</strong> {selectedEvent.location || "N/A"}</p>
                <p>
                  <strong>Type:</strong>{" "}
                  {selectedEvent.eventType === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                </p>
                {selectedEvent.maxAttendees && (
                  <p><strong>Capacity:</strong> {selectedEvent.maxAttendees} attendees</p>
                )}
              </div>

              <div className="event-description">
                <h3>Description</h3>
                <p>{selectedEvent.description || "No description provided."}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-approve"
                onClick={() => {
                  setShowDetailModal(false);
                  handleApprove(selectedEvent.id);
                }}
                disabled={actionLoading}
              >
                <CheckCircle size={16} />
                Approve Event
              </button>
              <button
                className="btn btn-reject"
                onClick={() => {
                  setShowDetailModal(false);
                  handleRejectClick(selectedEvent);
                }}
                disabled={actionLoading}
              >
                <XCircle size={16} />
                Reject Event
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}