// ================================================================
// FILE: D:\EventZen-frontend\src\components\calendar\CalendarView.jsx
// Main Calendar Component with FullCalendar Integration
// 🆕 UPDATED: Status filtering, Month view styling, Time format "11 p.m."
// ================================================================

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import CalendarToolbar from "./CalendarToolbar";
import EventModal from "./EventModal";
import { 
  getEventsByDateRange, 
  getAllOrganizers, 
  getAllCategories 
} from "../../services/adminService";
import { Loader } from "lucide-react";

const CalendarView = () => {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    organizerId: "",
    eventType: "",
    status: "", // 🆕 NEW: Status filter
  });
  
  // Filter options
  const [categories, setCategories] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  
  // Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Current view state
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load events when filters or date range changes
  useEffect(() => {
    loadEvents();
  }, [filters, currentDate, currentView]);

  const loadFilterOptions = async () => {
    try {
      const [categoriesData, organizersData] = await Promise.all([
        getAllCategories(),
        getAllOrganizers(),
      ]);
      
      setCategories(categoriesData || []);
      setOrganizers(organizersData || []);
    } catch (err) {
      console.error("Error loading filter options:", err);
    }
  };

  // 🆕 NEW: Helper to determine event status
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

      // Get visible date range from calendar
      const view = calendarApi.view;
      const startDate = view.activeStart.toISOString().split('T')[0];
      const endDate = view.activeEnd.toISOString().split('T')[0];

      // Fetch events with filters (excluding status - we filter client-side)
      const apiFilters = {
        category: filters.category,
        organizerId: filters.organizerId,
        eventType: filters.eventType,
      };
      
      const eventsData = await getEventsByDateRange(startDate, endDate, apiFilters);
      
      // 🆕 NEW: Apply status filter client-side
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
          classNames: [`cal-event-${status}`], // 🆕 NEW: Add status class
          extendedProps: {
            ...event,
            organizerName: event.organizerName,
            category: event.category,
            eventType: event.eventType,
            status: status, // 🆕 NEW: Include status
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

  // Handle event click
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      ...event.extendedProps,
    });
    setShowEventModal(true);
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle view change
  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
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

  // 🆕 UPDATED: Format time as "11 p.m." with space and dot
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

  // 🆕 UPDATED: Render event content with status badge for Month view
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const isMonthView = currentView === 'dayGridMonth';
    const status = event.extendedProps.status;

    return (
      <div className="cal-event-wrapper" title={getTooltipText(event)}>
        <div className="cal-event-time">
          {formatTime(event.start)}
        </div>
        <div className="cal-event-title">
          {event.title}
        </div>
        {/* 🆕 NEW: Status badge in Month view */}
        {isMonthView && (
          <span className={`cal-status-badge cal-status-${status}`}>
            {status === 'upcoming' ? '●' : '✓'}
          </span>
        )}
      </div>
    );
  };

  // 🆕 UPDATED: Tooltip with new time format
  const getTooltipText = (event) => {
    const props = event.extendedProps;
    return `${event.title}\n` +
           `Date: ${formatDate(event.start)}\n` +
           `Time: ${formatTime(event.start)} - ${formatTime(event.end)}\n` +
           `Category: ${props.category || 'N/A'}\n` +
           `Organizer: ${props.organizerName || 'N/A'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  // Handle event update from modal (removed edit functionality)
  const handleEventUpdate = () => {
    setShowEventModal(false);
    loadEvents(); // Reload events
  };

  return (
    <div className="calendar-container">
      {/* Toolbar */}
      <CalendarToolbar
        currentView={currentView}
        currentDate={currentDate}
        filters={filters}
        categories={categories}
        organizers={organizers}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onFilterChange={handleFilterChange}
      />

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
          <p>Loading events...</p>
        </div>
      )}

      {/* Calendar */}
      <div className={`calendar-wrapper ${loading ? 'cal-hidden' : ''}`}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false} // We use custom toolbar
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.8}
          
          // Disable editing/dragging
          editable={false}
          droppable={false}
          eventResizableFromStart={false}
          eventDurationEditable={false}
          eventStartEditable={false}
          
          // Styling
          eventClassNames="cal-event"
          dayMaxEvents={3}
          moreLinkText="more"
          
          // Date handling
          timeZone="local"
          
          // View options
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
          
          // Event hover
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

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
          onUpdate={handleEventUpdate}
        />
      )}
    </div>
  );
};

export default CalendarView;