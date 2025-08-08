import React, { useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Header from './Header.jsx';
import { Sidebar } from './Sidebar.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminPanel from './admin/AdminPanel.jsx';
import { InvestmentPlans, InvestLog } from './pages/Reports.jsx';
import { Deposit, DepositLog } from './pages/Products.jsx';
import { Withdraw, WithdrawLog } from './pages/Team.jsx';
import { Transfer, TransferMoneyLog, InterestLog, TransactionLog } from './pages/Messages.jsx';
import { Setting, Logout } from './pages/Setting.jsx';
import { RefferalLog } from './pages/Refferal.jsx';
import { TwoFactor } from './pages/TwoFactor.jsx';
import { DepositConfirmationPage } from "./pages/DepoistConfrim.jsx";
import { Charts } from './pages/Charts.jsx';
import { AuthContext } from './context/Authcontext.jsx'; // ✅ Add this line
import CompanyInfo from "./CompanyInfo.jsx"

function App() {
  const { token } = useContext(AuthContext); // ✅ Track token from context
  const isLoggedIn = !!token;

  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        {!isLoggedIn && (
          <>
          <Route path="/" element={<CompanyInfo/>}  />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register onRegister={() => console.log("Registered")} />} />
          </>
        )}

        {/* Protected Routes */}
        {isLoggedIn && (
          <>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Header />
                  <Sidebar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/investmentplans" element={<ProtectedRoute><InvestmentPlans /></ProtectedRoute>} />
            <Route path="/InvestLog" element={<ProtectedRoute><InvestLog /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/depositlog" element={<ProtectedRoute><DepositLog /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/withdrawlog" element={<ProtectedRoute><WithdrawLog /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
            <Route path="/transfer/transferlog" element={<ProtectedRoute><TransferMoneyLog /></ProtectedRoute>} />
            <Route path="/transfer/interestlog" element={<ProtectedRoute><InterestLog /></ProtectedRoute>} />
            <Route path="/transfer/transactionlog" element={<ProtectedRoute><TransactionLog /></ProtectedRoute>} />
            <Route path="/refferallog" element={<ProtectedRoute><RefferalLog /></ProtectedRoute>} />
            <Route path="/twofactor" element={<ProtectedRoute><TwoFactor /></ProtectedRoute>} />
            <Route path="/setting/profile" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
            <Route path="/setting/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
            <Route path="/depositconfirmationpage" element={<ProtectedRoute><DepositConfirmationPage /></ProtectedRoute>} />
            <Route path="/charts" element={<ProtectedRoute><Charts/></ProtectedRoute>} />
          </>
        )}

        {/* Admin Panel (optional auth) */}
        <Route path="/admin/*" element={<AdminPanel />} />

        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
