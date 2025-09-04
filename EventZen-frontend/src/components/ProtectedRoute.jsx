// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If role is provided and doesn't match user's role, redirect to unauthorized page or home
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
