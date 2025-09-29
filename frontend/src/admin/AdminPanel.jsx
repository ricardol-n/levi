import React from "react";
import { Admin, Resource, usePermissions } from "react-admin";
import authProvider from "./authProvider";
import dataProvider from "./dataProvider";
import Dashboard from "./AdminDashboard";
import { UserList } from "./UsersList";
import { TransactionList } from "./TransactionsList";
import { WithdrawalList } from "./WithdrawalsList";
import { InvestmentList } from "./InvestmentsList";

const AdminPanel = () => {
  const { permissions } = usePermissions();

  if (permissions !== "admin") {
    // 🚫 Block non-admin users
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>🚫 Access Denied</h2>
        <p>You are not authorized to access the admin panel.</p>
        <a href="/">Go back to Dashboard</a>
      </div>
    );
  }

  return (
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
  );
};

export default AdminPanel;
