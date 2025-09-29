// ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!token || !user) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    // Non-admin trying to access admin panel → send to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && user.role === "admin") {
    // Admin trying to access user routes → send to admin panel
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
