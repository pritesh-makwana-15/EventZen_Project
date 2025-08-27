import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Events styling/EventCard.css";
// import "../styles/EventCard.css";

export default function EventCard({ event }) {
  return (
    <div className="event-card">
      <img src={event.image} alt={event.title} className="event-image" />
      <div className="event-info">
        <h3>{event.title}</h3>
        <p>{event.category} | {event.date}</p>
        <Link to={`/events/${event.id}`} className="details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

// import React from "react";

// export default function EventCard({ event, onRegister, onDetails }) {
//   return (
//     <div className="event-card">
//       {/* Image + Tag */}
//       <div className="event-top">
//         <img src={event.image} alt={event.title} />
//         <span className="event-tag">{event.type}</span>
//       </div>

//       {/* Details */}
//       <div className="event-details">
//         <h3>{event.title}</h3>
//         <p><strong>Category:</strong> {event.category}</p>
//         <p><strong>Date:</strong> {event.date} at {event.time}</p>
//         <p><strong>Location:</strong> {event.location}</p>
//         <p><strong>Participants:</strong> {event.participants}</p>
//         <p><strong>Organizer:</strong> {event.organizer}</p>
//       </div>

//       {/* Actions */}
//       <div className="event-actions">
//         <button
//           onClick={() => onRegister(event.id)}
//           className={event.registered ? "unregister-btn" : "register-btn"}
//         >
//           {event.registered ? "Unregister" : "Register"}
//         </button>
//         <button onClick={() => onDetails(event)} className="details-btn">
//           View Details
//         </button>
//       </div>
//     </div>
//   );
// }
