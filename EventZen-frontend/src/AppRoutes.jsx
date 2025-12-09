// ================================================================
// FILE: D:\EventZen-frontend\src\AppRoutes.jsx
// UPDATED: Added /visitor/calendar route
// ================================================================

import React from "react";
import { Routes, Route } from "react-router-dom";

// Import your pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventsPage from "./pages/EventsPage";
import VisitorDashboard from "./pages/VisitorDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";

// Calendar pages
import AdminCalendarPage from "./pages/AdminCalendarPage";
import OrganizerCalendarPage from "./pages/OrganizerCalendarPage";
import VisitorCalendarPage from "./pages/VisitorCalendarPage"; // 🆕 NEW

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotpassword" element={<ForgotPasswordPage />} />

      {/* Events */}
      <Route path="/events" element={<EventsPage />} />

      {/* Protected Dashboards */}
      <Route
        path="/visitor/dashboard"
        element={
          <ProtectedRoute role="VISITOR">
            <VisitorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/dashboard"
        element={
          <ProtectedRoute role="ORGANIZER">
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Calendar Routes */}
      <Route
        path="/admin/calendar"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminCalendarPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/calendar"
        element={
          <ProtectedRoute role="ORGANIZER">
            <OrganizerCalendarPage />
          </ProtectedRoute>
        }
      />

      {/* 🆕 NEW: Visitor Calendar Route */}
      <Route
        path="/visitor/calendar"
        element={
          <ProtectedRoute role="VISITOR">
            <VisitorCalendarPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}