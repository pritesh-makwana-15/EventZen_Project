import React, { useState, useEffect } from "react";
import { Loader, TrendingUp, Users, Calendar, Award } from "lucide-react";
import API from "../../services/api";
import SummaryCards from "./SummaryCards";
import CategoryChart from "./CategoryChart";
import MonthlyTrendsChart from "./MonthlyTrendsChart";
import "../../styles/Analytics.css";

/**
 * 🎨 PREMIUM Analytics Dashboard Component
 * 
 * Features:
 * - Glassmorphism design
 * - Smooth animations
 * - Responsive layout
 * - Enhanced loading states
 * - Beautiful data visualization
 */
export default function AnalyticsDashboard({ userRole, organizerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Admin data
  const [adminSummary, setAdminSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [topOrganizers, setTopOrganizers] = useState([]);

  // Organizer data
  const [organizerPerformance, setOrganizerPerformance] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [userRole, organizerId]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");

      if (userRole === "ADMIN") {
        const [summaryRes, categoriesRes, trendsRes, organizersRes] = await Promise.all([
          API.get("/analytics/admin/summary"),
          API.get("/analytics/admin/categories"),
          API.get("/analytics/admin/monthly-trends"),
          API.get("/analytics/admin/top-organizers"),
        ]);

        setAdminSummary(summaryRes.data);
        setCategories(categoriesRes.data);
        setMonthlyTrends(trendsRes.data);
        setTopOrganizers(organizersRes.data);
      } else if (userRole === "ORGANIZER" && organizerId) {
        const perfRes = await API.get(`/analytics/organizer/${organizerId}/performance`);
        setOrganizerPerformance(perfRes.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader className="analytics-spinner" size={48} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchAnalyticsData} className="analytics-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <h1>
          {userRole === "ADMIN" ? "📊 Analytics Dashboard" : "🎯 Performance Dashboard"}
        </h1>
        <p>{userRole === "ADMIN" ? "Platform Overview & Insights" : "Your Performance Metrics"}</p>
      </div>

      {/* ========== ADMIN VIEW ========== */}
      {userRole === "ADMIN" && (
        <div className="analytics-admin-view">
          {/* Summary Cards */}
          {adminSummary && (
            <SummaryCards
              totalUsers={adminSummary.totalUsers}
              totalEvents={adminSummary.totalEvents}
              totalRegistrations={adminSummary.totalRegistrations}
            />
          )}

          {/* Charts Grid */}
          <div className="analytics-charts-grid">
            {/* Category Distribution */}
            {categories.length > 0 && (
              <div className="analytics-chart-card">
                <h3>📈 Event Categories</h3>
                <CategoryChart data={categories} />
              </div>
            )}

            {/* Monthly Trends */}
            {monthlyTrends.length > 0 && (
              <div className="analytics-chart-card">
                <h3>📅 Monthly Registrations</h3>
                <p style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '-12px', marginBottom: '16px' }}>
                  Last 6 months
                </p>
                <MonthlyTrendsChart data={monthlyTrends} />
              </div>
            )}
          </div>

          {/* Top Organizers Table */}
          <div className="analytics-table-section">
            <h3>🏆 Top Organizers</h3>
            {topOrganizers && topOrganizers.length > 0 ? (
              <div className="analytics-table-wrapper">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Organizer Name</th>
                      <th>Email</th>
                      <th>Total Events</th>
                      <th>Total Registrations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topOrganizers.map((organizer, idx) => (
                      <tr key={organizer.organizerId}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{organizer.organizerName}</strong>
                        </td>
                        <td style={{ color: '#7f8c8d' }}>{organizer.organizerEmail}</td>
                        <td>{organizer.totalEvents}</td>
                        <td>
                          <strong style={{ color: '#667eea', fontSize: '16px' }}>
                            {organizer.totalRegistrations}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="analytics-no-data">
                <p>📭 No organizer data available yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== ORGANIZER VIEW ========== */}
      {userRole === "ORGANIZER" && organizerPerformance && (
        <div className="analytics-organizer-view">
          {/* Performance Cards */}
          <SummaryCards
            totalEvents={organizerPerformance.totalEvents}
            totalRegistrations={organizerPerformance.totalRegistrations}
            avgAttendance={organizerPerformance.averageAttendanceRate}
          />

          {/* Top Events */}
          <div className="analytics-top-events">
            <h3>🌟 Your Top Events</h3>
            {organizerPerformance.topEvents && organizerPerformance.topEvents.length > 0 ? (
              <div className="analytics-events-list">
                {organizerPerformance.topEvents.map((event, idx) => (
                  <div key={idx} className="analytics-event-item">
                    <div className="event-rank">#{idx + 1}</div>
                    <div className="event-info">
                      <h4>{event.eventTitle}</h4>
                      <p>
                        {event.registrations} Registration{event.registrations !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="event-rate">
                      <span className="rate-value">{event.attendanceRate}%</span>
                      <span className="rate-label">Attendance</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="analytics-no-data">
                <p>📭 No events yet. Create your first event to see analytics!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}