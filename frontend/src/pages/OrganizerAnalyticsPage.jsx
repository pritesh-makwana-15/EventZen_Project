import React, { useEffect, useState } from "react";
import AnalyticsDashboard from "../components/Analytics/AnalyticsDashboard";
import API from "../services/api";

/**
 * Organizer Analytics Page
 * Route: /organizer/dashboard/analytics
 */
export default function OrganizerAnalyticsPage() {
  const [organizerId, setOrganizerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current organizer's ID from profile or token
    const fetchOrganizerId = async () => {
      try {
        const profile = await API.get("/users/profile");
        setOrganizerId(profile.data.id);
      } catch (err) {
        console.error("Error fetching organizer ID:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerId();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="organizer-analytics-page">
      <AnalyticsDashboard userRole="ORGANIZER" organizerId={organizerId} />
    </div>
  );
}