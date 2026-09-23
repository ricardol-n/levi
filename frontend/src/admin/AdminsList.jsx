
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  ChipField,
  FunctionField,
} from "react-admin";

const AdminsList = () => {
  return (
    <List
     className="admin-users-list"
      title="Administrators"
      sort={{ field: "username", order: "ASC" }}
    >
      <Datagrid rowClick={false}>
        <TextField
          source="username"
          label="Username"
        />

        <EmailField
          source="email"
          label="Email"
        />

        <ChipField
          source="role"
          label="Role"
        />

        <FunctionField
          label="ID"
          render={(record) =>
            record?._id || record?.id || "-"
          }
        />
      </Datagrid>
    </List>
  );
};

export default AdminsList;
