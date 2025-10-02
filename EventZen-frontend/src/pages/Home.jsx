// src/pages/Home.jsx
import React from "react";
import "../styles/main pages/Home.css";
import { Link } from "react-router-dom";

export default function Home() {
  // Check login status
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  const categories = [
    { name: "Music", description: "Concerts, DJ Nights, Music Festivals", img: "./src/assets/Music.jpg" },
    { name: "Education", description: "Seminars, Workshops, Webinars", img: "./src/assets/Education.jpg" },
    { name: "Sports", description: "Tournaments, Marathons, Matches", img: "./src/assets/Sports.jpg" },
    { name: "Art & Culture", description: "Exhibitions, Theatre, Literature", img: "./src/assets/Art & Culture.jpg" },
    { name: "Wellness", description: "Yoga Sessions, Meditation Camps", img: "./src/assets/Wellness.jpg" },
    { name: "Technology", description: "Hackathons, Tech Talks, Meetups", img: "./src/assets/Technology.jpg" },
    { name: "Business", description: "Conferences, Networking Events", img: "./src/assets/Business.jpg" },
    { name: "Celebration", description: "Parties, Weddings, Ceremonies", img: "./src/assets/Celebration.jpg" }
  ];

  return (
    <div className="home-container">
      {/* ===== HEADER/NAVBAR ===== */}
      <header className="navbar">
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🎉</span>
            <span className="logo-text">EventZen</span>
          </Link>
        </div>

        <nav className="nav-menu">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/about">About Us</Link>

          {token && role === "VISITOR" && <Link to="/visitor/dashboard">Dashboard</Link>}
          {token && role === "ORGANIZER" && <Link to="/organizer/dashboard">Dashboard</Link>}
          {token && role === "ADMIN" && <Link to="/admin/dashboard">Dashboard</Link>}
        </nav>

        <div className="nav-actions">
          {!token && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
          {token && (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Plan, Discover & Join Events with Ease</h1>
              <p>EventZen is your one-stop platform for managing and exploring events.</p>
              <Link to="/events" className="cta-btn">Browse Events</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="categories">
        <h2>Event Categories</h2>
        <div className="category-grid">
          {categories.map((cat, index) => (
            <div key={index} className="category-card">
              <img src={cat.img} alt={cat.name} />
              <div className="category-overlay">
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== GALLERY SECTION ===== */}
      <section className="gallery">
        <h2>Event Gallery</h2>
        <div className="gallery-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="gallery-card">
              <img 
                src={`https://picsum.photos/400/300?random=${i}`} 
                alt={`Event ${i + 1}`} 
              />
              <p>Event {i + 1}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT US SECTION ===== */}
      <section className="about-us">
        <h2>About Us</h2>
        <p>
          EventZen is designed to simplify event management for organizers and make discovering
          exciting events easier for attendees. Whether you're hosting a conference, music festival,
          or sports competition, EventZen helps you connect with your audience effortlessly.
        </p>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="footer-logo-icon">🎉</span>
            <span className="footer-logo-text">EventZen</span>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} EventZen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}