import React from "react";
import { List, Datagrid, TextField, NumberField, DateField } from "react-admin";

const TransactionsList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="userId.email" label="User Email" />
      <NumberField source="amount" />
      <TextField source="status" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default TransactionsList;
