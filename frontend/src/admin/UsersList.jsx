import React from "react";
import { List, Datagrid, TextField, EmailField, NumberField } from "react-admin";

const UsersList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="username" label="Name" />
      <EmailField source="email" />
      <TextField source="phone" />
      <NumberField source="balance" />
      <TextField source="role" />
    </Datagrid>
  </List>
);

export default UsersList;
