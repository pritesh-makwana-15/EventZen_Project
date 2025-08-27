// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/main pages/Header.css";

export default function Header() {
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
        </nav>

        {/* Action Buttons */}
        <div className="nav-buttons">
          <Link to="/login"><button className="back-btn">Login</button></Link>
          <Link to="/register"><button className="signup-btn">Sign Up</button></Link>
        </div>
      </div>
    </header>
  );
}
