import React from "react";
import { List, Datagrid, TextField, DateField, NumberField } from "react-admin";

export const TransactionList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="userId.email" label="User Email" />
      <TextField source="type" />
      <NumberField source="amount" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);
