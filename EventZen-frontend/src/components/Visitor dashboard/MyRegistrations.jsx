// src/components/MyRegistrations.jsx
import React, { useState } from "react";
import "../../styles/Visitor page styling/MyRegistrations.css";

export default function MyRegistrations() {
  const [events, setEvents] = useState([
    { id: 1, title: "Music Fest", date: "2025-09-01", time: "18:00", category: "Music", registered: true, participants: 200 },
    { id: 2, title: "Tech Conference", date: "2025-09-05", time: "10:00", category: "Technology", registered: false, participants: 500 },
    { id: 3, title: "Startup Meetup", date: "2025-09-10", time: "15:00", category: "Business", registered: true, participants: 100 },
    { id: 4, title: "Art Exhibition", date: "2025-09-12", time: "11:00", category: "Art", registered: false, participants: 150 },
    { id: 5, title: "Food Carnival", date: "2025-09-15", time: "13:00", category: "Food", registered: true, participants: 300 },
    { id: 6, title: "Dance Workshop", date: "2025-09-20", time: "17:00", category: "Dance", registered: false, participants: 50 },
    { id: 7, title: "AI Summit", date: "2025-09-22", time: "09:00", category: "Technology", registered: true, participants: 400 },
    { id: 8, title: "Film Festival", date: "2025-09-25", time: "19:00", category: "Entertainment", registered: false, participants: 250 },
    { id: 9, title: "Yoga Retreat", date: "2025-09-28", time: "06:00", category: "Wellness", registered: true, participants: 80 },
    { id: 10, title: "Hackathon 2025", date: "2025-10-01", time: "08:00", category: "Technology", registered: false, participants: 200 },
  ]);

  const [filter, setFilter] = useState("all");

  const today = new Date();
  const totalEvents = events.length;
  const totalRegistrations = events.filter( (e) => e.registered).length;
  const upcomingCount = events.filter((e) => new Date(e.date) >= today).length;
  const pastCount = totalEvents - upcomingCount;

  // Filtered list
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    if (filter === "upcoming") return eventDate >= today;
    if (filter === "past") return eventDate < today;
    return true; // all
  });

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
            <th>Title</th>
            <th>Date & Time</th>
            <th>Category</th>
            <th>Status</th>
            <th>Registrations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event) => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{event.date} {event.time}</td>
              <td>{event.category}</td>
              <td>{event.registered ? "Registered" : "Not Registered"}</td>
              <td>{event.participants}</td>
              <td>
                <button className="action-btn view">View</button>
                <button
                  className={`action-btn toggle ${event.registered ? "unregister" : "register"}`}
                  onClick={() =>
                    setEvents((prev) =>
                      prev.map((e) =>
                        e.id === event.id ? { ...e, registered: !e.registered } : e
                      )
                    )
                  }
                >
                  {event.registered ? "Unregister" : "Register"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
