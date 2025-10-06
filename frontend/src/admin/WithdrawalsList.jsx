// src/admin/WithdrawalsList.jsx
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  Button,
  useDataProvider,
  useNotify,
  useRefresh,
} from "react-admin";

const WithdrawalsList = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleApprove = async (id) => {
    try {
      await dataProvider.customMethod(`admin/withdrawals/${id}/approve`, { method: "POST" });
      notify("Withdrawal approved", { type: "success" });
      refresh();
    } catch (err) {
      console.error(err);
      notify("Error approving withdrawal", { type: "warning" });
    }
  };

  const handleReject = async (id) => {
    try {
      await dataProvider.customMethod(`admin/withdrawals/${id}/reject`, { method: "POST" });
      notify("Withdrawal rejected", { type: "info" });
      refresh();
    } catch (err) {
      console.error(err);
      notify("Error rejecting withdrawal", { type: "warning" });
    }
  };

  return (
    <List resource="withdrawals" perPage={20}>
      <Datagrid>
        <TextField source="userId" label="User ID" />
        <NumberField source="amount" label="Amount" />
        <TextField source="method" label="Method" />
        <TextField source="address" label="Wallet/Bank" />
        <TextField source="status" label="Status" />
        <DateField source="createdAt" label="Requested At" />
        <Button label="Approve" onClick={(e) => handleApprove(e.record.id)} />
        <Button label="Reject" onClick={(e) => handleReject(e.record.id)} />
      </Datagrid>
    </List>
  );
};

export default WithdrawalsList;
