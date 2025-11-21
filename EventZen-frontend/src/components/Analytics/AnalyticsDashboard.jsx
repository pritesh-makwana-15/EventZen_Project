import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import API from "../../services/api";
import SummaryCards from "./SummaryCards";
import CategoryChart from "./CategoryChart";
import MonthlyTrendsChart from "./MonthlyTrendsChart";
import OrganizerPerformanceChart from "./OrganizerPerformanceChart";
// import "../../styles/Admin Dashborad/Analytics.css";
import "../../styles/Analytics.css";

/**
 * Main Analytics Dashboard Component
 * Handles both Admin and Organizer views
 * 
 * Props:
 * - userRole: "ADMIN" or "ORGANIZER"
 * - organizerId: (optional) Current organizer's ID
 */
export default function AnalyticsDashboard({ userRole, organizerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Admin data
  const [adminSummary, setAdminSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

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
        // Fetch admin analytics
        const [summaryRes, categoriesRes, trendsRes] = await Promise.all([
          API.get("/analytics/admin/summary"),
          API.get("/analytics/admin/categories"),
          API.get("/analytics/admin/monthly-trends"),
        ]);

        setAdminSummary(summaryRes.data);
        setCategories(categoriesRes.data);
        setMonthlyTrends(trendsRes.data);
      } else if (userRole === "ORGANIZER" && organizerId) {
        // Fetch organizer analytics
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

  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader className="analytics-spinner" size={40} />
        <p>Loading analytics...</p>
      </div>
    );
  }

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
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>{userRole === "ADMIN" ? "Platform Overview" : "Your Performance"}</p>
      </div>

      {/* ADMIN VIEW */}
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
                <h3>Event Categories</h3>
                <CategoryChart data={categories} />
              </div>
            )}

            {/* Monthly Trends */}
            {monthlyTrends.length > 0 && (
              <div className="analytics-chart-card">
                <h3>Monthly Registrations</h3>
                <MonthlyTrendsChart data={monthlyTrends} />
              </div>
            )}
          </div>

          {/* Organizer Performance Table */}
          <div className="analytics-table-section">
            <h3>Top Organizers</h3>
            <div className="analytics-table-placeholder">
              <p>Organizer performance data will be displayed here</p>
            </div>
          </div>
        </div>
      )}

      {/* ORGANIZER VIEW */}
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
            <h3>Your Top Events</h3>
            {organizerPerformance.topEvents && organizerPerformance.topEvents.length > 0 ? (
              <div className="analytics-events-list">
                {organizerPerformance.topEvents.map((event, idx) => (
                  <div key={idx} className="analytics-event-item">
                    <div className="event-rank">#{idx + 1}</div>
                    <div className="event-info">
                      <h4>{event.eventTitle}</h4>
                      <p>{event.registrations} Registrations</p>
                    </div>
                    <div className="event-rate">
                      <span className="rate-value">{event.attendanceRate}%</span>
                      <span className="rate-label">Attendance</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="analytics-no-data">No events yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}