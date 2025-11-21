import React from "react";
import AnalyticsDashboard from "../components/Analytics/AnalyticsDashboard";

/**
 * Admin Analytics Page
 * Route: /admin/dashboard/analytics
 */
export default function AdminAnalyticsPage() {
  return (
    <div className="admin-analytics-page">
      <AnalyticsDashboard userRole="ADMIN" />
    </div>
  );
}