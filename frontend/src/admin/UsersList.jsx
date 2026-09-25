import React, { useEffect, useState } from "react";

import {
  List,
  Datagrid,
  TextField,
  EmailField,
  NumberField,
  FunctionField,
  Button,
  useRecordContext,
  useNotify,
  useRefresh,
  ShowButton,
} from "react-admin";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

/* =========================================================
   TOP UP
   ========================================================= */

const TopUpButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!record) return null;

  const handleTopUp = async () => {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      notify("Enter a valid amount", {
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_BASE}/users/${record.id}/topup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: numericAmount,
            note: "Admin top up",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Top up failed");
      }

      notify("User balance updated", {
        type: "success",
      });

      setAmount("");
      refresh();
    } catch (error) {
      notify(error.message || "Top up failed", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-table-topup">
      <input
        className="users-table-topup-input"
        type="number"
        min="0"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />

      <Button
        label={loading ? "..." : "Top Up"}
        onClick={handleTopUp}
        disabled={loading}
        variant="contained"
        className="users-table-topup-button"
      />
    </div>
  );
};

/* =========================================================
   ASSIGN ADMIN
   ========================================================= */

const AssignAdminButton = ({ record, admins }) => {
  const notify = useNotify();
  const refresh = useRefresh();

  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedAdmin(
      record?.assignedAdmin?._id ||
        record?.assignedAdmin?.id ||
        record?.assignedAdmin ||
        ""
    );
  }, [record]);

  if (!record || record.role !== "user") {
    return (
      <span className="users-table-muted">
        —
      </span>
    );
  }

  const handleAssign = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_BASE}/users/${record.id}/assign-admin`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminId: selectedAdmin || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Assignment failed"
        );
      }

      notify(
        selectedAdmin
          ? "User assigned successfully"
          : "User unassigned",
        {
          type: "success",
        }
      );

      refresh();
    } catch (error) {
      notify(
        error.message || "Could not assign user",
        {
          type: "error",
        }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="users-table-assign">
      <select
        value={selectedAdmin}
        onChange={(event) =>
          setSelectedAdmin(event.target.value)
        }
        disabled={saving}
        className="users-table-admin-select"
      >
        <option value="">Unassigned</option>

        {admins.map((admin) => (
          <option
            key={admin.id || admin._id}
            value={admin.id || admin._id}
          >
            {admin.username || admin.email}
          </option>
        ))}
      </select>

      <Button
        label={saving ? "Saving..." : "Save"}
        onClick={handleAssign}
        disabled={saving}
        variant="contained"
        className="users-table-save-button"
      />
    </div>
  );
};

/* =========================================================
   ASSIGNED ADMIN
   ========================================================= */

const AssignedAdminField = ({ record }) => {
  if (!record) return null;

  const assigned = record.assignedAdmin;

  if (!assigned) {
    return (
      <span className="users-table-unassigned">
        Unassigned
      </span>
    );
  }

  return (
    <span className="users-table-assigned">
      {assigned.username ||
        assigned.email ||
        assigned._id ||
        "Assigned"}
    </span>
  );
};

/* =========================================================
   USERS LIST
   ========================================================= */

const UsersList = () => {
  const notify = useNotify();

  const [adminUser, setAdminUser] = useState(null);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("adminUser");

      if (stored) {
        setAdminUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error(
        "Could not read admin user",
        error
      );
    }
  }, []);

  const isSuperadmin =
    adminUser?.role === "superadmin";

  /* =======================================================
     LOAD ADMINS
     ======================================================= */

  useEffect(() => {
    if (!isSuperadmin) return;

    const loadAdmins = async () => {
      try {
        const token =
          localStorage.getItem("adminToken");

        const response = await fetch(
          `${API_BASE}/users/admins`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Could not load admins"
          );
        }

        const adminList = Array.isArray(data)
          ? data
          : data?.data || [];

        setAdmins(
          adminList.map((admin) => ({
            ...admin,
            id: admin.id || admin._id,
          }))
        );
      } catch (error) {
        notify(
          error.message ||
            "Could not load administrators",
          {
            type: "error",
          }
        );
      }
    };

    loadAdmins();
  }, [isSuperadmin, notify]);

  return (
    <List
      className="admin-users-list"
      title="Users"
      sort={{
        field: "username",
        order: "ASC",
      }}
      
    >
      <Datagrid
        className="users-table"
        rowClick={false}
        bulkActionButtons={false}
        optimized
      >
        <TextField
          source="id"
          label="ID"
        />

        <TextField
          source="username"
          label="Name"
        />

        <EmailField
          source="email"
          label="Email"
        />

        <TextField
          source="phone"
          label="Phone"
        />

        <NumberField
          source="balance"
          label="Balance"
        />

        <TextField
          source="role"
          label="Role"
        />

        {isSuperadmin && (
          <FunctionField
            label="Assigned Admin"
            render={(record) => (
              <AssignedAdminField
                record={record}
              />
            )}
          />
        )}

        {isSuperadmin && (
          <FunctionField
            label="Assign User"
            render={(record) => (
              <AssignAdminButton
                record={record}
                admins={admins}
              />
            )}
          />
        )}

        {/* VIEW BEFORE TOP UP */}
        <ShowButton
          label="View"
          className="users-table-view-button"
        />

        {/* TOP UP MUST BE LAST */}
        <FunctionField
          label="Top Up"
          render={() => <TopUpButton />}
        />
      </Datagrid>
    </List>
  );
};

export default UsersList;