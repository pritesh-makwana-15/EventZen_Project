// src/pages/Events.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Events styling/EventsPage.css";
import { fetchAllEvents } from "../services/events";
import { registerForEvent } from "../services/registrations";

export default function Events() {
  const navigate = useNavigate();
  
  // State Management
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  
  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  // Check if user is logged in
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  // Fetch all events on component mount - NO TOKEN REQUIRED
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Fetch events without authentication (public endpoint)
      const data = await fetchAllEvents();
      setEvents(data);
      setFilteredEvents(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      // If 401 error, still try to show events (they might be public)
      if (err.response?.status === 401) {
        setError("Please login to see all events.");
      } else {
        setError("Failed to load events. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, categoryFilter, locationFilter, events]);

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(event => 
        event.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(event => 
        event.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  // Reset filters
  const handleReset = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setLocationFilter("");
  };

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Details Button Click - ALLOW WITHOUT LOGIN
  const handleDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  // Handle Register Button Click - REQUIRES LOGIN
  const handleRegister = async (eventId) => {
    // Check if user is logged in - REDIRECT IF NOT
    if (!token) {
      alert("Please login to register for events.");
      navigate("/login");
      return;
    }

    // Check if user is a visitor
    if (role !== "VISITOR") {
      alert("Only visitors can register for events.");
      return;
    }

    try {
      await registerForEvent(eventId, userId);
      alert("Registration successful!");
      setShowModal(false);
      loadEvents();
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.message || "Failed to register. Please try again.");
    }
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  if (loading) {
    return (
      <div className="events-page">
        {/* HEADER */}
        <header className="navbar">
          <div className="logo">
            <Link to="/" className="logo-link">
              <span className="logo-icon">🎉</span>
              <span className="logo-text">EventZen</span>
            </Link>
          </div>
          <nav className="nav-menu">
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/about">About Us</Link>
            {token && role === "VISITOR" && <Link to="/visitor-dashboard">Dashboard</Link>}
            {token && role === "ORGANIZER" && <Link to="/organizer-dashboard">Dashboard</Link>}
            {token && role === "ADMIN" && <Link to="/admin-dashboard">Dashboard</Link>}
          </nav>
          <div className="nav-actions">
            {!token && (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
            {token && <button onClick={handleLogout}>Logout</button>}
          </div>
        </header>

        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="footer-logo-icon">🎉</span>
              <span className="footer-logo-text">EventZen</span>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} EventZen. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        {/* HEADER */}
        <header className="navbar">
          <div className="logo">
            <Link to="/" className="logo-link">
              <span className="logo-icon">🎉</span>
              <span className="logo-text">EventZen</span>
            </Link>
          </div>
          <nav className="nav-menu">
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/about">About Us</Link>
            {token && role === "VISITOR" && <Link to="/visitor-dashboard">Dashboard</Link>}
            {token && role === "ORGANIZER" && <Link to="/organizer-dashboard">Dashboard</Link>}
            {token && role === "ADMIN" && <Link to="/admin-dashboard">Dashboard</Link>}
          </nav>
          <div className="nav-actions">
            {!token && (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
            {token && <button onClick={handleLogout}>Logout</button>}
          </div>
        </header>

        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadEvents} className="retry-btn">Retry</button>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="footer-logo-icon">🎉</span>
              <span className="footer-logo-text">EventZen</span>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} EventZen. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="events-page">
      {/* ===== HEADER/NAVBAR ===== */}
      <header className="navbar">
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🎉</span>
            <span className="logo-text">EventZen</span>
          </Link>
        </div>

        <nav className="nav-menu">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/about">About Us</Link>

          {token && role === "VISITOR" && <Link to="/visitor-dashboard">Dashboard</Link>}
          {token && role === "ORGANIZER" && <Link to="/organizer-dashboard">Dashboard</Link>}
          {token && role === "ADMIN" && <Link to="/admin-dashboard">Dashboard</Link>}
        </nav>

        <div className="nav-actions">
          {!token && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
          {token && (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-content-events">
        <h1 className="page-title">Upcoming Events</h1>

        {/* ===== FILTERS SECTION ===== */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Music">Music</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Food">Food</option>
            <option value="Dance">Dance</option>
            <option value="Art">Art</option>
            <option value="Sports">Sports</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Wellness">Wellness</option>
            <option value="Literature">Literature</option>
            <option value="Comedy">Comedy</option>
            <option value="Photography">Photography</option>
            <option value="Fashion">Fashion</option>
            <option value="Gaming">Gaming</option>
            <option value="Adventure">Adventure</option>
            <option value="Science">Science</option>
            <option value="Cultural">Cultural</option>
            <option value="Festival">Festival</option>
            <option value="Theatre">Theatre</option>
            <option value="Travel">Travel</option>
            <option value="Environment">Environment</option>
          </select>

          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">All Locations</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Pune">Pune</option>
            <option value="Chennai">Chennai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Goa">Goa</option>
            <option value="Kolkata">Kolkata</option>
          </select>

          <div className="filter-actions">
            <button onClick={handleReset} className="reset-btn">Reset</button>
          </div>
        </div>

        {/* ===== EVENTS GRID ===== */}
        {currentEvents.length === 0 ? (
          <div className="no-events">
            <p>No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="event-grid">
            {currentEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  <img 
                    src={event.imageUrl || `https://picsum.photos/400/300?random=${event.id}`} 
                    alt={event.title} 
                  />
                  <span className="event-tag">{event.type || "Public"}</span>
                </div>

                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p><strong>Category:</strong> {event.category}</p>
                  <p><strong>Date:</strong> {formatDate(event.eventDate)} {formatTime(event.eventTime)}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Attendance:</strong> {event.currentParticipants || 0} / {event.maxParticipants || "Unlimited"}</p>
                </div>

                <div className="event-actions">
                  <button 
                    onClick={() => handleRegister(event.id)}
                    className="register-btn"
                  >
                    Register
                  </button>
                  <button 
                    onClick={() => handleDetails(event)}
                    className="details-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={currentPage === index + 1 ? "page-btn active" : "page-btn"}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ===== EVENT DETAILS MODAL - VIEWABLE WITHOUT LOGIN ===== */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            
            <img 
              src={selectedEvent.imageUrl || `https://picsum.photos/600/400?random=${selectedEvent.id}`} 
              alt={selectedEvent.title}
              className="modal-image"
            />
            
            <div className="modal-content">
              <h2>{selectedEvent.title}</h2>
              <p className="modal-description">{selectedEvent.description}</p>
              
              <div className="modal-info">
                <div className="info-item">
                  <strong>Category:</strong> {selectedEvent.category}
                </div>
                <div className="info-item">
                  <strong>Date:</strong> {formatDate(selectedEvent.eventDate)}
                </div>
                <div className="info-item">
                  <strong>Time:</strong> {formatTime(selectedEvent.eventTime)}
                </div>
                <div className="info-item">
                  <strong>Location:</strong> {selectedEvent.location}
                </div>
                <div className="info-item">
                  <strong>Organizer:</strong> {selectedEvent.organizerName || "EventZen"}
                </div>
                <div className="info-item">
                  <strong>Participants:</strong> {selectedEvent.currentParticipants || 0} / {selectedEvent.maxParticipants || "Unlimited"}
                </div>
                <div className="info-item">
                  <strong>Type:</strong> {selectedEvent.type || "Public"}
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={closeModal} className="close-btn">
                  Close
                </button>
                <button 
                  onClick={() => handleRegister(selectedEvent.id)}
                  className="register-btn"
                >
                  {token ? "Register Now" : "Login to Register"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="footer-logo-icon">🎉</span>
            <span className="footer-logo-text">EventZen</span>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} EventZen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}