import React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
} from "react-admin";

export const InvestmentList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="userId.email" label="User Email" />
      <TextField source="name" label="Plan" />
      <NumberField source="amount" label="Amount ($)" />
      <NumberField source="roi" label="ROI (%)" />
      <NumberField source="expectedReturn" label="Expected Return ($)" />
      <DateField source="startDate" label="Start Date" showTime />
      <DateField source="endDate" label="End Date" showTime />
      <TextField source="completed" label="Status" />
      <DateField source="createdAt" label="Created At" showTime />
    </Datagrid>
  </List>
);
