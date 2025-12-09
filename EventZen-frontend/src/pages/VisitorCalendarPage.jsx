// ================================================================
// FILE: D:\EventZen-frontend\src\pages\visitor\VisitorCalendarPage.jsx
// Visitor Calendar - View registered events only (no edit/create)
// ================================================================

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  X, 
  Loader,
  Clock,
  MapPin,
  Users,
  Tag,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";
import API from "../services/api";
import "../styles/main pages/calendar.css";

const VisitorCalendarPage = () => {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  
  // Current view state
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load events when view changes
  useEffect(() => {
    loadEvents();
  }, [currentDate, currentView]);

  // Load visitor's registered events
  const loadEvents = async () => {
    setLoading(true);
    setError("");
    
    try {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) {
        setLoading(false);
        return;
      }

      // Get visible date range from calendar
      const view = calendarApi.view;
      const startDate = view.activeStart.toISOString().split('T')[0];
      const endDate = view.activeEnd.toISOString().split('T')[0];

      // Fetch visitor's registered events
      const response = await API.get("/visitor/calendar/events", {
        params: { from: startDate, to: endDate }
      });

      // Transform events for FullCalendar
      const transformedEvents = response.data.map(event => {
        const status = getEventStatus(event);
        return {
          id: event.id,
          title: event.title,
          start: `${event.startDate}T${event.startTime}`,
          end: `${event.endDate}T${event.endTime}`,
          backgroundColor: getCategoryColor(event.category),
          borderColor: getCategoryColor(event.category),
          classNames: [`cal-event-${status}`],
          extendedProps: {
            ...event,
            status: status,
          },
        };
      });

      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load your events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine event status
  const getEventStatus = (event) => {
    const now = new Date();
    const eventEnd = new Date(`${event.endDate}T${event.endTime}`);
    return eventEnd > now ? "upcoming" : "completed";
  };

  // Category colors
  const getCategoryColor = (category) => {
    const colors = {
      Technology: "#667eea",
      Business: "#f59e0b",
      Music: "#ec4899",
      Health: "#10b981",
      Food: "#f97316",
      Art: "#8b5cf6",
      Community: "#3b82f6",
      Entertainment: "#ef4444",
      Education: "#06b6d4",
      Sports: "#84cc16",
      Other: "#6b7280",
    };
    return colors[category] || colors.Other;
  };

  // Handle event click - open modal
  const handleEventClick = async (clickInfo) => {
    const eventId = clickInfo.event.id;
    
    try {
      // Fetch full event details
      const response = await API.get(`/events/${eventId}`);
      setSelectedEvent(response.data);
      setShowEventModal(true);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details");
    }
  };

  // Handle unregister
  const handleUnregister = async () => {
    if (!selectedEvent) return;
    
    if (!window.confirm("Are you sure you want to cancel your registration for this event?")) {
      return;
    }

    setRegistrationLoading(true);
    
    try {
      // Find the registration ID for this event
      const registrations = await API.get("/registrations/my-registrations");
      const registration = registrations.data.find(
        reg => reg.eventId === selectedEvent.id && reg.status !== "CANCELLED"
      );

      if (registration) {
        await API.delete(`/registrations/${registration.id}`);
        setShowEventModal(false);
        setSelectedEvent(null);
        loadEvents(); // Reload calendar
        alert("Registration cancelled successfully!");
      }
    } catch (err) {
      console.error("Error cancelling registration:", err);
      alert("Failed to cancel registration. Please try again.");
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Format time as "11 p.m."
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

  // Render event content with time
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;

    return (
      <div className="cal-event-wrapper" title={getTooltipText(event)}>
        <div className="cal-event-time">
          {formatTime(event.start.toTimeString().split(' ')[0])}
        </div>
        <div className="cal-event-title">
          {event.title}
        </div>
      </div>
    );
  };

  // Tooltip text
  const getTooltipText = (event) => {
    const props = event.extendedProps;
    return `${event.title}\n` +
           `Date: ${formatDate(event.start.toISOString().split('T')[0])}\n` +
           `Time: ${formatTime(event.start.toTimeString().split(' ')[0])}\n` +
           `Category: ${props.category || 'N/A'}`;
  };

  // Navigate calendar
  const handleNavigate = (direction) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === "prev") calendarApi.prev();
      else if (direction === "next") calendarApi.next();
      else if (direction === "today") calendarApi.today();
      
      setCurrentDate(calendarApi.getDate());
    }
  };

  // Change view
  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
  };

  // Format toolbar title
  const formatTitle = () => {
    const options = { year: 'numeric', month: 'long' };
    if (currentView === 'timeGridWeek') {
      return currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    if (currentView === 'timeGridDay') {
      return currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    }
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <div className="calendar-container">
      {/* Custom Toolbar */}
      <div className="cal-toolbar">
        <div className="cal-toolbar-nav">
          <button 
            className="cal-btn cal-btn-icon"
            onClick={() => handleNavigate('prev')}
            title="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            className="cal-btn cal-btn-today"
            onClick={() => handleNavigate('today')}
          >
            <Calendar size={18} />
            Today
          </button>
          
          <button 
            className="cal-btn cal-btn-icon"
            onClick={() => handleNavigate('next')}
            title="Next"
          >
            <ChevronRight size={20} />
          </button>
          
          <h2 className="cal-toolbar-title">{formatTitle()}</h2>
        </div>

        {/* View Switcher */}
        <div className="cal-toolbar-views">
          <button
            className={`cal-btn cal-btn-view ${currentView === 'dayGridMonth' ? 'cal-active' : ''}`}
            onClick={() => handleViewChange('dayGridMonth')}
          >
            Month
          </button>
          <button
            className={`cal-btn cal-btn-view ${currentView === 'timeGridWeek' ? 'cal-active' : ''}`}
            onClick={() => handleViewChange('timeGridWeek')}
          >
            Week
          </button>
          <button
            className={`cal-btn cal-btn-view ${currentView === 'timeGridDay' ? 'cal-active' : ''}`}
            onClick={() => handleViewChange('timeGridDay')}
          >
            Day
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="cal-alert cal-alert-error" role="alert">
          {error}
          <button onClick={() => setError("")} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="cal-loading">
          <Loader className="cal-spinner" size={40} />
          <p>Loading your events...</p>
        </div>
      )}

      {/* Calendar */}
      <div className={`calendar-wrapper ${loading ? 'cal-hidden' : ''}`}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.8}
          editable={false}
          droppable={false}
          eventResizableFromStart={false}
          eventDurationEditable={false}
          eventStartEditable={false}
          selectable={false}
          eventClassNames="cal-event"
          dayMaxEvents={3}
          moreLinkText="more"
          timeZone="local"
          views={{
            dayGridMonth: {
              titleFormat: { year: 'numeric', month: 'long' }
            },
            timeGridWeek: {
              titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
            },
            timeGridDay: {
              titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
            }
          }}
          eventMouseEnter={(info) => {
            info.el.style.transform = 'scale(1.05)';
            info.el.style.transition = 'transform 0.2s';
            info.el.style.zIndex = '1000';
          }}
          eventMouseLeave={(info) => {
            info.el.style.transform = 'scale(1)';
            info.el.style.zIndex = 'auto';
          }}
        />
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="cal-modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="cal-modal-content cal-modal-compact" onClick={(e) => e.stopPropagation()}>
            <button className="cal-modal-close" onClick={() => setShowEventModal(false)}>
              <X size={24} />
            </button>

            <div className="cal-modal-header">
              <h2>Event Details</h2>
            </div>

            <div className="cal-modal-body">
              {selectedEvent.imageUrl && (
                <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="cal-event-image" />
              )}
              
              <div className="cal-event-details">
                <h3>{selectedEvent.title}</h3>
                
                <div className="cal-detail-row">
                  <Calendar size={18} />
                  <span><strong>Start:</strong> {formatDate(selectedEvent.startDate)} at {formatTime(selectedEvent.startTime)}</span>
                </div>
                
                <div className="cal-detail-row">
                  <Calendar size={18} />
                  <span><strong>End:</strong> {formatDate(selectedEvent.endDate)} at {formatTime(selectedEvent.endTime)}</span>
                </div>
                
                <div className="cal-detail-row">
                  <Tag size={18} />
                  <span><strong>Category:</strong> {selectedEvent.category}</span>
                </div>
                
                <div className="cal-detail-row">
                  <MapPin size={18} />
                  <span><strong>Location:</strong> {selectedEvent.location || `${selectedEvent.city}, ${selectedEvent.state}`}</span>
                </div>
                
                <div className="cal-detail-row">
                  <User size={18} />
                  <span><strong>Organizer:</strong> {selectedEvent.organizerName}</span>
                </div>
                
                {selectedEvent.maxAttendees && (
                  <div className="cal-detail-row">
                    <Users size={18} />
                    <span><strong>Registrations:</strong> {selectedEvent.currentAttendees || 0} / {selectedEvent.maxAttendees}</span>
                  </div>
                )}
                
                <div className="cal-detail-row">
                  <span className={`cal-type-badge ${selectedEvent.eventType?.toLowerCase()}`}>
                    {selectedEvent.eventType === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                  </span>
                </div>
                
                {selectedEvent.description && (
                  <div className="cal-description">
                    <h4>Description</h4>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="cal-modal-footer">
              {/* <button 
                className="cal-btn cal-btn-secondary" 
                onClick={handleUnregister}
                disabled={registrationLoading}
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {registrationLoading ? <Loader className="cal-spinner-small" size={16} /> : <XCircle size={16} />}
                {registrationLoading ? 'Cancelling...' : 'Cancel Registration'}
              </button> */}
              <button className="cal-btn cal-btn-secondary" onClick={() => setShowEventModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorCalendarPage;