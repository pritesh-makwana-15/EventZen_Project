// src/components/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/main pages/Header.css";

export default function Header() {
  const navigate = useNavigate();

  // Get token and role from localStorage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="nav-container">
        {/* Logo Section */}
        <div className="logo">
          <img src="../src/assets/EZ-logo1.png" alt="logo" className="logo-img" />
          <span className="header-logo-text">EventZen</span>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/events" className="nav-link">Events</Link>
          <Link to="/" className="nav-link">Gallery</Link>
          <Link to="/" className="nav-link">About Us</Link>

          {/* Role-based Links */}
          {token && role === "VISITOR" && (
            <Link to="/visitor/dashboard" className="nav-link">Dashboard</Link>
          )}
          {token && role === "ORGANIZER" && (
            <Link to="/organizer/dashboard" className="nav-link">Dashboard</Link>
          )}
          {token && role === "ADMIN" && (
            <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="nav-buttons">
          {!token && (
            <>
              <Link to="/login"><button className="back-btn">Login</button></Link>
              <Link to="/register"><button className="signup-btn">Sign Up</button></Link>
            </>
          )}

          {token && (
            <button className="back-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
