import React from "react";
import { Admin, Resource } from "react-admin";

import dataProvider from "./dataProvider";
import adminAuthProvider from "./adminAuthProvider";

import WithdrawalsList from "./WithdrawalsList";
import UsersList from "./UsersList";
import AdminsList from "./AdminsList";
import AdminDashboard from "./AdminDashboard";

import AdminLayout from "./AdminLayout";

const AdminApp = () => {
  let adminUser = null;

  try {
    const storedUser = localStorage.getItem("adminUser");

    if (storedUser) {
      adminUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to read admin user:", error);
  }

  const isSuperadmin = adminUser?.role === "superadmin";

  console.log("🔐 Admin user:", adminUser);
  console.log("👑 Is Superadmin:", isSuperadmin);

  return (
    <Admin
      basename="/admin"
      dashboard={AdminDashboard}
      layout={AdminLayout}
      dataProvider={dataProvider}
      authProvider={adminAuthProvider}
      disableTelemetry
    >
      <Resource
        name="users"
        list={UsersList}
      />

      <Resource
        name="withdrawals"
        list={WithdrawalsList}
      />

      {isSuperadmin && (
        <Resource
          name="admins"
          list={AdminsList}
        />
      )}
    </Admin>
  );
};

export default AdminApp;