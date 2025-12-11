import React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  TextInput,
  EditButton,
  useRecordContext,
  useRefresh,
  useNotify,
  Button,
} from "react-admin";

const ApproveButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record || record.status !== "pending") return null;

  const handleApprove = async () => {
    try {
      const res = await fetch(`/api/withdrawals/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!res.ok) throw new Error("Approve failed");

      notify("Withdrawal approved", { type: "success" });
      refresh();
    } catch (err) {
      notify("Error approving withdrawal", { type: "error" });
    }
  };

  return (
    <Button label="Approve" onClick={handleApprove} color="primary" />
  );
};

const RejectButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record || record.status !== "pending") return null;

  const handleReject = async () => {
    try {
      const res = await fetch(`/api/withdrawals/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!res.ok) throw new Error("Reject failed");

      notify("Withdrawal rejected", { type: "success" });
      refresh();
    } catch (err) {
      notify("Error rejecting withdrawal", { type: "error" });
    }
  };

  return (
    <Button label="Reject" onClick={handleReject} color="warning" />
  );
};

const WithdrawalsList = () => (
  <List>
   <Datagrid rowClick={false}>
      <TextField source="id" />
      <TextField source="method" />
      <NumberField source="amount" />
      <TextField source="status" />
      <DateField source="createdAt" />

      {/* ACTION BUTTONS */}
      <ApproveButton />
      <RejectButton />
    </Datagrid>
  </List>
);

export default WithdrawalsList;
