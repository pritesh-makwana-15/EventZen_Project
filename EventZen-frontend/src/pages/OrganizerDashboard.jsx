// src/pages/OrganizerDashboard.jsx
import React, { useState } from "react";
import "../styles/Organizer Dashboard/OrganizerDashboard.css";

export default function OrganizerDashboard() {
  // Dummy events data
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Music Fest 2025",
      category: "Music",
      date: "2025-09-10",
      status: "Upcoming",
      registrations: 120,
    },
    {
      id: 2,
      title: "Tech Conference",
      category: "Technology",
      date: "2025-10-05",
      status: "Upcoming",
      registrations: 80,
    },
    {
      id: 3,
      title: "Art Exhibition",
      category: "Art",
      date: "2025-08-01",
      status: "Completed",
      registrations: 40,
    },
  ]);

  // Organizer profile state
  const [profile, setProfile] = useState({
    image: "../src/assets/EZ-logo1.png",
    name: "Event Zen",
    email: "eventzen@gmail.com.com",
    password: "********",
    role: "Admin",
  });

  // Profile edit toggle
  const [isEditing, setIsEditing] = useState(false);

  // Page state
  const [activePage, setActivePage] = useState("myEvents");

  // Summary Data
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrations, 0);
  const upcomingCount = events.filter((e) => e.status === "Upcoming").length;
  const pastCount = events.filter((e) => e.status === "Completed").length;

  // Profile change handler
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <div className="organizer-dashboard">
      {/* ===== Top Navigation ===== */}
      <nav className="top-nav">
        <h2 className="logo">EventZen Organizer</h2>
        <ul>
          <li onClick={() => setActivePage("myEvents")}>My Events</li>
          <li onClick={() => setActivePage("createEvent")}>Create Event</li>
          <li onClick={() => setActivePage("profile")}>My Profile</li>
          <li>Logout</li>
        </ul>
      </nav>

      {/* ===== My Events (Overview + Events) ===== */}
      {activePage === "myEvents" && (
        <section className="my-events">
          {/* Overview Stats */}
          <div className="overview">
            <div className="card">
              Total Events <span>{totalEvents}</span>
            </div>
            <div className="card">
              Total Registrations <span>{totalRegistrations}</span>
            </div>
            <div className="card">
              Upcoming Events <span>{upcomingCount}</span>
            </div>
            <div className="card">
              Past Events <span>{pastCount}</span>
            </div>
          </div>

          {/* Events Table */}
          <h3 className="section-title">My Events</h3>
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
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.date}</td>
                  <td>{event.category}</td>
                  <td>{event.status}</td>
                  <td>{event.registrations}</td>
                  <td>
                    <button className="action-btn edit">Edit</button>
                    <button className="action-btn delete">Delete</button>
                    <button className="action-btn view">
                      View Registrations
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ===== Create Event Form ===== */}
      {activePage === "createEvent" && (
        <section className="create-event">
          <h3>Create New Event</h3>
          <form className="event-form">

            <div className="form-group">
              <label>Event Image</label>
              <input type="file" accept="image/*" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input type="text" placeholder="e.g. Music, Tech" />
              </div>
              <div className="form-group">
                <label>Event Name</label>
                <input type="text" placeholder="Enter event name" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Event location" />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select>
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
              <div className="form-group">
                <label>Private Code (if private)</label>
                <input type="text" placeholder="Enter private code" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Participant Limit</label>
                <input type="number" placeholder="Max participants" />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Event description"></textarea>
            </div>

            <button type="submit" className="save-btn">
              Create Event
            </button>
          </form>
        </section>
      )}

      {/* ===== Profile ===== */}
      {activePage === "profile" && (
        <section className="profile-settings">
          <h3>My Profile</h3>
          {!isEditing ? (
            <div className="profile-card">
              <div className="profile-avatar">
                <img src={profile.image} alt="Profile" />
              </div>
              <div className="profile-info">
                <h4>{profile.name}</h4>
                <p>{profile.email}</p>
                <span className="role-tag">{profile.role}</span>
                <div className="profile-meta">
                  <p><strong>Password:</strong> ********</p>
                </div>
              </div>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <form className="profile-form">
              <div className="form-group">
                <label>Profile Image</label>
                <input type="file" accept="image/*" />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={profile.password}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={profile.role} readOnly />
              </div>
              <button
                type="button"
                className="save-btn"
                onClick={() => setIsEditing(false)}
              >
                Save Changes
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
