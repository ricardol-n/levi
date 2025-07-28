import React from "react";
import { List, Datagrid, TextField, NumberField, DateField } from "react-admin";

export const WithdrawalList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="userId" />
      <NumberField source="amount" />
      <TextField source="status" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

