import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const AdminDashboard = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Admin Dashboard</Typography>
        <Typography variant="body1">Welcome, Admin!</Typography>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
