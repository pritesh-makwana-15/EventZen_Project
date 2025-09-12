// src/pages/OrganizerDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MyEvents from "../components/MyEvents";
import CreateEventForm from "../components/CreateEventForm";
// import Profile from "../components/Profile";
import Profile from "../components/Profile";
import "../styles/Organizer Dashboard/OrganizerDashboard.css";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  
  // State management
  const [activePage, setActivePage] = useState("myEvents");
  const [success, setSuccess] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setActivePage("createEvent");
  };

  const handleCreateEventSuccess = (message) => {
    setSuccess(message);
    setEditingEvent(null);
    setActivePage("myEvents");
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleCancelForm = () => {
    setEditingEvent(null);
    setActivePage("myEvents");
  };

  const handleProfileSuccess = (message) => {
    setSuccess(message);
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleProfileCancel = () => {
    setActivePage("myEvents");
  };

  return (
    <div className="organizer-dashboard">
      {/* Top Navigation */}
      <nav className="top-nav">
        <h2 className="logo">EventZen Organizer</h2>
        <ul>
          <li 
            onClick={() => {
              setActivePage("myEvents");
              setEditingEvent(null);
            }}
            className={activePage === "myEvents" ? "active" : ""}
          >
            My Events
          </li>
          <li 
            onClick={() => {
              setActivePage("createEvent");
              setEditingEvent(null);
            }}
            className={activePage === "createEvent" ? "active" : ""}
          >
            Create Event
          </li>
          <li 
            onClick={() => setActivePage("profile")}
            className={activePage === "profile" ? "active" : ""}
          >
            My Profile
          </li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      {/* Success Messages */}
      {success && <div className="alert success">{success}</div>}

      {/* Page Content */}
      <main className="dashboard-content">
        {activePage === "myEvents" && (
          <MyEvents onEditEvent={handleEditEvent} />
        )}
        
        {activePage === "createEvent" && (
          <CreateEventForm
            editingEvent={editingEvent}
            onCancel={handleCancelForm}
            onSuccess={handleCreateEventSuccess}
          />
        )}
        
        {activePage === "profile" && (
          <Profile
            onCancel={handleProfileCancel}
            onSuccess={handleProfileSuccess}
          />
        )}
      </main>
    </div>
  );
}