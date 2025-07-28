import React from 'react';
import { Admin, Resource } from 'react-admin';
import authProvider from './authProvider';
import dataProvider from './dataProvider';
import Dashboard from './AdminDashboard';
import { UserList } from './UsersList';
import { TransactionList } from './TransactionsList';
import { WithdrawalList } from './WithdrawalsList';
import { InvestmentList } from './InvestmentsList';

const AdminPanel = () => {
  return (
    <Admin
      dashboard={Dashboard}
      authProvider={authProvider}
      dataProvider={dataProvider}
    >
      <Resource name="users" list={UserList} />
      <Resource name="transactions" list={TransactionList} />
      <Resource name="withdrawals" list={WithdrawalList} />
      <Resource name="investments" list={InvestmentList} />
    </Admin>
  );
};

export default AdminPanel;
