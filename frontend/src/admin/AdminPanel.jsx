import React from "react";
import { Admin, Resource } from "react-admin";
import dataProvider from "./dataProvider";
import adminAuthProvider from "./adminAuthProvider";
import WithdrawalsList from "./WithdrawalsList";

const AdminPanel = () => (
  <Admin dataProvider={dataProvider} authProvider={adminAuthProvider}>
    <Resource name="withdrawals" list={WithdrawalsList} />
    {/* You can still add users, transactions, etc. */}
  </Admin>
);

export default AdminPanel;
