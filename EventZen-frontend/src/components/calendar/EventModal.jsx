// ================================================================
// FILE: D:\EventZen-frontend\src\components\calendar\EventModal.jsx
// 🔧 FIXED: Added conditional Edit button for Organizer
// Admin: No Edit button (onEdit undefined)
// Organizer: Edit button shown (onEdit provided)
// ================================================================

import React from "react";
import { X, Calendar, Clock, Users, Tag, Edit } from "lucide-react";

const EventModal = ({ event, onClose, onEdit }) => {
  
  // Format time as "11 p.m." with space and dot
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours24, minutes] = timeString.split(':');
    let hours = parseInt(hours24);
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12 || 12;
    
    if (parseInt(minutes) === 0) {
      return `${hours} ${ampm}`;
    }
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="cal-modal-overlay" onClick={onClose}>
      <div className="cal-modal-content cal-modal-compact" onClick={(e) => e.stopPropagation()}>
        {/* <button className="cal-modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button> */}

        {/* <div className="cal-modal-header">
          <h2>Event Details</h2>
        </div> */}

        {/* VIEW MODE - Read Only */}
        <div className="cal-modal-body">  
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title} className="cal-event-image" />
          )}
          
          <div className="cal-event-details">
            <h3>{event.title}</h3>
            
            <div className="cal-detail-row">
              <Calendar size={18} />
              <span><strong>Start:</strong> {formatDate(event.startDate)} at {formatTime(event.startTime)}</span>
            </div>
            
            <div className="cal-detail-row">
              <Calendar size={18} />
              <span><strong>End:</strong> {formatDate(event.endDate)} at {formatTime(event.endTime)}</span>
            </div>
            
            <div className="cal-detail-row">
              <Tag size={18} />
              <span><strong>Category:</strong> {event.category}</span>
            </div>
            
            <div className="cal-detail-row">
              <Users size={18} />
              <span><strong>Organizer:</strong> {event.organizerName}</span>
            </div>
            
            {event.maxAttendees && (
              <div className="cal-detail-row">
                <Users size={18} />
                <span><strong>Registrations:</strong> {event.currentAttendees || 0} / {event.maxAttendees}</span>
              </div>
            )}
            
            <div className="cal-detail-row">
              <span className={`cal-type-badge ${event.eventType?.toLowerCase()}`}>
                {event.eventType === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
              </span>
            </div>

            {/* 🆕 NEW: Status Badge
            {event.status && (
              <div className="cal-detail-row">
                <span className={`cal-status-badge cal-status-${event.status}`}>
                  {event.status === 'upcoming' ? '⏳ Upcoming' : '✓ Completed'}
                </span>
              </div>
            )} */}
            
            {event.description && (
              <div className="cal-description">
                <h4>Description</h4>
                <p>{event.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* 🔧 FIXED: Conditional Edit Button for Organizer */}
        <div className="cal-modal-footer">
          {/* {onEdit && (
            <button 
              className="cal-btn cal-btn-primary" 
              onClick={onEdit}
              aria-label="Edit event"
            >
              <Edit size={16} />
              Edit Event
            </button>
          )} */}
          <button className="cal-btn cal-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;