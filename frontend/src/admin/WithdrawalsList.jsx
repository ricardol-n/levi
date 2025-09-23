// src/admin/WithdrawalsList.jsx
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  useUpdate,
  useRefresh,
} from "react-admin";
import { Button } from "@mui/material";

export const WithdrawalList = () => {
  const [update] = useUpdate();
  const refresh = useRefresh();

  const handleAction = async (id, status) => {
    try {
      await update(
        "withdrawals",
        { id, data: { status } },
        { returnPromise: true }
      );
      refresh(); // reload table after update
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <List>
      <Datagrid rowClick="show">
        {/* ✅ if your backend uses _id, react-admin expects "id" */}
        <TextField source="id" label="ID" />
        <TextField source="userId.email" label="User" />
        <TextField source="method" />
        <NumberField source="amount" />
        <TextField source="status" />
        <DateField source="createdAt" />

        <FunctionField
          label="Actions"
          render={(record) =>
            record.status === "pending" ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleAction(record.id, "approved")}
                  style={{ marginRight: "8px" }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleAction(record.id, "rejected")}
                >
                  Reject
                </Button>
              </>
            ) : (
              <span>—</span>
            )
          }
        />
      </Datagrid>
    </List>
  );
};
