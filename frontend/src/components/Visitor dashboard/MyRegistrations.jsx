// src/components/Visitor dashboard/MyRegistrations.jsx
import React, { useState } from "react";
import "../../styles/Visitor page styling/MyRegistrations.css";
import eventsData from "../../data/eventsData"; // import your events data

export default function MyRegistrations() {
  const [events, setEvents] = useState(eventsData);
  const [filter, setFilter] = useState("all");
  const today = new Date();

  // Overview stats
  const totalEvents = events.length;
  const totalRegistrations = events.filter((e) => e.registered).length;
  const upcomingCount = events.filter((e) => new Date(e.date) >= today).length;
  const pastCount = totalEvents - upcomingCount;

  // Filtered list
  let filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    if (filter === "upcoming") return eventDate >= today;
    if (filter === "past") return eventDate < today;
    return true; // all
  });

  // Sort events by date ascending
  filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <section className="my-registrations">
      {/* Overview Stats */}
      <div className="overview">
        <div className="card-mr">
          Total Registrations <span>{totalRegistrations}</span>
        </div>
        <div className="card-mr">
          Upcoming Events <span>{upcomingCount}</span>
        </div>

        {/* Filter Dropdown */}
        <div className="filter-dropdown">
          <label htmlFor="filter">Filter:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
<h3 className="section-title">My Registrations</h3>
<table>
  <thead>
    <tr>
      <th>Event Name</th>
      <th>Category</th>
      <th>Location</th>
      <th>Date & Time</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredEvents
      .filter((event) => event.registered) // only show registered events
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // sort by date
      .map((event) => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate >= new Date();

        return (
          <tr key={event.id}>
            <td>{event.title}</td>
            <td>{event.category}</td>
            <td>{event.location}</td>
            <td>{event.date} {event.time}</td>
            <td>{isUpcoming ? "Upcoming" : "Past"}</td>
            <td>
              {/* View button always */}
              <button
                className="action-btn view"
                onClick={() => window.location.href = `/event/${event.id}`} // redirect to event details
              >
                View
              </button>

              {/* Cancel button only if upcoming */}
              {isUpcoming && (
                <button
                  className="action-btn toggle unregister"
                  onClick={() =>
                    setEvents((prev) =>
                      prev.map((e) =>
                        e.id === event.id ? { ...e, registered: false } : e
                      )
                    )
                  }
                >
                  Cancel
                </button>
              )}
            </td>
          </tr>
        );
      })}
  </tbody>
</table>

    </section>
  );
}
