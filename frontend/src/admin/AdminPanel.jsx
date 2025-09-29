// src/admin/AdminPanel.jsx
import React, { useEffect } from "react";
import { Admin, Resource } from "react-admin";
import { useNavigate } from "react-router-dom"; // ✅ redirect
import authProvider from "./authProvider";
import dataProvider from "./dataProvider";
import Dashboard from "./AdminDashboard";
import { UserList } from "./UsersList";
import { TransactionList } from "./TransactionsList";
import { WithdrawalList } from "./WithdrawalsList";
import { InvestmentList } from "./InvestmentsList";

const AdminGuard = ({ children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard"); // ✅ redirect user → dashboard
    }
  }, [role, navigate]);

  if (role !== "admin") {
    return null; // nothing while redirecting
  }

  return children;
};

const AdminPanel = () => {
  return (
    <AdminGuard>
      <Admin
        dashboard={Dashboard}
        authProvider={authProvider}
        dataProvider={dataProvider}
      >
        <Resource name="users" list={UserList} />
        <Resource name="transactions" list={TransactionList} />
        <Resource name="withdrawals" list={WithdrawalList} />
        <Resource name="investments" list={InvestmentList} />
      </Admin>
    </AdminGuard>
  );
};

export default AdminPanel;
