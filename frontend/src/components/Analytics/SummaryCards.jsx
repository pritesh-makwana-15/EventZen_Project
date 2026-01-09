import React from "react";
import { Users, Calendar, UserCheck, TrendingUp } from "lucide-react";

/** 
 * Summary Cards Component
 * Displays key metrics in card format
 * 
 * Props (optional):
 * - totalUsers: Total platform users
 * - totalEvents: Total events
 * - totalRegistrations: Total registrations
 * - avgAttendance: Average attendance rate (for organizers)
 */
export default function SummaryCards({
  totalUsers,
  totalEvents,
  totalRegistrations,
  avgAttendance,
}) {
  const cards = [];

  // Admin cards
  if (totalUsers !== undefined) {
    cards.push({
      id: "users",
      icon: Users,
      label: "Total Users",
      value: totalUsers,
      color: "card-blue",
    });
  }

  if (totalEvents !== undefined) {
    cards.push({
      id: "events",
      icon: Calendar,
      label: "Total Events",
      value: totalEvents,
      color: "card-purple",
    });
  }

  if (totalRegistrations !== undefined) {
    cards.push({
      id: "registrations",
      icon: UserCheck,
      label: "Total Registrations",
      value: totalRegistrations,
      color: "card-green",
    });
  }

  // Organizer card
  if (avgAttendance !== undefined) {
    cards.push({
      id: "attendance",
      icon: TrendingUp,
      label: "Avg Attendance Rate",
      value: `${avgAttendance}%`,
      color: "card-orange",
    });
  }

  return (
    <div className="summary-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={`summary-card ${card.color}`}>
            <div className="card-icon">
              <Icon size={28} />
            </div>
            <div className="card-content">
              <p className="card-label">{card.label}</p>
              <h3 className="card-value">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}