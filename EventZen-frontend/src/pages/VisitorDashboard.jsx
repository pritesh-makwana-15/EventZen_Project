// src/pages/VisitorDashboard.jsx
import React, { useState } from "react";
import "../styles/Visitor page styling/VisitorDashboard.css";
import VisitorSidebar from "../components/Visitor dashboard/VisitorSidebar";
import EventCard from "../components/Events/EventCard";
import MyRegistrations from "../components/Visitor dashboard/MyRegistrations";
import ProfileCard from "../components/ProfileCard";
import Filters from "../components/Events/Filters";
import Footer from "../components/Footer";
import eventsData from "../data/eventsData";

export default function VisitorDashboard() {
  const [activePage, setActivePage] = useState("events");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  // Modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Events state
  const [events, setEvents] = useState(eventsData);

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
  const upcomingEvents = events
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

  // Apply search, category, and location filters
  const filteredEvents = upcomingEvents.filter((event) => {
    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (categoryFilter ? event.category === categoryFilter : true) &&
      (locationFilter ? event.location === locationFilter : true)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);

  return (
    <div className="visitor-dashboard">
      {/* Sidebar */}
      <VisitorSidebar setActivePage={setActivePage} activePage={activePage} />

      <main className="main-content">
        {/* Events Page */}
        {activePage === "events" && (
          <section className="events-page">
            <h2>Upcoming Events</h2>

            {/* Filters Section */}
            <Filters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
            />

            {/* Event Cards */}
            <div className="event-grid">
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={handleRegisterToggle}
                    onDetails={setSelectedEvent}
                  />
                ))
              ) : (
                <p className="no-events-msg">No upcoming events found.</p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}

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
          </section>
        )}

        {/* My Registrations */}
        {activePage === "registrations" && (
          <MyRegistrations
            events={events.filter((e) => e.registered)}
            handleToggle={handleRegisterToggle}
          />
        )}

        {/* Profile */}
        {activePage === "profile" && <ProfileCard />}
      </main>

      <Footer />
    </div>
  );
}
