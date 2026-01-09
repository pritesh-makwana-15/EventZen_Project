import React from "react";
import "../../styles/Visitor page styling/VisitorSidebar.css";

export default function VisitorSidebar({ setActivePage, activePage }) {
  return (
    <nav className="navbar">
      {/* Logo Section */}
        <div className="logo">
          <img src="../src/assets/EZ-logo1.png" alt="logo" className="logo-img" />
          <span className="header-logo-text">EventZen</span>
        </div>
      <ul>
        <li
          className={activePage === "events" ? "active" : ""}
          onClick={() => setActivePage("events")}
        >
          Events
        </li>
        <li
          className={activePage === "registrations" ? "active" : ""}
          onClick={() => setActivePage("registrations")}
        >
          My Registrations
        </li>
        <li
          className={activePage === "profile" ? "active" : ""}
          onClick={() => setActivePage("profile")}
        >
          Profile
        </li>
        <li>Logout</li>
      </ul>
    </nav>
  );
}
