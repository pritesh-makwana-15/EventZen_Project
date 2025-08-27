import React, { useState } from "react";
import "../styles/Events styling/Events.css";
import EventCard from "../components/Events/EventCard";
import Filters from "../components/Events/Filters";
import Footer from "../components/Footer";

export default function EventPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [events, setEvents] = useState([
      {
        id: 1,
        title: "Music Fest 2025",
        category: "Music",
        date: "2025-09-01",
        time: "18:00",
        location: "Mumbai",
        organizer: "ABC Entertainment",
        participants: 200,
        type: "Public",
        image: "../src/assets/Music.jpg",
        registered: false,
      },
      {
        id: 2,
        title: "Tech Conference",
        category: "Technology",
        date: "2025-09-05",
        time: "10:00",
        location: "Delhi",
        organizer: "TechWorld",
        participants: 500,
        type: "Private",
        image: "../src/assets/Technology.jpg",
        registered: false,
      },
      {
        id: 3,
        title: "Startup Meetup",
        category: "Business",
        date: "2025-09-10",
        time: "15:00",
        location: "Bangalore",
        organizer: "StartupHub",
        participants: 100,
        type: "Public",
        image: "../src/assets/Business.jpg",
        registered: false,
      },
      {
        id: 4,
        title: "Art Exhibition",
        category: "Art",
        date: "2025-09-12",
        time: "11:00",
        location: "Delhi",
        organizer: "ArtWorld",
        participants: 150,
        type: "Private",
        image: "../src/assets/Art & Culture.jpg",
        registered: false,
      },
      {
        id: 5,
        title: "Food Carnival",
        category: "Food",
        date: "2025-09-15",
        time: "13:00",
        location: "Mumbai",
        organizer: "Foodies",
        participants: 300,
        type: "Public",
        image: "../src/assets/Art & Culture.jpg",
        registered: false,
      },
      {
        id: 6,
        title: "Dance Workshop",
        category: "Dance",
        date: "2025-09-20",
        time: "17:00",
        location: "Pune",
        organizer: "Dance Academy",
        participants: 50,
        type: "Public",
        image: "../src/assets/Music.jpg",
        registered: false,
      },
      {
        id: 7,
        title: "AI Summit",
        category: "Technology",
        date: "2025-09-22",
        time: "09:00",
        location: "Hyderabad",
        organizer: "AI Forum",
        participants: 400,
        type: "Private",
        image: "../src/assets/Technology.jpg",
        registered: false,
      },
      {
        id: 8,
        title: "Film Festival",
        category: "Entertainment",
        date: "2025-09-25",
        time: "19:00",
        location: "Chennai",
        organizer: "CinemaClub",
        participants: 250,
        type: "Public",
        image: "../src/assets/Celebration.jpg",
        registered: false,
      },
      {
        id: 9,
        title: "Yoga Retreat",
        category: "Wellness",
        date: "2025-09-28",
        time: "06:00",
        location: "Goa",
        organizer: "WellnessHub",
        participants: 80,
        type: "Private",
        image: "../src/assets/Wellness.jpg",
        registered: false,
      },
      {
        id: 10,
        title: "Hackathon 2025",
        category: "Technology",
        date: "2025-10-01",
        time: "08:00",
        location: "Pune",
        organizer: "Hackers Inc",
        participants: 200,
        type: "Public",
        image: "../src/assets/Technology.jpg",
        registered: false,
      },
      {
        id: 11,
        title: "Book Fair",
        category: "Literature",
        date: "2025-10-03",
        time: "10:00",
        location: "Kolkata",
        organizer: "BookWorld",
        participants: 120,
        type: "Public",
        image: "../src/assets/Art & Culture.jpg",
        registered: false,
      },
      {
        id: 12,
        title: "Stand-up Comedy",
        category: "Comedy",
        date: "2025-10-05",
        time: "20:00",
        location: "Delhi",
        organizer: "LaughClub",
        participants: 180,
        type: "Private",
        image: "../src/assets/event4.jpg",
        registered: false,
      },
      {
        id: 13,
        title: "Photography Workshop",
        category: "Photography",
        date: "2025-10-08",
        time: "14:00",
        location: "Mumbai",
        organizer: "PhotoHub",
        participants: 60,
        type: "Public",
        image: "../src/assets/event1.jpg",
        registered: false,
      },
      {
        id: 14,
        title: "Robotics Expo",
        category: "Technology",
        date: "2025-10-10",
        time: "09:00",
        location: "Delhi",
        organizer: "RoboTech",
        participants: 300,
        type: "Public",
        image: "../src/assets/Technology.jpg",
        registered: false,
      },
      {
        id: 15,
        title: "Fashion Show",
        category: "Fashion",
        date: "2025-10-12",
        time: "18:00",
        location: "Bangalore",
        organizer: "FashionHub",
        participants: 250,
        type: "Private",
        image: "../src/assets/Art & Culture.jpg",
        registered: false,
      },
      {
        id: 16,
        title: "Coding Bootcamp",
        category: "Technology",
        date: "2025-10-15",
        time: "09:00",
        location: "Chennai",
        organizer: "CodeWorld",
        participants: 100,
        type: "Public",
        image: "../src/assets/Technology.jpg",
        registered: false,
      },
      {
        id: 17,
        title: "Startup Pitch",
        category: "Business",
        date: "2025-10-18",
        time: "16:00",
        location: "Mumbai",
        organizer: "VC Hub",
        participants: 70,
        type: "Private",
        image: "../src/assets/Business.jpg",
        registered: false,
      },
      {
        id: 18,
        title: "Charity Marathon",
        category: "Sports",
        date: "2025-10-20",
        time: "07:00",
        location: "Hyderabad",
        organizer: "NGO Group",
        participants: 500,
        type: "Public",
        image: "../src/assets/Sports.jpg",
        registered: false,
      },
      {
        id: 19,
        title: "Science Fair",
        category: "Education",
        date: "2025-10-22",
        time: "11:00",
        location: "Delhi",
        organizer: "EduWorld",
        participants: 200,
        type: "Private",
        image: "../src/assets/Education.jpg",
        registered: false,
      },
      {
        id: 20,
        title: "Gaming Convention",
        category: "Gaming",
        date: "2025-10-25",
        time: "12:00",
        location: "Pune",
        organizer: "GameHub",
        participants: 300,
        type: "Public",
        image: "../src/assets/event3.jpg",
        registered: false,
      },
    ]);

  // Toggle Register
  const handleRegisterToggle = (id) => {
    setEvents(
      events.map((ev) =>
        ev.id === id ? { ...ev, registered: !ev.registered } : ev
      )
    );
  };

  // Filtered Events
  const filteredEvents = events.filter((event) => {
    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (categoryFilter ? event.category === categoryFilter : true) &&
      (locationFilter ? event.location === locationFilter : true)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);

  return (
    <div className="event-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">EventZen</div>
        <nav>
          <a href="/">Home</a>
          <a href="/events">Events</a>
          <a href="/login">Login</a>
          <a href="/signup">Sign Up</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h2>Upcoming Events</h2>

        {/* Filters */}
        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
        />

        {/* Event Grid */}
        <div className="event-grid">
          {currentEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegisterToggle}
              onDetails={setSelectedEvent}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        {/* Modal */}
        {selectedEvent && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{selectedEvent.title}</h2>
              <img src={selectedEvent.image} alt={selectedEvent.title} />
              <p><strong>Category:</strong> {selectedEvent.category}</p>
              <p><strong>Date:</strong> {selectedEvent.date} at {selectedEvent.time}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              <p><strong>Participants Limit:</strong> {selectedEvent.participants}</p>
              <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
              <p><strong>Type:</strong> {selectedEvent.type}</p>

              <div className="modal-actions">
                <button onClick={() => setSelectedEvent(null)}>Back</button>
                <button
                  onClick={() => handleRegisterToggle(selectedEvent.id)}
                  className={selectedEvent.registered ? "unregister-btn" : "register-btn"}
                >
                  {selectedEvent.registered ? "Unregister" : "Register"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
