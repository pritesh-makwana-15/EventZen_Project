import React, { useState } from "react";
import "../styles/Events styling/Events.css";
import "../styles/Events styling/EventsPage.css";
import EventCard from "../components/Events/EventCard";
import Filters from "../components/Events/Filters";
import Footer from "../components/Footer";
import eventsData from "../data/eventsData"; // import events

export default function EventPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  
  const [events, setEvents] = useState(eventsData); // use imported data
  
  // Toggle Register
  const handleRegisterToggle = (id) => {
    setEvents(
      events.map((ev) =>
        ev.id === id ? { ...ev, registered: !ev.registered } : ev
      )
    );
  };

  // Today's date (midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filtered & upcoming events
  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate >= today && // Only upcoming events
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (categoryFilter ? event.category === categoryFilter : true) &&
        (locationFilter ? event.location === locationFilter : true)
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);

  return (
    <div className="event-page">
      {/* Event Page Navbar */}
      <header className="ep-navbar">
        {/* Logo Section */}
        <div className="logo">
          <img src="../src/assets/EZ-logo1.png" alt="logo" className="logo-img" />
          <span className="header-logo-text">EventZen</span>
        </div>
        {/* < div className="ep-logo">EventZen</> */}
        <nav>
          <a href="/" className={window.location.pathname === "/" ? "active" : ""}>Home</a>
          <a href="/events" className={window.location.pathname === "/events" ? "active" : ""}>Events</a>
          <a href="/login" className={window.location.pathname === "/login" ? "active" : ""}>Login</a>
          <a href="/signup" className={window.location.pathname === "/signup" ? "active" : ""}>Sign Up</a>
        </nav>
      </header>


      {/* Main Content */}
      <main className="main-content">
        <h2>Upcoming Events</h2>

        {/* Filters */}
        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
        />

        {/* Event Grid */}
        <div className="event-grid">
          {currentEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegisterToggle}
              onDetails={setSelectedEvent}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        {/* Modal */}
        {selectedEvent && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{selectedEvent.title}</h2>
              <img src={selectedEvent.image} alt={selectedEvent.title} />
              <p><strong>Category:</strong> {selectedEvent.category}</p>
              <p><strong>Date:</strong> {selectedEvent.date} at {selectedEvent.time}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              <p><strong>Participants Limit:</strong> {selectedEvent.participants}</p>
              <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
              <p><strong>Type:</strong> {selectedEvent.type}</p>

              <div className="modal-actions">
                <button onClick={() => setSelectedEvent(null)}>Back</button>
                <button
                  onClick={() => handleRegisterToggle(selectedEvent.id)}
                  className={selectedEvent.registered ? "unregister-btn" : "register-btn"}
                >
                  {selectedEvent.registered ? "Unregister" : "Register"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
