import React, { useState, useEffect } from "react";
import "../styles/Visitor page styling/VisitorDashboard.css";
import VisitorSidebar from "../components/Visitor dashboard/VisitorSidebar";
import EventCard from "../components/Events/EventCard";
import MyRegistrations from "../components/Visitor dashboard/MyRegistrations";
import ProfileCard from "../components/ProfileCard";
import Filters from "../components/Events/Filters";
import Footer from "../components/Footer";
import { fetchAllEvents } from "../services/events";
import { registerForEvent, cancelRegistration } from "../services/registrations";

export default function VisitorDashboard() {
  const [activePage, setActivePage] = useState("events");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchAllEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const handleRegisterToggle = async (event) => {
    try {
      if (event.registered) {
        await cancelRegistration(event.registrationId);
        setEvents(events.map((ev) =>
          ev.id === event.id ? { ...ev, registered: false } : ev
        ));
      } else {
        await registerForEvent({ eventId: event.id });
        setEvents(events.map((ev) =>
          ev.id === event.id ? { ...ev, registered: true } : ev
        ));
      }
    } catch (err) {
      console.error("Error toggling registration", err);
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="visitor-dashboard">
      <VisitorSidebar setActivePage={setActivePage} activePage={activePage} />

      <main className="main-content">
        {loading ? (
          <p>Loading events...</p>
        ) : activePage === "events" ? (
          <section className="events-page">
            <h2>Upcoming Events</h2>
            <Filters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
            />
            <div className="event-grid">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={() => handleRegisterToggle(event)}
                    onDetails={setSelectedEvent}
                  />
                ))
              ) : (
                <p>No events found</p>
              )}
            </div>
          </section>
        ) : activePage === "registrations" ? (
          <MyRegistrations
            events={events.filter((e) => e.registered)}
            handleToggle={handleRegisterToggle}
          />
        ) : (
          <ProfileCard />
        )}
      </main>

      <Footer />
    </div>
  );
}
