import React from "react";
import { List, Datagrid, TextField, DateField, NumberField } from "react-admin";

export const TransactionList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="userId" />
      <TextField source="type" />
      <NumberField source="amount" />
      <DateField source="date" />
    </Datagrid>
  </List>
);


