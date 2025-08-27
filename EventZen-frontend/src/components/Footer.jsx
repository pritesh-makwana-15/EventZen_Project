// src/components/Footer.jsx
import React from "react";
import "../styles/main pages/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Logo + Name */}
        <div className="footer-logo">
          <img src="../src/assets/EZ-logo1.png" alt="EventZen Logo" className="footer-logo-img" />
          <span className="footer-logo-text">EventZen</span>
        </div>

        {/* Copyright */}
        <p>© {new Date().getFullYear()} EventZen. All rights reserved.</p>
      </div>
    </footer>
  );
}
