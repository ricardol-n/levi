import React from "react";
import { List, Datagrid, TextField, EmailField, DateField } from "react-admin";

const UsersList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="username" />
      <EmailField source="email" />
      <TextField source="role" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default UsersList;
