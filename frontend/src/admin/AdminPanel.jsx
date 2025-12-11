import React, { useEffect, useState } from "react";
import { Admin, Resource } from "react-admin";
import dataProvider from "./dataProvider";
import adminAuthProvider from "./adminAuthProvider";

import WithdrawalsList from "./WithdrawalsList";
import UsersList from "./UsersList";
import AdminDashboard from "./AdminDashboard";

import GroupIcon from "@mui/icons-material/Group";
import PaymentsIcon from "@mui/icons-material/Payments";

const AdminPanel = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    fetch("/api/withdrawals", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const pending = data.filter((w) => w.status === "pending").length;
        setPendingCount(pending);
      });
  }, []);

  return (
    <Admin
      dashboard={AdminDashboard}
      dataProvider={dataProvider}
      authProvider={adminAuthProvider}
    >
      {/* USERS LIST */}
      <Resource
        name="users"
        list={UsersList}
        icon={GroupIcon}
      />

      {/* WITHDRAWALS LIST (with badge counter) */}
      <Resource
        name="withdrawals"
        list={WithdrawalsList}
        icon={() => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <PaymentsIcon />
            {pendingCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "12px",
                }}
              >
                {pendingCount}
              </span>
            )}
          </div>
        )}
      />
    </Admin>
  );
};

export default AdminPanel;
