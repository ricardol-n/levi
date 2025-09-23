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
    // Logged in but not admin → kick to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
