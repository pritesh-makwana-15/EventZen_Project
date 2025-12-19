import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Organizer Dashboard/OrganizerDashboard.css";
// import OrganizerCalendarPage from "./organizer/OrganizerCalendarPage";
import OrganizerCalendarPage from "./OrganizerCalendarPage";
import { getActiveVenues } from "../services/api";

import {
  Calendar,
  Users,
  User, 
  UserPlus,
  LogOut,
  Trash2,
  Edit,
  X,
  Save,
  Loader,
  Eye,
  
  RotateCcw,
  
  ChartBarStacked,
  ImagePlus,
  Menu,
  Clock,
  MapPin,
  CalendarDays,
  TrendingUp,
  
} from "lucide-react";

// 🆕 Import Analytics Components
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// 🆕 Import DateTime Utilities
import {
  formatDateDDMMYYYY,
  formatTimeAMPM,
  
  validateDateTime,
  getTomorrowDate,
  
  parseLocation
} from "../utils/dateTime";

import ViewRegistrations from "../pages/organizer/ViewRegistrations";
import TicketPreviewModal from "../components/organizer/TicketPreviewModal";
import VenueMapPreview from "../components/organizer/VenueMapPreview";
import {  Download, FileText } from "lucide-react";

// ============ Toast Notification Component ============
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`org-toast org-toast-${type}`} onClick={onClose} role="alert">
      <span className="org-toast-icon" aria-hidden="true">
        {type === 'success' ? '✓' : '✕'}
      </span>
      <span className="org-toast-message">{message}</span>
    </div>
  );
}

// ============ 🆕 Analytics Components (Embedded) ============

// Summary Cards Component
function SummaryCards({ totalUsers, totalEvents, totalRegistrations, avgAttendance }) {
  const cards = [];

  if (totalUsers !== undefined) {
    cards.push({
      id: "users",
      icon: Users,
      label: "Total Users",
      value: totalUsers,
      color: "card-blue",
    });
  }

  if (totalEvents !== undefined) {
    cards.push({
      id: "events",
      icon: Calendar,
      label: "Total Events",
      value: totalEvents,
      color: "card-purple",
    });
  }

  if (totalRegistrations !== undefined) {
    cards.push({
      id: "registrations",
      icon: UserPlus,
      label: "Total Registrations",
      value: totalRegistrations,
      color: "card-green",
    });
  }

  if (avgAttendance !== undefined) {
    cards.push({
      id: "attendance",
      icon: TrendingUp,
      label: "Avg Attendance Rate",
      value: `${avgAttendance}%`,
      color: "card-orange",
    });
  }

  return (
    <div className="summary-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={`summary-card ${card.color}`}>
            <div className="card-icon">
              <Icon size={28} />
            </div>
            <div className="card-content">
              <p className="card-label">{card.label}</p>
              <h3 className="card-value">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Category Chart Component
function CategoryChart({ data }) {
  const COLORS = [
    "#667eea", "#764ba2", "#f093fb", "#4facfe", "#00f2fe",
    "#43e97b", "#fa709a", "#feca57", "#ff9ff3", "#54a0ff", "#48dbfb"
  ];

  if (!data || data.length === 0) {
    return <div className="chart-empty">No category data available</div>;
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={500}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} events`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Monthly Trends Chart Component
function MonthlyTrendsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No trend data available</div>;
  }

  const chartData = data.map((item) => ({
    name: `${item.monthName.substring(0, 3)} ${item.year}`,
    registrations: item.count,
    month: item.month,
    year: item.year,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          stroke="#666"
          style={{ fontSize: "12px" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="#666"
          style={{ fontSize: "12px" }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
          }}
          formatter={(value) => [`${value} registrations`, "Registrations"]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="registrations"
          stroke="#667eea"
          strokeWidth={2}
          dot={{ fill: "#667eea", r: 5 }}
          activeDot={{ r: 7 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Analytics Dashboard Component
function AnalyticsDashboard({ organizerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [organizerPerformance, setOrganizerPerformance] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [organizerId]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (organizerId) {
        const perfRes = await API.get(`/analytics/organizer/${organizerId}/performance`);
        setOrganizerPerformance(perfRes.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader className="analytics-spinner" size={48} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchAnalyticsData} className="analytics-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {organizerPerformance && (
        <div className="analytics-organizer-view">
          {/* Performance Cards */}
          <SummaryCards
            totalEvents={organizerPerformance.totalEvents}
            totalRegistrations={organizerPerformance.totalRegistrations}
            avgAttendance={organizerPerformance.averageAttendanceRate}
          />

          {/* Top Events */}
          <div className="analytics-top-events">
            <h3>🌟 Your Top Events</h3>
            {organizerPerformance.topEvents && organizerPerformance.topEvents.length > 0 ? (
              <div className="analytics-events-list">
                {organizerPerformance.topEvents.map((event, idx) => (
                  <div key={idx} className="analytics-event-item">
                    <div className="event-rank">#{idx + 1}</div>
                    <div className="event-info">
                      <h4>{event.eventTitle}</h4>
                      <p>
                        {event.registrations} Registration{event.registrations !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="event-rate">
                      <span className="rate-value">{event.attendanceRate}%</span>
                      <span className="rate-label">Attendance</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="analytics-no-data">
                <p>📭 No events yet. Create your first event to see analytics!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MyEvents Component ============
function MyEvents({ onEditEvent, 
  setShowRegistrations, 
  setShowTicketPreview, 
  handleExportCSV,
setShowVenueMap  }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // Filter states
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchName, searchLocation, categoryFilter, typeFilter, statusFilter]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/events/my-events");
      setEvents(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load your events");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    let filtered = [...events];

    if (searchName.trim()) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchLocation.trim()) {
      filtered = filtered.filter(event => 
        event.location?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(event => (event.eventType || "PUBLIC") === typeFilter);
    }

    if (statusFilter !== "all") {
      if (statusFilter === "upcoming") {
        filtered = filtered.filter(event => {
          const eventStart = new Date(`${event.startDate}T${event.startTime || '00:00'}`);
          return eventStart > now;
        });
      } else if (statusFilter === "completed") {
        filtered = filtered.filter(event => {
          const eventEnd = new Date(`${event.endDate || event.startDate}T${event.endTime || '23:59'}`);
          return eventEnd <= now;
        });
      }
    }

    // 🆕 Sort by start date
    const upcoming = filtered.filter(e => {
      const eventStart = new Date(`${e.startDate}T${e.startTime || '00:00'}`);
      return eventStart > now;
    }).sort((a, b) => new Date(`${b.startDate}T${b.startTime}`) - new Date(`${a.startDate}T${a.startTime}`));
    
    const completed = filtered.filter(e => {
      const eventEnd = new Date(`${e.endDate || e.startDate}T${e.endTime || '23:59'}`);
      return eventEnd <= now;
    }).sort((a, b) => new Date(`${b.startDate}T${b.startTime}`) - new Date(`${a.startDate}T${a.startTime}`));
    
    setFilteredEvents([...upcoming, ...completed]);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      setLoading(true);
      await API.delete(`/events/${eventId}`);
      await fetchMyEvents();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.response?.data?.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchLocation("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const defaultImages = {
    "Music": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    "Technology": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
    "Art": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
    "Business": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    "Education": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
    "Food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    "Health": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    "Travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
    "Entertainment": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&h=300&fit=crop",
    "Other": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop"
  };

  const eventCategories = [
    "Music", "Technology", "Sports", "Art", "Business", 
    "Education", "Food", "Health", "Travel", "Entertainment", "Other"
  ];

  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => {
    const eventStart = new Date(`${e.startDate}T${e.startTime || '00:00'}`);
    return eventStart > new Date();
  }).length;
  const pastEvents = totalEvents - upcomingEvents;

  if (loading && events.length === 0) {
    return <div className="org-loading-spinner">Loading your events...</div>;
  }

  return (
    <div className="org-my-events">
      {error && <div className="org-alert org-alert-error">{error}</div>}

      <div className="org-stats-grid">
        <div className="org-stat-card org-stat-total">
          <div className="org-stat-content">
            <div className="org-stat-icon" aria-hidden="true">📊</div>
            <span className="org-stat-value">{totalEvents}</span>
          </div>
          <span className="org-stat-label">Total Events</span>
        </div>
        <div className="org-stat-card org-stat-upcoming">
          <div className="org-stat-content">
            <div className="org-stat-icon" aria-hidden="true">🚀</div>
            <span className="org-stat-value">{upcomingEvents}</span>
          </div>
          <span className="org-stat-label">Upcoming Events</span>
        </div>
        <div className="org-stat-card org-stat-past">
          <div className="org-stat-content">
            <div className="org-stat-icon" aria-hidden="true">✓</div>
            <span className="org-stat-value">{pastEvents}</span>
          </div>
          <span className="org-stat-label">Completed Events</span>
        </div>
      </div>

      <div className="org-filters-section">
        <div className="org-filters-row">
          <div className="org-filter-container org-filter-search">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="🔍 Search by event name..."
              className="org-filter-input"
              aria-label="Search events by name"
            />
          </div>

          <div className="org-filter-container">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="org-filter-select"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {eventCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="org-filter-container">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="org-filter-select"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <div className="org-filter-container">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="org-filter-select"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="org-filter-container">
            <button 
              className="org-btn-clear-filters" 
              onClick={handleClearFilters}
              aria-label="Clear all filters"
            >
              <RotateCcw size={14} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="org-empty-state">
          <div className="org-empty-icon" aria-hidden="true">📅</div>
          <h3>No events found</h3>
          <p>
            {events.length === 0 
              ? "You haven't created any events yet."
              : "No events match your current filters."
            }
          </p>
        </div>
      ) : (
        <>
          {/* 🆕 Desktop Table View */}
          <div className="org-table-container">
            <table className="org-events-table">
              <thead>
                <tr>
                  <th scope="col">Image</th>
                  <th scope="col">Title</th>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                  {/* <th scope="col">Start Time</th>
                  <th scope="col">End Time</th> */}
                  <th scope="col">Category</th>
                  <th scope="col">Type</th>
                  <th scope="col">Attendees</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>  
              <tbody>
                {filteredEvents.map((event) => {
                  const eventStart = new Date(`${event.startDate}T${event.startTime || '00:00'}`);
                  const isUpcoming = eventStart > new Date();
                  return (
                    <tr key={event.id}>
                      <td>
                        <img 
                          src={event.imageUrl || defaultImages[event.category] || defaultImages["Other"]} 
                          alt={`${event.title} event image`}
                          className="org-event-thumbnail"
                        />
                      </td>
                      <td><span className="org-event-title">{event.title}</span></td>
                      <td>{formatDateDDMMYYYY(event.startDate)} {<br></br>} {formatTimeAMPM(event.startTime || '00:00')}</td>
                      <td>{formatDateDDMMYYYY(event.endDate || event.startDate)}{<br></br>}{formatTimeAMPM(event.endTime || '23:59')}</td>
                      {/* <td>{formatTimeAMPM(event.startTime || '00:00')}</td>
                      <td>{formatTimeAMPM(event.endTime || '23:59')}</td> */}
                      <td><span className="org-category-badge">{event.category}</span></td>
                      <td>
                        <span className={`org-type-badge org-type-${event.eventType?.toLowerCase()}`}>
                          {event.eventType || 'PUBLIC'}
                        </span>
                      </td>
                      <td className="org-attendees-cell">
                        {(event.currentAttendees || 0)} / {event.maxAttendees || 0}
                      </td>
                      <td>
                        <span className={`org-status-badge org-status-${isUpcoming ? 'upcoming' : 'completed'}`}>
                          {isUpcoming ? 'Upcoming' : 'Completed'}
                        </span>
                      </td>
                      <td>
                        <div className="org-action-buttons">
                          {/* ADD these buttons in the <td> with className="org-action-buttons" */}
                          <button 
                            className="org-action-btn org-btn-view"
                            onClick={() => setShowRegistrations(event)}
                          >
                            <Users size={14} />
                            Registrations
                          </button>

                          <button 
                            className="org-action-btn org-btn-export"
                            onClick={() => handleExportCSV(event.id, event.title)}
                          >
                            <Download size={14} />
                            Export CSV
                          </button>

                          <button 
                            className="org-action-btn org-btn-ticket"
                            onClick={() => setShowTicketPreview(event)}
                          >
                            <FileText size={14} />
                            Preview
                          </button>
                          <button
                            className="org-action-btn org-btn-map"
                            onClick={() => setShowVenueMap(event.venueId || event.id)}  // ✅ FIXED
                            disabled={!event.venueId}  // Disable if no venue
                            title={!event.venueId ? "No venue assigned" : "View venue map"}
                          >
                            <MapPin size={14} />
                            Venue Map
                          </button>
                          {isUpcoming ? (
                            <>
                              <button 
                                className="org-action-btn org-btn-edit"
                                onClick={() => onEditEvent(event)}
                                aria-label={`Edit ${event.title}`}
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button 
                                className="org-action-btn org-btn-delete"
                                onClick={() => setDeleteConfirm(event)}
                                aria-label={`Delete ${event.title}`}
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </>
                          ) : null}
                          <button 
                            className="org-action-btn org-btn-view"
                            onClick={() => handleViewDetails(event)}
                            aria-label={`View details for ${event.title}`}
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 🆕 Mobile Card View */}
          <div className="org-events-cards">
            {filteredEvents.map((event) => {
              const eventStart = new Date(`${event.startDate}T${event.startTime || '00:00'}`);
              const isUpcoming = eventStart > new Date();
              return (
                <div key={event.id} className="org-event-card">
                  <img 
                    src={event.imageUrl || defaultImages[event.category] || defaultImages["Other"]} 
                    alt={`${event.title} event`}
                    className="org-event-card-image"
                  />
                  <div className="org-event-card-content">
                    <h3 className="org-event-card-title">{event.title}</h3>
                    
                    <div className="org-event-card-details">
                      <div className="org-event-card-detail">
                        <CalendarDays size={16} />
                        <span>Start: {formatDateDDMMYYYY(event.startDate)}</span>
                      </div>
                      <div className="org-event-card-detail">
                        <CalendarDays size={16} />
                        <span>End: {formatDateDDMMYYYY(event.endDate || event.startDate)}</span>
                      </div>
                      <div className="org-event-card-detail">
                        <Clock size={16} />
                        <span>{formatTimeAMPM(event.startTime || '00:00')}</span>
                      </div>
                      <div className="org-event-card-detail">
                        <Clock size={16} />
                        <span>{formatTimeAMPM(event.endTime || '23:59')}</span>
                      </div>
                      <div className="org-event-card-detail">
                        <MapPin size={16} />
                        <span>{event.location || 'No location'}</span>
                      </div>
                      <div className="org-event-card-detail">
                        <Users size={16} />
                        <span>{event.currentAttendees || 0}/{event.maxAttendees || 0}</span>
                      </div>
                    </div>

                    <div className="org-event-card-badges">
                      <span className="org-category-badge">{event.category}</span>
                      <span className={`org-type-badge org-type-${event.eventType?.toLowerCase()}`}>
                        {event.eventType || 'PUBLIC'}
                      </span>
                      <span className={`org-status-badge org-status-${isUpcoming ? 'upcoming' : 'completed'}`}>
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>

                    <div className="org-event-card-actions">
                      {isUpcoming && (
                        <>
                          <button 
                            className="org-action-btn org-btn-edit"
                            onClick={() => onEditEvent(event)}
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                            className="org-action-btn org-btn-delete"
                            onClick={() => setDeleteConfirm(event)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </>
                      )}
                      <button 
                        className="org-action-btn org-btn-view"
                        onClick={() => handleViewDetails(event)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {deleteConfirm && (
        <div className="org-modal-overlay" onClick={() => setDeleteConfirm(null)} role="dialog" aria-modal="true">
          <div className="org-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Event?</h3>
            <p>Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.</p>
            <div className="org-confirm-actions">
              <button 
                className="org-btn-confirm-delete"
                onClick={() => handleDeleteEvent(deleteConfirm.id)}
                aria-label="Confirm delete"
              >
                Yes, Delete
              </button>
              <button 
                className="org-btn-cancel"
                onClick={() => setDeleteConfirm(null)}
                aria-label="Cancel delete"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedEvent && (
        <div className="org-modal-overlay" onClick={handleCloseModal} role="dialog" aria-modal="true">
          <div className="org-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="org-modal-close"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="org-modal-header">
              <img
                src={selectedEvent.imageUrl || defaultImages[selectedEvent.category] || defaultImages["Other"]}
                alt={`${selectedEvent.title} event`}
                className="org-modal-image"
              />
              <h2>{selectedEvent.title}</h2>
              <span className="org-category-badge">{selectedEvent.category}</span>
            </div>

            <div className="org-modal-body">
              <div className="org-event-info">
                <p><strong>Description:</strong> {selectedEvent.description}</p>
                
                {/* 🆕 Updated Date/Time Display */}
                <p>
                  <strong>Start:</strong> {formatDateDDMMYYYY(selectedEvent.startDate)} at {formatTimeAMPM(selectedEvent.startTime || '00:00')}
                </p>
                <p>
                  <strong>End:</strong> {formatDateDDMMYYYY(selectedEvent.endDate || selectedEvent.startDate)} at {formatTimeAMPM(selectedEvent.endTime || '23:59')}
                </p>
                
                <p><strong>Location:</strong> {selectedEvent.location || "Not specified"}</p>
                <p>
                  <strong>Type:</strong>
                  <span className={`org-type-badge org-type-${selectedEvent.eventType?.toLowerCase()}`}>
                    {selectedEvent.eventType || "PUBLIC"}
                  </span>
                </p>

                {selectedEvent.eventType === "PRIVATE" && selectedEvent.privateCode && (
                  <p>
                    <strong>Private Code:</strong>
                    <span className="org-private-code">{selectedEvent.privateCode}</span>
                  </p>
                )}

                <p>
                  <strong>Attendees:</strong> {selectedEvent.currentAttendees || 0} /{" "}
                  {selectedEvent.maxAttendees || "Unlimited"}
                </p>

                <p>
                  <strong>Status:</strong>
                  <span
                    className={`org-status-badge org-status-${
                      new Date(`${selectedEvent.startDate}T${selectedEvent.startTime || '00:00'}`) > new Date() ? "upcoming" : "completed"
                    }`}
                  >
                    {new Date(`${selectedEvent.startDate}T${selectedEvent.startTime || '00:00'}`) > new Date() ? "Upcoming" : "Completed"}
                  </span>
                </p>
              </div>
            </div>

            <div className="org-modal-footer">
              <button className="org-btn-close" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ CreateEventForm Component ============
function CreateEventForm({ editingEvent, onCancel, onSuccess }) {
  const [venues, setVenues] = useState([]);           // ← Move here
  const [selectedVenue, setSelectedVenue] = useState(null);  // ← Move here
  const [venueLoading, setVenueLoading] = useState(false);   // ← Move here
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    state: "",
    city: "",
    address: "",
    category: "",
    imageUrl: "",
    maxAttendees: "",
    eventType: "PUBLIC",
    privateCode: "",
    venueId: null  // ✅ ADD THIS LINE
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const stateCityData = {
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    Delhi: ["New Delhi"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "West Bengal": ["Kolkata", "Siliguri", "Howrah"],
    Rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
    Punjab: ["Amritsar", "Ludhiana", "Chandigarh"]
  };

  const eventCategories = [
    "Music", "Technology", "Sports", "Art", "Business", 
    "Education", "Food", "Health", "Travel", "Entertainment", "Other"
  ];

  const defaultImages = {
    "Music": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    "Technology": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
    "Art": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
    "Business": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    "Education": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
    "Food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    "Health": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    "Travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
    "Entertainment": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&h=300&fit=crop",
    "Other": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop"
  };

  useEffect(() => {
    if (editingEvent) {
      // 🆕 Parse location
      const { address, city, state } = parseLocation(editingEvent.location);

      setFormData({
        title: editingEvent.title || "",
        description: editingEvent.description || "",
        startDate: editingEvent.startDate || "",
        endDate: editingEvent.endDate || editingEvent.startDate || "",
        startTime: editingEvent.startTime || "",
        endTime: editingEvent.endTime || "",
        state: state,
        city: city,
        address: address,
        category: editingEvent.category || "",
        imageUrl: editingEvent.imageUrl || "",
        maxAttendees: editingEvent.maxAttendees || "",
        eventType: editingEvent.eventType || "PUBLIC",
        privateCode: editingEvent.privateCode || ""
      });
      
      if (editingEvent.imageUrl) {
        setImagePreview(editingEvent.imageUrl);
      }
    }
  }, [editingEvent]);

  // ADD THIS NEW useEffect:
  useEffect(() => {
    fetchVenues();  // ← Fetch venues when component loads
  }, []);

  const fetchVenues = async () => {
    try {
      setVenueLoading(true);
      const response = await getActiveVenues();
      setVenues(response);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setError("Failed to load venues");
    } finally {
      setVenueLoading(false);
    }
  };

  const handleVenueSelect = (venueId) => {
  if (!venueId) {
    setSelectedVenue(null);
    setFormData(prev => ({
      ...prev,
      venueId: null,
      address: "",
      city: "",
      state: ""
    }));
    return;
  }

  const venue = venues.find(v => v.id === parseInt(venueId));
  if (venue) {
    setSelectedVenue(venue);
    
    // Parse location: "address, city, state"
    const locationParts = venue.location?.split(", ") || [];
    
    setFormData(prev => ({
      ...prev,
      venueId: venue.id,
      address: locationParts[0] || venue.address || "",
      city: venue.city || locationParts[locationParts.length - 2] || "",
      state: venue.state || locationParts[locationParts.length - 1] || ""
    }));
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (error) {
      setError("");
    }

    if (name === "state") {
      setFormData(prev => ({ ...prev, city: "" }));
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    await handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const formDataImg = new FormData();
      formDataImg.append('file', file);
      
      const response = await API.post('/uploads', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
      console.log("✅ Image uploaded successfully:", response.data.url);
    } catch (err) {
      console.error("❌ Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
      setImagePreview(null);
      setImageFile(null);
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = "Event title is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }
    
    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }
    
    if (!formData.startTime) {
      errors.startTime = "Start time is required";
    }
    
    if (!formData.endTime) {
      errors.endTime = "End time is required";
    }
    
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    // 🆕 Validate DateTime using utility
    const dateTimeValidation = validateDateTime(
      formData.startDate,
      formData.endDate,
      formData.startTime,
      formData.endTime
    );
    
    if (!dateTimeValidation.isValid) {
      Object.assign(errors, dateTimeValidation.errors);
    }
    
    if (formData.maxAttendees && (isNaN(formData.maxAttendees) || parseInt(formData.maxAttendees) <= 0)) {
      errors.maxAttendees = "Max attendees must be a positive number";
    }
    
    if (formData.eventType === "PRIVATE" && !formData.privateCode.trim()) {
      errors.privateCode = "Private code is required for private events";
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill out all required fields correctly");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      // 🆕 Build location from state, city, address
      let location = formData.address.trim();
      if (formData.city) {
        location += `, ${formData.city}`;
      }
      if (formData.state) {
        location += `, ${formData.state}`;
      }

      const requestData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        state: formData.state,        // ✅ ADD
        city: formData.city,          // ✅ ADD
        address: formData.address,    // ✅ ADD
        category: formData.category,
        imageUrl: formData.imageUrl || defaultImages[formData.category] || defaultImages["Other"],
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        eventType: formData.eventType,
        privateCode: formData.eventType === "PRIVATE" ? formData.privateCode : null,
        venueId: formData.venueId || null  // ✅ ADD THIS LINE
      };

      if (editingEvent) {
        await API.put(`/events/${editingEvent.id}`, requestData);
        onSuccess("Event updated successfully!");
      } else {
        await API.post("/events", requestData);
        onSuccess("Event created successfully!");
      }
      
    } catch (err) {
      console.error("Error saving event:", err);
      
      if (err.response?.data && typeof err.response.data === 'object') {
        const errorMessages = Object.values(err.response.data).join(", ");
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || "Failed to save event");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="org-create-event-wrapper">
      <div className="org-form-header">
        <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
        <p className="org-form-subtitle">Fill in the details below to {editingEvent ? "update" : "create"} your event</p>
      </div>
      
      {error && <div className="org-alert org-alert-error" role="alert">{error}</div>}

      <form className="org-event-form" onSubmit={handleSubmit} noValidate>
        <div className="org-form-section">
          <label className="org-form-label">Event Image</label>
          <div className="org-image-upload-area">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageSelect}
              className="org-file-input"
              id="org-image-upload"
              disabled={uploading}
              aria-label="Upload event image"
            />
            <label htmlFor="org-image-upload" className="org-upload-label">
              <ImagePlus size={20}/>
              {uploading ? "Uploading..." : (imagePreview ? "Change Image" : "Upload Image")}
            </label>
            {imagePreview && (
              <div className="org-image-preview">
                <img src={imagePreview} alt="Event preview" />
              </div>
            )}
            <small className="org-form-hint">
              Upload an image or leave empty to use a default image based on category (Max 5MB)
            </small>
          </div>
        </div>

        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">Category *</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`org-form-input ${fieldErrors.category ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.category}
            >
              <option value="">Select Category</option>
              {eventCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <span className="org-error-message" role="alert">{fieldErrors.category}</span>
            )}
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">Event Name *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event name"
              className={`org-form-input ${fieldErrors.title ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.title}
            />
            {fieldErrors.title && (
              <span className="org-error-message" role="alert">{fieldErrors.title}</span>
            )}
          </div>
        </div>

        <div className="org-form-group">
          <label className="org-form-label">Description *</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Event description"
            rows="3"
            className={`org-form-textarea ${fieldErrors.description ? 'org-error-field' : ''}`}
            aria-required="true"
            aria-invalid={!!fieldErrors.description}
          />
          {fieldErrors.description && (
            <span className="org-error-message" role="alert">{fieldErrors.description}</span>
          )}
        </div>

        {/* 🆕 VENUE SELECTION - ADD THIS SECTION */}
        <div className="org-form-group">
          <label className="org-form-label">
            Select Venue (Optional)
            {venueLoading && <span className="org-loading-inline"> Loading...</span>}
          </label>
          
          <select
            name="venueId"
            value={formData.venueId || ""}
            onChange={(e) => handleVenueSelect(e.target.value)}
            className="org-form-input"
            disabled={venueLoading}
            aria-label="Select venue"
          >
            <option value="">No Venue (Enter address manually)</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name} - {venue.location} (Capacity: {venue.capacity})
              </option>
            ))}
          </select>
          
          {selectedVenue && (
            <div className="org-venue-info-preview">
              <p className="org-venue-info-title">✓ Selected Venue Details:</p>
              <p><strong>Name:</strong> {selectedVenue.name}</p>
              <p><strong>Location:</strong> {selectedVenue.location}</p>
              <p><strong>Capacity:</strong> {selectedVenue.capacity} people</p>
              {selectedVenue.amenities && (
                <p><strong>Amenities:</strong> {selectedVenue.amenities}</p>
              )}
            </div>
          )}
          
          <small className="org-form-hint">
            Select a venue to auto-fill address details, or leave empty to enter manually
          </small>
        </div>

        <div className="org-form-group">
          <label className="org-form-label">Address *</label>
          <textarea 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter venue details, landmark, or address"
            rows="2"
            className={`org-form-textarea ${fieldErrors.address ? 'org-error-field' : ''}`}
            aria-required="true"
            aria-invalid={!!fieldErrors.address}
          />
          {fieldErrors.address && (
            <span className="org-error-message" role="alert">{fieldErrors.address}</span>
          )}
        </div>

        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="org-form-input"
              aria-label="Select state"
            >
              <option value="">Select State</option>
              {Object.keys(stateCityData).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
              className="org-form-input"
              aria-label="Select city"
            >
              <option value="">Select City</option>
              {formData.state &&
                stateCityData[formData.state].map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* 🆕 Date & Time Inputs */}
        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">Start Date *</label>
            <input 
              type="date" 
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={getTomorrowDate()}
              className={`org-form-input ${fieldErrors.startDate ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.startDate}
            />
            {fieldErrors.startDate && (
              <span className="org-error-message" role="alert">{fieldErrors.startDate}</span>
            )}
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">End Date *</label>
            <input 
              type="date" 
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || getTomorrowDate()}
              className={`org-form-input ${fieldErrors.endDate ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.endDate}
            />
            {fieldErrors.endDate && (
              <span className="org-error-message" role="alert">{fieldErrors.endDate}</span>
            )}
          </div>
        </div>

        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">Start Time *</label>
            <input 
              type="time" 
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`org-form-input ${fieldErrors.startTime ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.startTime}
            />
            {fieldErrors.startTime && (
              <span className="org-error-message" role="alert">{fieldErrors.startTime}</span>
            )}
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">End Time *</label>
            <input 
              type="time" 
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`org-form-input ${fieldErrors.endTime ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.endTime}
            />
            {fieldErrors.endTime && (
              <span className="org-error-message" role="alert">{fieldErrors.endTime}</span>
            )}
          </div>
        </div>

        {/* 🆕 Date/Time Preview Section */}
        {formData.startDate && formData.startTime && formData.endDate && formData.endTime && (
          <div className="org-datetime-preview">
            <strong>📅 Event Schedule Preview:</strong>
            <p>
              <CalendarDays size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              <strong>Starts:</strong> {formatDateDDMMYYYY(formData.startDate)} at {formatTimeAMPM(formData.startTime)}
            </p>
            <p>
              <CalendarDays size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              <strong>Ends:</strong> {formatDateDDMMYYYY(formData.endDate)} at {formatTimeAMPM(formData.endTime)}
            </p>
          </div>
        )}

        <div className="org-form-grid-2">
          <div className="org-form-group">
            <label className="org-form-label">Max Attendees</label>
            <input 
              type="number" 
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="1"
              className={`org-form-input ${fieldErrors.maxAttendees ? 'org-error-field' : ''}`}
              aria-label="Maximum number of attendees"
            />
            {fieldErrors.maxAttendees && (
              <span className="org-error-message" role="alert">{fieldErrors.maxAttendees}</span>
            )}
          </div>
          
          <div className="org-form-group">
            <label className="org-form-label">Event Type *</label>
            <select 
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="org-form-input"
              aria-label="Select event type"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        {formData.eventType === "PRIVATE" && (
          <div className="org-form-group">
            <label className="org-form-label">Private Code *</label>
            <input 
              type="text" 
              name="privateCode"
              value={formData.privateCode}
              onChange={handleChange}
              placeholder="Enter private access code"
              className={`org-form-input ${fieldErrors.privateCode ? 'org-error-field' : ''}`}
              aria-required="true"
              aria-invalid={!!fieldErrors.privateCode}
            />
            {fieldErrors.privateCode && (
              <span className="org-error-message" role="alert">{fieldErrors.privateCode}</span>
            )}
            <small className="org-form-hint">
              Attendees will need this code to register for the event
            </small>
          </div>
        )}

        <div className="org-form-actions">
          <button type="submit" className="org-btn-primary" disabled={loading || uploading}>
            <Save size={16} />
            {loading ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
          </button>
          <button 
            type="button" 
            className="org-btn-secondary"
            onClick={onCancel}
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ============ Profile Component ============
function Profile({ onCancel, onSuccess }) {
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    role: "",
    mobileNumber: "",
    imageUrl: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🆕 Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/users/profile");
      setProfile(response.data);
      if (response.data.imageUrl) {
        setImagePreview(response.data.imageUrl);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    await handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
      console.log("✅ Profile image uploaded successfully:", response.data.url);
    } catch (err) {
      console.error("❌ Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      
      // Update profile information
      const profileData = {
        name: profile.name,
        mobileNumber: profile.mobileNumber,
        profileImage: profile.imageUrl
      };

      const response = await API.put("/users/profile", profileData);
      setProfile(response.data);
      if (response.data.imageUrl) {
        setImagePreview(response.data.imageUrl);
      }
      
      // 🆕 If password fields are filled, update password separately
      if (passwordForm.currentPassword && passwordForm.newPassword) {
        try {
          await API.put("/users/password", {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          });
          
          onSuccess("Profile and password updated successfully!");
          setPasswordForm({ currentPassword: "", newPassword: "" });
        } catch (passErr) {
          console.error("Error updating password:", passErr);
          setError(passErr.response?.data || "Failed to update password");
          setLoading(false);
          return;
        }
      } else {
        onSuccess("Profile updated successfully!");
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.id) {
    return <div className="org-loading-spinner">Loading profile...</div>;
  }

  return (
    <div className="org-profile-container">
      {error && <div className="org-alert org-alert-error" role="alert">{error}</div>}

      {!isEditing ? (
        <div className="org-profile-view-card">
          <div className="org-profile-avatar-wrapper">
            <img 
              src={imagePreview || "/src/assets/EZ-logo1.png"} 
              alt={`${profile.name}'s profile`}
              className="org-profile-avatar"
            />
          </div>
          <div className="org-profile-details">
            <h3 className="org-profile-name">{profile.name}</h3>
            <p className="org-profile-email">{profile.email}</p>
            <span className="org-role-badge">{profile.role}</span>
            <div className="org-profile-meta">
              <div className="org-meta-item">
                <span className="org-meta-label">Mobile:</span>
                <span className="org-meta-value">{profile.mobileNumber || "Not provided"}</span>
              </div>
            </div>
          </div>
          <button className="org-btn-primary" onClick={() => setIsEditing(true)}>
            <Edit size={16} />
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="org-profile-edit-form" onSubmit={handleSubmit}>
          {/* Profile Image Upload - Full Width */}
          <div className="org-form-group org-full-width">
            <label className="org-form-label">Profile Image</label>
            <div className="org-image-upload-area org-image-upload-area2">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageSelect}
                className="org-file-input"
                id="org-profile-image-upload"
                disabled={uploading}
                aria-label="Upload profile image"
              />
              <label htmlFor="org-profile-image-upload" className="org-upload-label org-upload-label2">
                <ImagePlus size={20}/>{uploading ? "Uploading..." : (imagePreview ? "" : "Upload Image")}
              </label>
              {imagePreview && (
                <div className="org-image-preview org-profile-preview">
                  <img src={imagePreview} alt="Profile preview" />
                </div>
              )}
            </div>
          </div>

          {/* Two-Column Layout for Form Fields */}
          <div className="org-form-row">
            <div className="org-form-col">
              <label className="org-form-label">Name *</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="org-form-input"
                required
                aria-required="true"
              />
            </div>
            
            <div className="org-form-col">
              <label className="org-form-label">Email (Cannot be changed)</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="org-form-input org-disabled"
                aria-label="Email address (read-only)"
              />
            </div>
          </div>

          <div className="org-form-row">
            <div className="org-form-col">
              <label className="org-form-label">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={profile.mobileNumber || ""}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="org-form-input"
                aria-label="Mobile number"
              />
            </div>
            
            <div className="org-form-col">
              <label className="org-form-label">Role</label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="org-form-input org-disabled"
                aria-label="User role (read-only)"
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="org-password-section">
            <p className="org-section-subtitle">Leave empty to keep your current password</p>
            
            <div className="org-form-row">
              <div className="org-form-col">
                <label className="org-form-label">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                  className="org-form-input"
                  aria-label="Current password"
                />
              </div>
              
              <div className="org-form-col">
                <label className="org-form-label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="Enter new password (min 6 characters)"
                  className="org-form-input"
                  aria-label="New password"
                />
              </div>
            </div>
          </div>
          
          <div className="org-form-actions">  
            <button type="submit" className="org-btn-primary" disabled={loading || uploading}>
              <Save size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="org-btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setError("");
                setPasswordForm({ currentPassword: "", newPassword: "" });
                fetchProfile();
                onCancel();
              }}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ============ Main Dashboard Component ============
export default function OrganizerDashboard() {
  const navigate = useNavigate();
  
  const [activePage, setActivePage] = useState("myEvents");
  const [toast, setToast] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 🆕 Mobile menu state
  const [organizerId, setOrganizerId] = useState(null); // 🆕 For analytics

  const [showRegistrations, setShowRegistrations] = useState(null);
  const [showTicketPreview, setShowTicketPreview] = useState(null);
  const [showVenueMap, setShowVenueMap] = useState(null);

  // 🆕 Get organizer ID from localStorage or API
  useEffect(() => {
    const fetchOrganizerId = async () => {
      try {
        const response = await API.get("/users/profile");
        setOrganizerId(response.data.id);
      } catch (err) {
        console.error("Error fetching organizer ID:", err);
      }
    };
    fetchOrganizerId();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setActivePage("createEvent");
    setMobileMenuOpen(false); // Close mobile menu
  };

  const handleCreateEventSuccess = (message) => {
    setToast({ message, type: 'success' });
    setEditingEvent(null);
    setActivePage("myEvents");
  };

  const handleCancelForm = () => {
    setEditingEvent(null);
    setActivePage("myEvents");
  };

  const handleProfileSuccess = (message) => {
    setToast({ message, type: 'success' });
  };

  const handleProfileCancel = () => {
    setActivePage("myEvents");
  };

  // 🆕 Handle navigation with mobile menu close
  const handleNavigation = (page) => {
    setActivePage(page);
    setEditingEvent(null);
    setMobileMenuOpen(false);
  };

  const handleExportCSV = async (eventId, eventTitle) => {
    try {
      const response = await API.get(
        `/organizer/events/${eventId}/export?format=csv`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${eventTitle}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      setToast({ message: "Failed to export CSV", type: "error" });
    }
  };

  return (
    <div className="org-dashboard">
      {/* 🆕 Mobile Menu Toggle Button */}
      <button 
        className="org-mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 🆕 Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="org-mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav className={`org-top-navbar ${mobileMenuOpen ? 'org-mobile-menu-open' : ''}`}>
        <div className="org-navbar-brand">
          <span className="org-brand-icon">
            <img src="/src/assets/EZ-logo1.png" alt="EventZen logo" className="org-logo-img" />
          </span>
          <span className="org-brand-text">EventZen Organizer</span>
        </div>
        <ul className="org-nav-menu" role="menubar">
          <li 
            onClick={() => handleNavigation("myEvents")}
            className={activePage === "myEvents" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigation("myEvents")}
          >
            <Calendar size={18} className="org-nav-icon" />
            <span>My Events</span>
          </li>
          <li 
            onClick={() => handleNavigation("createEvent")}
            className={activePage === "createEvent" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigation("createEvent")}
          >
            <ImagePlus size={18} className="org-nav-icon" />
            <span>Create Event</span>
          </li>
          
          {/* 🆕 NEW: Calendar Menu Item */}
          <li 
            onClick={() => handleNavigation("calendar")}
            className={activePage === "calendar" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigation("calendar")}
          >
            <Calendar size={18} className="org-nav-icon" />
            <span>Calendar View</span>
          </li>
          
          <li 
            onClick={() => handleNavigation("analytics")}
            className={activePage === "analytics" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigation("analytics")}
          >
            <ChartBarStacked size={18} className="org-nav-icon" />
            <span>Analytics</span>
          </li>
          <li 
            onClick={() => handleNavigation("profile")}
            className={activePage === "profile" ? "org-nav-item org-active" : "org-nav-item"}
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigation("profile")}
          >
            <User size={18} className="org-nav-icon" />
            <span>Profile</span>
          </li>
          <li 
            onClick={handleLogout} 
            className="org-nav-item org-logout"
            role="menuitem"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleLogout()}
          >
            <LogOut size={18} className="org-nav-icon" />
            <span>Logout</span>
          </li>
      </ul>
      </nav>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <main className="org-dashboard-main" role="main">
        {activePage === "myEvents" && (
          <MyEvents
            onEditEvent={handleEditEvent}
            setShowRegistrations={setShowRegistrations}
            setShowTicketPreview={setShowTicketPreview}
            handleExportCSV={handleExportCSV}
            setShowVenueMap={setShowVenueMap}  
          />
        )}
        
        {activePage === "createEvent" && (
          <CreateEventForm
            editingEvent={editingEvent}
            onCancel={handleCancelForm}
            onSuccess={handleCreateEventSuccess}
          />
        )}

        {activePage === "calendar" && (
          <OrganizerCalendarPage />
        )}

        {activePage === "analytics" && (
          <AnalyticsDashboard organizerId={organizerId} />
        )}
        
        {activePage === "profile" && (
          <Profile
            onCancel={handleProfileCancel}
            onSuccess={handleProfileSuccess}
          />
        )}
      </main>

      {/* ================= MODALS ================= */}

      {showRegistrations && (
        <ViewRegistrations
          eventId={showRegistrations.id}
          eventTitle={showRegistrations.title}
          onClose={() => setShowRegistrations(null)}
        />
      )}

      {showTicketPreview && (
        <TicketPreviewModal
          eventId={showTicketPreview.id}
          eventTitle={showTicketPreview.title}
          onClose={() => setShowTicketPreview(null)}
        />
      )}

      {showVenueMap && (
        <VenueMapPreview
          venueId={showVenueMap}
          onClose={() => setShowVenueMap(null)}
        />
      )}

    </div>
  );
}