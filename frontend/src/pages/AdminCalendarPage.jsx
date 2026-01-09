// ================================================================
// FILE: D:\EventZen-frontend\src\pages\admin\AdminCalendarPage.jsx
// Admin Calendar Page - Wraps calendar with existing dashboard layout
// ================================================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, LogOut, Menu, X } from "lucide-react";
import CalendarView from "../components/calendar/CalendarView";
import "../styles/main pages/calendar.css";
// import { logout } from "../../services/api";
import { logout } from "../services/api";

const AdminCalendarPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderSidebar = () => (
    <div className={`ad-sidebarAdmin ${sidebarOpen ? 'ad-open' : ''}`}>
      <button 
        className="ad-sidebar-close-btn"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        <X size={24} />
      </button>

      <div className="ad-logo-section">
        <div className="ad-logo-box">
          <img src="/src/assets/EZ-logo1.png" alt="logo" className="ad-logo-img-admin" />
        </div>
        <span className="ad-logo-text">EventZen</span>
      </div>

      <nav className="ad-nav-links">
        <button
          className="ad-nav-btn"
          onClick={() => {
            navigate("/admin/dashboard");
            setSidebarOpen(false);
          }}
          aria-label="Back to Dashboard"
        >
          <Calendar size={20} /> Dashboard
        </button>
        <button
          className="ad-nav-btn ad-active"
          onClick={() => setSidebarOpen(false)}
          aria-label="Calendar View"
        >
          <Calendar size={20} />
          <div className="ad-nav-btn-content">
            <span>Calendar</span>
          </div>
        </button>
      </nav>
    </div>
  );

  const renderTopbar = () => (
    <div className="ad-topbar">
      <button 
        className="ad-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>
      
      <h1>Calendar View</h1>
      <div className="ad-topbar-actions">
        <button className="ad-btn-primary" onClick={handleLogout} aria-label="Logout">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="ad-dashboard">
      {sidebarOpen && (
        <div 
          className="ad-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {renderSidebar()}
      
      <div className="ad-main">
        {renderTopbar()}
        <div className="ad-content ad-calendar-content">
          <CalendarView />
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarPage;