import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * Monthly Registration Trends Line Chart
 * 
 * Props:
 * - data: Array of {month, year, monthName, count}
 */
export default function MonthlyTrendsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No trend data available</div>;
  }

  // Format data for chart display
  const chartData = data.map((item) => ({
    name: `${item.monthName.substring(0, 3)} ${item.year}`,
    registrations: item.count,
    month: item.month,
    year: item.year,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
          formatter={(value) => [`${value} registrations`, "Registrations"]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="registrations"
          stroke="#667eea"
          strokeWidth={2}
          dot={{ fill: "#667eea", r: 5 }}
          activeDot={{ r: 7 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}