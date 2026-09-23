
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
  useShowController,
  Show,
  SimpleShowLayout,
  ShowButton,
} from "react-admin";

const API_BASE =
  import.meta.env.VITE_API_URL || "/api";

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

      const token =
        localStorage.getItem("adminToken");

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
        throw new Error(
          data?.message || "Top up failed"
        );
      }

      notify("User balance updated", {
        type: "success",
      });

      setAmount("");
      refresh();
    } catch (error) {
      notify(
        error.message || "Top up failed",
        {
          type: "error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-topup">
      <input
        className="premium-amount-input"
        type="number"
        min="0"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(event) =>
          setAmount(event.target.value)
        }
      />

      <Button
        label={loading ? "..." : "Top Up"}
        onClick={handleTopUp}
        disabled={loading}
        variant="contained"
      />
    </div>
  );
};

/* =========================================================
   ASSIGN ADMIN
   ========================================================= */

const AssignAdminButton = ({
  record,
  admins,
}) => {
  const notify = useNotify();
  const refresh = useRefresh();

  const [selectedAdmin, setSelectedAdmin] =
    useState("");

  const [saving, setSaving] =
    useState(false);

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
      <span className="premium-muted">
        —
      </span>
    );
  }

  const handleAssign = async () => {
    try {
      setSaving(true);

      const token =
        localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_BASE}/users/${record.id}/assign-admin`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminId:
              selectedAdmin || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Assignment failed"
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
        error.message ||
          "Could not assign user",
        {
          type: "error",
        }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="assign-admin-control">
      <select
        value={selectedAdmin}
        onChange={(event) =>
          setSelectedAdmin(
            event.target.value
          )
        }
        disabled={saving}
        className="premium-select"
      >
        <option value="">
          Unassigned
        </option>

        {admins.map((admin) => (
          <option
            key={admin.id || admin._id}
            value={admin.id || admin._id}
          >
            {admin.username ||
              admin.email}
          </option>
        ))}
      </select>

      <Button
        label={saving ? "Saving..." : "Save"}
        onClick={handleAssign}
        disabled={saving}
        variant="contained"
      />
    </div>
  );
};

/* =========================================================
   ASSIGNED ADMIN DISPLAY
   ========================================================= */

const AssignedAdminField = ({
  record,
}) => {
  if (!record) return null;

  const assigned =
    record.assignedAdmin;

  if (!assigned) {
    return (
      <span className="premium-unassigned">
        Unassigned
      </span>
    );
  }

  return (
    <span className="premium-assigned">
      {assigned.username ||
        assigned.email ||
        assigned._id ||
        "Assigned"}
    </span>
  );
};

/* =========================================================
   ASSIGNMENT COLUMN
   ========================================================= */

const AssignmentColumn = ({
  isSuperadmin,
  admins,
}) => {
  const record =
    useRecordContext();

  if (!isSuperadmin || !record) {
    return null;
  }

  return (
    <AssignAdminButton
      record={record}
      admins={admins}
    />
  );
};

/* =========================================================
   USERS LIST
   ========================================================= */

const UsersList = () => {
  const notify = useNotify();

  const [adminUser, setAdminUser] =
    useState(null);

  const [admins, setAdmins] =
    useState([]);

  const [loadingAdmins, setLoadingAdmins] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          "adminUser"
        );

      if (stored) {
        setAdminUser(
          JSON.parse(stored)
        );
      }
    } catch (error) {
      console.error(
        "Could not read admin user",
        error
      );
    }
  }, []);

  const isSuperadmin =
    adminUser?.role ===
    "superadmin";

  useEffect(() => {
    if (!isSuperadmin) return;

    const loadAdmins = async () => {
      try {
        setLoadingAdmins(true);

        const token =
          localStorage.getItem(
            "adminToken"
          );

        const response = await fetch(
          `${API_BASE}/users/admins`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Could not load admins"
          );
        }

        const adminList =
          Array.isArray(data)
            ? data
            : data?.data || [];

        setAdmins(
          adminList.map((admin) => ({
            ...admin,
            id:
              admin.id ||
              admin._id,
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
      } finally {
        setLoadingAdmins(false);
      }
    };

    loadAdmins();
  }, [isSuperadmin, notify]);

  return (
    <List className="admin-users-list"
      title="Users"
      sort={{
        field: "username",
        order: "ASC",
      }}
      perPage={15}
    >
      <Datagrid
        rowClick={false}
        bulkActionButtons={false}
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
            render={() => (
              <AssignmentColumn
                isSuperadmin={
                  isSuperadmin
                }
                admins={admins}
              />
            )}
          />
        )}

        <TopUpButton />

        {/* CLIENT-SIDE USER VIEW */}
        <ShowButton
          label="View"
        />

      </Datagrid>
    </List>
  );
};

export default UsersList;
