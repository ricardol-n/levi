// src/admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

// =====================================================
// API CONFIG
// =====================================================

const API_BASE = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

// =====================================================
// SHARED REFRESH PROMISE
// =====================================================

let refreshPromise = null;

// =====================================================
// EXTRACT ARRAY
// =====================================================

const extractArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

// =====================================================
// CLEAR ADMIN SESSION
// =====================================================

const clearAdminSession = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminUser");
};

// =====================================================
// REFRESH ADMIN ACCESS TOKEN
// =====================================================

const refreshAdminToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken =
        localStorage.getItem("adminRefreshToken");

      if (!refreshToken) {
        throw new Error(
          "No admin refresh token available."
        );
      }

      console.log(
        "🔄 Refreshing admin access token..."
      );

      const response = await fetch(
        `${API_BASE}/admin/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
          }),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log(
        "🔄 Admin refresh response:",
        response.status,
        data
      );

      if (
        !response.ok ||
        !data?.success ||
        !data?.token
      ) {
        clearAdminSession();

        throw new Error(
          data?.message ||
            "Admin session expired. Please login again."
        );
      }

      localStorage.setItem(
        "adminToken",
        data.token
      );

      if (data.refreshToken) {
        localStorage.setItem(
          "adminRefreshToken",
          data.refreshToken
        );
      }

      console.log(
        "✅ Admin access token refreshed"
      );

      return data.token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// =====================================================
// AUTHENTICATED FETCH
// =====================================================

const authenticatedFetch = async (
  url,
  options = {}
) => {
  let token =
    localStorage.getItem("adminToken");

  /*
   * If the access token is missing,
   * try the refresh token first.
   */

  if (!token) {
    console.log(
      "⚠️ Admin access token missing. Attempting refresh..."
    );

    token = await refreshAdminToken();
  }

  const makeRequest = async (
    accessToken
  ) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization:
          `Bearer ${accessToken}`,
      },
    });
  };

  // ---------------------------------------------------
  // First request
  // ---------------------------------------------------

  let response =
    await makeRequest(token);

  // ---------------------------------------------------
  // Access token expired
  // ---------------------------------------------------

  if (response.status === 401) {
    console.log(
      "⚠️ Admin API returned 401. Refreshing token..."
    );

    token = await refreshAdminToken();

    // Retry exactly once.
    response =
      await makeRequest(token);
  }

  return response;
};

// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  title,
  value,
  type,
  icon,
}) => {
  return (
    <Card
      className={`admin-stat-card ${
        type || ""
      }`}
    >
      <CardContent className="admin-stat-card-content">
        <div className="admin-stat-top">
          <div className="admin-stat-icon">
            {icon}
          </div>
        </div>

        <Typography className="admin-stat-label">
          {title}
        </Typography>

        <Typography className="admin-stat-value">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

// =====================================================
// DASHBOARD
// =====================================================

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    totalInvestments: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // FETCH DASHBOARD DATA
  // ===================================================

  const fetchDashboardStats = async () => {
    try {
      setError("");
      setLoading(true);

      const [
        usersRes,
        withdrawalsRes,
        investmentsRes,
      ] = await Promise.all([
        authenticatedFetch(
          `${API_BASE}/users`
        ),

        authenticatedFetch(
          `${API_BASE}/withdrawals`
        ),

        authenticatedFetch(
          `${API_BASE}/investments`
        ),
      ]);

      // ---------------------------------------------
      // CHECK RESPONSES
      // ---------------------------------------------

      if (!usersRes.ok) {
        throw new Error(
          `Users request failed: ${usersRes.status}`
        );
      }

      if (!withdrawalsRes.ok) {
        throw new Error(
          `Withdrawals request failed: ${withdrawalsRes.status}`
        );
      }

      if (!investmentsRes.ok) {
        throw new Error(
          `Investments request failed: ${investmentsRes.status}`
        );
      }

      // ---------------------------------------------
      // PARSE
      // ---------------------------------------------

      const usersData =
        await usersRes.json();

      const withdrawalsData =
        await withdrawalsRes.json();

      const investmentsData =
        await investmentsRes.json();

      console.log(
        "📊 Admin dashboard users:",
        usersData
      );

      console.log(
        "📊 Admin dashboard withdrawals:",
        withdrawalsData
      );

      console.log(
        "📊 Admin dashboard investments:",
        investmentsData
      );

      // ---------------------------------------------
      // NORMALIZE
      // ---------------------------------------------

      const users =
        extractArray(usersData);

      const withdrawals =
        extractArray(
          withdrawalsData
        );

      const investments =
        extractArray(
          investmentsData
        );

      // ---------------------------------------------
      // CALCULATE
      // ---------------------------------------------

      const pendingWithdrawals =
        withdrawals.filter(
          (withdrawal) =>
            withdrawal?.status === "pending"
        ).length;

      // ---------------------------------------------
      // UPDATE STATE
      // ---------------------------------------------

      setStats({
        totalUsers:
          users.length,

        totalWithdrawals:
          withdrawals.length,

        pendingWithdrawals,

        totalInvestments:
          investments.length,
      });
    } catch (err) {
      console.error(
        "❌ Dashboard fetch error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD + AUTO REFRESH
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      if (!mounted) {
        return;
      }

      await fetchDashboardStats();
    };

    loadDashboard();

    const interval =
      setInterval(() => {
        if (mounted) {
          fetchDashboardStats();
        }
      }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <CircularProgress />
      </div>
    );
  }

  // ===================================================
  // DASHBOARD
  // ===================================================

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-heading">
          <Typography className="admin-dashboard-title">
            Admin Dashboard
          </Typography>

          <Typography className="admin-dashboard-subtitle">
            Overview of your platform activity
            and operations
          </Typography>
        </div>
      </div>

      {error && (
        <Alert
          severity="error"
          className="admin-dashboard-alert"
        >
          {error}
        </Alert>
      )}

      <div className="admin-stat-grid">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          type="users"
          icon="U"
        />

        <StatCard
          title="Total Withdrawals"
          value={stats.totalWithdrawals}
          type="withdrawals"
          icon="W"
        />

        <StatCard
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals}
          type="pending"
          icon="P"
        />

        <StatCard
          title="Total Investments"
          value={stats.totalInvestments}
          type="investments"
          icon="I"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;