import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

/**
 * Category Distribution Pie Chart
 * 
 * Props:
 * - data: Array of {category, count}
 */
export default function CategoryChart({ data }) {
  // Color palette for pie chart
  const COLORS = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#00f2fe",
    "#43e97b",
    "#fa709a",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#48dbfb",
  ];

  if (!data || data.length === 0) {
    return <div className="chart-empty">No category data available</div>;
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={500}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} events`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}