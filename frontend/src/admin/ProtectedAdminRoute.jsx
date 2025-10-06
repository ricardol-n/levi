// src/admin/ProtectedAdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

// helper: decode JWT without verifying signature
const decodeJwt = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch {
    return null;
  }
};

const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));

  if (!adminToken || !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // ⏳ check expiry
  const decoded = decodeJwt(adminToken);
  if (!decoded || decoded.exp * 1000 < Date.now()) {
    console.warn("⚠️ Admin token expired. Redirecting...");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    return <Navigate to="/admin/login" replace />;
  }

  if (adminUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
