// ================================================================
// FILE: D:\EventZen-frontend\src\pages\organizer\OrganizerCalendarPage.jsx
// 🔧 FIXED: Now opens EventModal on event click (like Admin)
// ================================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Loader, ChevronLeft, ChevronRight, Calendar, Filter, RotateCcw } from "lucide-react";
import API from "../services/api";
import EventModal from "../components/calendar/EventModal"; // 🆕 NEW: Import modal
import "../styles/main pages/calendar.css";

const OrganizerCalendarPage = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [organizerId, setOrganizerId] = useState(null);
  
  // 🆕 NEW: Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });
  
  // Filter options
  const [categories] = useState([
    "Music", "Technology", "Sports", "Art", "Business", 
    "Education", "Food", "Health", "Travel", "Entertainment", "Other"
  ]);
  
  // Current view state
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get organizer ID on mount
  useEffect(() => {
    fetchOrganizerId();
  }, []);

  // Load events when filters or date range changes
  useEffect(() => {
    if (organizerId) {
      loadEvents();
    }
  }, [filters, currentDate, currentView, organizerId]);

  const fetchOrganizerId = async () => {
    try {
      const response = await API.get("/users/profile");
      setOrganizerId(response.data.id);
    } catch (err) {
      console.error("Error fetching organizer ID:", err);
      setError("Failed to load organizer profile");
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventEnd = new Date(`${event.endDate}T${event.endTime}`);
    return eventEnd > now ? "upcoming" : "completed";
  };

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    
    try {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) {
        setLoading(false);
        return;
      }

      // Get visible date range
      const view = calendarApi.view;
      const startDate = view.activeStart.toISOString().split('T')[0];
      const endDate = view.activeEnd.toISOString().split('T')[0];

      // Fetch events with filters
      const params = {
        startDate,
        endDate,
        organizerId,
        category: filters.category || undefined,
      };
      
      const response = await API.get("/events/organizer/calendar", { params });
      const eventsData = response.data;
      
      // Apply status filter client-side
      let filteredData = eventsData;
      if (filters.status) {
        filteredData = eventsData.filter(event => {
          const status = getEventStatus(event);
          return status === filters.status;
        });
      }

      // Transform events for FullCalendar
      const transformedEvents = filteredData.map(event => {
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
            registrationCount: event.currentAttendees || 0,
          },
        };
      });

      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  // 🔧 FIXED: Handle event click - Open modal FIRST
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    
    // Extract event data from extendedProps
    const eventData = {
      id: event.id,
      title: event.title,
      ...event.extendedProps,
    };
    
    console.log("Event clicked:", eventData);
    
    setSelectedEvent(eventData);
    setShowModal(true); // OPEN MODAL
  };

  // 🆕 NEW: Handle edit button click from modal
  const handleEdit = () => {
    if (selectedEvent && selectedEvent.id) {
      setShowModal(false);
      navigate(`/organizer/dashboard`, { 
        state: { editEventId: selectedEvent.id } 
      });
    }
  };

  // 🆕 NEW: Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Handle date click - Navigate to create page with prefilled date
  const handleDateClick = (dateInfo) => {
    const clickedDate = dateInfo.dateStr;
    navigate(`/organizer/dashboard`, {
      state: { 
        createEvent: true,
        prefillDate: clickedDate 
      }
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
  };

  const handleNavigate = (direction) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === "prev") calendarApi.prev();
      else if (direction === "next") calendarApi.next();
      else if (direction === "today") calendarApi.today();
      
      setCurrentDate(calendarApi.getDate());
    }
  };

  const resetFilters = () => {
    setFilters({ category: "", status: "" });
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12 || 12;
    
    if (minutes === 0) {
      return `${hours} ${ampm}`;
    }
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const isMonthView = currentView === 'dayGridMonth';
    const status = event.extendedProps.status;
    const registrationCount = event.extendedProps.registrationCount;

    return (
      <div className="cal-event-wrapper" title={getTooltipText(event)}>
        <div className="cal-event-time">
          {formatTime(event.start)}
        </div>
        <div className="cal-event-title">
          {event.title}
        </div>
        {/* {isMonthView && (
          <>
            <span className={`cal-status-badge cal-status-${status}`}>
              {status === 'upcoming' ? '●' : '✓'}
            </span>
            {registrationCount > 0 && (
              <span className="cal-registration-count">
                👥 {registrationCount}
              </span>
            )}
          </>
        )} */}
      </div>
    );
  };

  const getTooltipText = (event) => {
    const props = event.extendedProps;
    return `${event.title}\n` +
           `Date: ${formatDate(event.start)}\n` +
           `Time: ${formatTime(event.start)}\n` +
           `Registrations: ${props.registrationCount || 0}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

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

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="calendar-container">
      {/* Toolbar */}
      <div className="cal-toolbar">
        {/* Navigation Section */}
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

        {/* Filters Section - Category and Status Only */}
        <div className="cal-toolbar-filters">
          <div className="cal-filter-group">
            <Filter size={16} />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="cal-filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="cal-filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="cal-filter-select"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              className="cal-btn cal-btn-reset"
              onClick={resetFilters}
              title="Reset Filters"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="cal-alert cal-alert-error" role="alert">
          {error}
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
          dateClick={handleDateClick}
          eventContent={renderEventContent}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.8}
          
          // Disable drag/resize for organizer
          editable={false}
          droppable={false}
          eventResizableFromStart={false}
          eventDurationEditable={false}
          eventStartEditable={false}
          
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

      {/* 🆕 NEW: Event Modal */}
      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onEdit={handleEdit} // Pass edit callback
        />
      )}
    </div>
  );
};

export default OrganizerCalendarPage;