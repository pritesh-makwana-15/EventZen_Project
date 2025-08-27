// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import {
  Home,
  Users,
  Calendar,
  UserPlus,
  User,
  LogOut,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import "../styles/Admin Dashborad/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("events");

  // ===== Sample Visitors (10) =====
  const sampleVisitors = [
    { id: 1, name: "John Smith", email: "john@example.com", phone: "+1 234-567-8901", registeredEvents: 3 },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 234-567-8902", registeredEvents: 1 },
    { id: 3, name: "Michael Brown", email: "michael@example.com", phone: "+1 234-567-8903", registeredEvents: 5 },
    { id: 4, name: "Emily Davis", email: "emily@example.com", phone: "+1 234-567-8904", registeredEvents: 2 },
    { id: 5, name: "Daniel Wilson", email: "daniel@example.com", phone: "+1 234-567-8905", registeredEvents: 4 },
    { id: 6, name: "Sophia Taylor", email: "sophia@example.com", phone: "+1 234-567-8906", registeredEvents: 6 },
    { id: 7, name: "James Martinez", email: "james@example.com", phone: "+1 234-567-8907", registeredEvents: 2 },
    { id: 8, name: "Olivia Garcia", email: "olivia@example.com", phone: "+1 234-567-8908", registeredEvents: 3 },
    { id: 9, name: "William Anderson", email: "william@example.com", phone: "+1 234-567-8909", registeredEvents: 7 },
    { id: 10, name: "Ava Thomas", email: "ava@example.com", phone: "+1 234-567-8910", registeredEvents: 1 },
  ];

  // ===== Sample Organizers (10) =====
  const sampleOrganizers = [
    { id: 1, name: "Jane Doe", role: "Senior Designer", email: "jane@eventzen.com", password: "••••••••", eventsCreated: 8 },
    { id: 2, name: "Mark Evans", role: "Event Manager", email: "mark@eventzen.com", password: "••••••••", eventsCreated: 12 },
    { id: 3, name: "Laura Chen", role: "Marketing Lead", email: "laura@eventzen.com", password: "••••••••", eventsCreated: 6 },
    { id: 4, name: "Chris Johnson", role: "Coordinator", email: "chris@eventzen.com", password: "••••••••", eventsCreated: 4 },
    { id: 5, name: "Nina Patel", role: "Senior Planner", email: "nina@eventzen.com", password: "••••••••", eventsCreated: 10 },
    { id: 6, name: "David Lee", role: "Event Strategist", email: "david@eventzen.com", password: "••••••••", eventsCreated: 9 },
    { id: 7, name: "Sophie Müller", role: "Project Manager", email: "sophie@eventzen.com", password: "••••••••", eventsCreated: 11 },
    { id: 8, name: "Liam Scott", role: "Designer", email: "liam@eventzen.com", password: "••••••••", eventsCreated: 5 },
    { id: 9, name: "Emma Davis", role: "Coordinator", email: "emma@eventzen.com", password: "••••••••", eventsCreated: 3 },
    { id: 10, name: "Noah Wilson", role: "Senior Manager", email: "noah@eventzen.com", password: "••••••••", eventsCreated: 14 },
  ];

  // ===== Sample Events (10) =====
  const sampleEvents = [
    { id: 1, name: "Tech Conference 2024", organizer: "Jane Doe", date: "2024-09-15", attendees: 150, status: "Active" },
    { id: 2, name: "Design Meetup", organizer: "Mark Evans", date: "2024-10-05", attendees: 80, status: "Active" },
    { id: 3, name: "Startup Pitch Day", organizer: "Laura Chen", date: "2024-11-20", attendees: 120, status: "Completed" },
    { id: 4, name: "Healthcare Expo", organizer: "Chris Johnson", date: "2024-12-02", attendees: 200, status: "Active" },
    { id: 5, name: "AI Workshop", organizer: "Nina Patel", date: "2025-01-10", attendees: 60, status: "Upcoming" },
    { id: 6, name: "Music Festival", organizer: "David Lee", date: "2025-02-18", attendees: 500, status: "Upcoming" },
    { id: 7, name: "Gaming Convention", organizer: "Sophie Müller", date: "2025-03-12", attendees: 350, status: "Upcoming" },
    { id: 8, name: "Food & Wine Fair", organizer: "Liam Scott", date: "2025-04-07", attendees: 250, status: "Active" },
    { id: 9, name: "Art Expo", organizer: "Emma Davis", date: "2025-05-22", attendees: 100, status: "Upcoming" },
    { id: 10, name: "Green Energy Summit", organizer: "Noah Wilson", date: "2025-06-15", attendees: 180, status: "Upcoming" },
  ];

  const [newOrganizer, setNewOrganizer] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
  });

  const handleCreateOrganizer = (e) => {
    e.preventDefault();
    console.log("Creating organizer:", newOrganizer);
    setNewOrganizer({ name: "", role: "", email: "", password: "" });
  };

  // ===== Sidebar =====
  const renderSidebar = () => (
    <div className="sidebar">
      <div className="logo-section">
        <div className="logo-box">
          <img src="../src/assets/EZ-logo1.png" alt="logo" className="logo-img" />
        </div>
        <span className="logo-text">EventZen</span>
      </div>

      <nav className="nav-links">
        <button className={`nav-btn ${activeSection === "events" ? "active" : ""}`} onClick={() => setActiveSection("events")}>
          <Calendar size={18} /> Events
        </button>
        <button className={`nav-btn ${activeSection === "organizers" ? "active" : ""}`} onClick={() => setActiveSection("organizers")}>
          <User size={18} /> Organizers
        </button>
        <button className={`nav-btn ${activeSection === "visitors" ? "active" : ""}`} onClick={() => setActiveSection("visitors")}>
          <Users size={18} /> Visitors
        </button>
        <button className={`nav-btn ${activeSection === "create-organizer" ? "active" : ""}`} onClick={() => setActiveSection("create-organizer")}>
          <UserPlus size={18} /> Request Organizer
        </button>
      </nav>
    </div>
  );

  // ===== Topbar =====
  const renderTopbar = () => (
    <div className="topbar">
      <h1>Admin Dashboard</h1>
      <div className="topbar-actions">
        <button className="btn-outline">Profile</button>
        <button className="btn-primary">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  // ===== Visitors =====
  const renderVisitors = () => (
    <div className="content">
      <div className="card">
        <h2>Visitors</h2>
        <table>
          <thead>
            <tr>
              <th>Visitor Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Events</th>
              <th>Delete</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleVisitors.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.name}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>{v.registeredEvents}</td>
                <td><Trash2 size={14} color="red" /></td>
                <td><MoreHorizontal size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== Organizers =====
  const renderOrganizers = () => (
    <div className="content">
      <div className="card">
        <h2>Organizers</h2>
        <table>
          <thead>
            <tr>
              <th>Organizer Id</th>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Password</th>
              <th>Events</th>
              <th>Delete</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleOrganizers.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.name}</td>
                <td>{o.role}</td>
                <td>{o.email}</td>
                <td>{o.password}</td>
                <td>{o.eventsCreated}</td>
                <td><Trash2 size={14} color="red" /></td>
                <td><MoreHorizontal size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== Events =====
  const renderEvents = () => (
    <div className="content">
      <div className="card">
        <h2>Events</h2>
        <table>
          <thead>
            <tr>
              <th>Event Id</th>
              <th>Name</th>
              <th>Organizer</th>
              <th>Date</th>
              <th>Attendees</th>
              <th>Status</th>
              <th>Delete</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleEvents.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.name}</td>
                <td>{e.organizer}</td>
                <td>{e.date}</td>
                <td>{e.attendees}</td>
                <td>{e.status}</td>
                <td><Trash2 size={14} color="red" /></td>
                <td><MoreHorizontal size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== Create Organizer Form =====
  const renderCreateOrganizer = () => (
    <div className="content">
      <div className="card form-card">
        <h2>Create New Organizer</h2>
        <form onSubmit={handleCreateOrganizer}>
          <label>Full Name</label>
          <input
            type="text"
            value={newOrganizer.name}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, name: e.target.value })}
          />
          <label>Role</label>
          <select
            value={newOrganizer.role}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, role: e.target.value })}
          >
            <option value="">Select Role</option>
            <option value="Event Manager">Event Manager</option>
            <option value="Senior Designer">Senior Designer</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Planner">Planner</option>
          </select>
          <label>Email</label>
          <input
            type="email"
            value={newOrganizer.email}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, email: e.target.value })}
          />
          <label>Password</label>
          <input
            type="password"
            value={newOrganizer.password}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, password: e.target.value })}
          />
          <div className="form-actions">
            <button type="button" className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">
              <UserPlus size={16} /> Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ===== Content Switcher =====
  const renderContent = () => {
    switch (activeSection) {
      case "visitors":
        return renderVisitors();
      case "organizers":
        return renderOrganizers();
      case "events":
        return renderEvents();
      case "create-organizer":
        return renderCreateOrganizer();
      default:
        return renderVisitors();
    }
  };

  return (
    <div className="dashboard">
      {renderSidebar()}
      <div className="main">
        {renderTopbar()}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
