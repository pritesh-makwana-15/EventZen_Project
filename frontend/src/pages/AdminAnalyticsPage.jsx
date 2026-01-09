// ================================================================
// FILE: src/pages/AdminAnalyticsPage.jsx
// 🆕 NEW: Wrapper component to integrate AnalyticsDashboard into Admin Dashboard
// Purpose: Pass correct props and handle organizer click redirects
// ================================================================

import React from "react";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";

/**
 * Admin Analytics Page Component
 * Wraps the AnalyticsDashboard component with ADMIN role
 * This component is displayed when admin clicks "Analytics" in sidebar
 */
const AdminAnalyticsPage = () => {
  return (
    <div className="ad-content">
      <div className="analytics-header">
        <h3>📊 Analytics Dashboard</h3>
        <p>Platform Overview & Insights</p>
      </div>
      
      {/* Pass userRole as ADMIN, no organizerId needed */}
      <AnalyticsDashboard 
        userRole="ADMIN" 
        organizerId={null} 
      />
    </div>
  );
};

export default AdminAnalyticsPage;