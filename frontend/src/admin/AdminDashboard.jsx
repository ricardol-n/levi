import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    totalInvestments: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      // Fetch all data in parallel
      const [usersRes, withdrawalsRes, investmentsRes] = await Promise.all([
        fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/withdrawals", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/investments", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const users = await usersRes.json();
      const withdrawals = await withdrawalsRes.json();
      const investments = await investmentsRes.json();

      setStats({
        totalUsers: users.length,
        totalWithdrawals: withdrawals.length,
        pendingWithdrawals: withdrawals.filter(w => w.status === "pending").length,
        totalInvestments: investments.length,
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const StatCard = ({ title, value }) => (
    <Card sx={{ p: 2, background: "#f5f5f5" }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" fontWeight="bold">
          Admin Dashboard
        </Typography>
      </Grid>

      <Grid item xs={12} md={3}>
        <StatCard title="Total Users" value={stats.totalUsers} />
      </Grid>

      <Grid item xs={12} md={3}>
        <StatCard title="Total Withdrawals" value={stats.totalWithdrawals} />
      </Grid>

      <Grid item xs={12} md={3}>
        <StatCard title="Pending Withdrawals" value={stats.pendingWithdrawals} />
      </Grid>

      <Grid item xs={12} md={3}>
        <StatCard title="Total Investments" value={stats.totalInvestments} />
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;
