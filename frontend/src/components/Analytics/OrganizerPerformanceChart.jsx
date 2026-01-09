import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * Organizer Performance Bar Chart
 * Displays top events by registration count
 * 
 * Props:
 * - data: Array of top events {eventId, eventTitle, registrations, attendanceRate}
 */
export default function OrganizerPerformanceChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No performance data available</div>;
  }

  // Truncate long event titles for display
  const chartData = data.map((item) => ({
    name: item.eventTitle.length > 20 
      ? item.eventTitle.substring(0, 20) + "..." 
      : item.eventTitle,
    registrations: item.registrations,
    attendance: item.attendanceRate,
    fullTitle: item.eventTitle,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          stroke="#666"
          style={{ fontSize: "12px" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="#666"
          style={{ fontSize: "12px" }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
          }}
          formatter={(value) => [value, "Value"]}
          labelFormatter={(label) => `Registrations: ${label}`}
        />
        <Legend />
        <Bar dataKey="registrations" fill="#667eea" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}