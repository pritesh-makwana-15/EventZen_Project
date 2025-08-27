import React, { useState } from "react";
import "../styles/Events styling/EventDetails.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function EventDetails() {
  // Dummy event details
  const event = {
    id: 1,
    title: "Tech Conference 2025",
    date: "2025-09-25",
    time: "10:00 AM - 5:00 PM", 
    location: "Bangalore Convention Center",
    description:
      "Join industry leaders and innovators at the biggest tech conference of the year. Engage in workshops, keynotes, and networking opportunities.",
    image:
      "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=1350&q=80",
  };

  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = () => {
    setIsRegistered(true);
    // later → send request to backend
  };

  return (
    <>
    <Header/>
      <div className="event-details">
        {/* Banner */}
        <div className="event-banner">
          <img src={event.image} alt={event.title} />
          <h1>{event.title}</h1>
        </div>

        {/* Info Section */}
        <div className="event-info">
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Time:</strong> {event.time}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p className="event-description">{event.description}</p>
        </div>

        {/* Register Button */}
        <div className="register-section">
          {isRegistered ? (
            <button className="registered-btn" disabled>
              ✅ Registered
            </button>
          ) : (
            <button className="register-btn" onClick={handleRegister}>
              Register Now
            </button>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
}
