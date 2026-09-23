
import React, { useState } from "react";

import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  useRecordContext,
  useRefresh,
  useNotify,
  Button,
} from "react-admin";

/* =====================================================
   APPROVE BUTTON
===================================================== */

const ApproveButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const [loading, setLoading] = useState(false);

  if (!record || record.status !== "pending") {
    return null;
  }

  const handleApprove = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      `Approve this withdrawal of $${Number(
        record.amount || 0
      ).toLocaleString()}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin session expired");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/withdrawals/${record.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "approved",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to approve withdrawal"
        );
      }

      notify(
        data.message || "Withdrawal approved",
        {
          type: "success",
        }
      );

      refresh();
    } catch (error) {
      console.error(
        "❌ Approve withdrawal error:",
        error
      );

      notify(
        error.message || "Error approving withdrawal",
        {
          type: "error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      label={loading ? "Approving..." : "Approve"}
      onClick={handleApprove}
      disabled={loading}
      color="primary"
    />
  );
};

/* =====================================================
   REJECT BUTTON
===================================================== */

const RejectButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const [loading, setLoading] = useState(false);

  if (!record || record.status !== "pending") {
    return null;
  }

  const handleReject = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      "Reject this withdrawal?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin session expired");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/withdrawals/${record.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rejected",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to reject withdrawal"
        );
      }

      notify(
        data.message || "Withdrawal rejected",
        {
          type: "success",
        }
      );

      refresh();
    } catch (error) {
      console.error(
        "❌ Reject withdrawal error:",
        error
      );

      notify(
        error.message || "Error rejecting withdrawal",
        {
          type: "error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      label={loading ? "Rejecting..." : "Reject"}
      onClick={handleReject}
      disabled={loading}
      color="warning"
    />
  );
};

/* =====================================================
   WITHDRAWALS LIST
===================================================== */

const WithdrawalsList = () => {
  return (
    <List className="admin-withdrawals-list"
  title="Users"
  sort={{
    field: "username",
    order: "ASC",
  }}
  perPage={15}>
      <Datagrid rowClick={false}>
        <TextField source="id" />

        <TextField source="method" />

        <NumberField source="amount" />

        <TextField source="status" />

        <DateField source="createdAt" />

        <ApproveButton />

        <RejectButton />
      </Datagrid>
    </List>
  );
};

export default WithdrawalsList;
