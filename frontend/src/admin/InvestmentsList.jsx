import React from "react";
import { List, Datagrid, TextField, NumberField, DateField } from "react-admin";

export const InvestmentList = () => {
    return(
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="userId" />
      <NumberField source="amount" />
      <TextField source="plan" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);
};

