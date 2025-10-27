import React, { useContext } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';
import Dashboard from './Dashboard.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminPanel from './admin/AdminPanel.jsx';
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute.jsx";


import { InvestmentPlans, InvestLog } from './pages/Reports.jsx';
import { Deposit, DepositLog } from './pages/Products.jsx';
import { Withdraw, WithdrawLog } from './pages/Team.jsx';
import { Transfer, TransactionLog } from './pages/Messages.jsx';
import { Setting } from './pages/Setting.jsx';
import { RefferalLog } from './pages/Refferal.jsx';
import { TwoFactor } from './pages/TwoFactor.jsx';
import { DepositConfirmationPage } from "./pages/DepoistConfrim.jsx";
import { Charts } from './pages/Charts.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import CompanyInfo from "./CompanyInfo.jsx";
import AboutUs from "./AboutUs.jsx";
import Contact from './Contact.jsx';
import LoginPage from './Login.jsx';
import RegisterPage from './Register.jsx';
import TermsOfService from "./TermsOfService";
import PrivacyPolicy from "./PrivacyPolicy";
import AdminLogin from "./admin/AdminLogin.jsx";


function App() {
  const { token,loading } = useContext(AuthContext);
  const isLoggedIn = !!token;
  const role = localStorage.getItem("role");

   if (loading) return <div className="loading-screen">Loading...</div>; 
  


  return (
  <>
 
    
      <ScrollToTop />
      <Routes>
           <Route path="/" element={<CompanyInfo />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

             {/* Login/Register with role-based redirects */}
        <Route path="/login" element={<LoginPage /> } />
        <Route path="/register"element={ <RegisterPage />}/>
           {/* Protected Routes */}
       
            <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
            <Route path="/investmentplans" element={<ProtectedRoute><InvestmentPlans /></ProtectedRoute>} />
            <Route path="/InvestLog" element={<ProtectedRoute><InvestLog /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/depositlog" element={<ProtectedRoute><DepositLog /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/withdrawlog" element={<ProtectedRoute><WithdrawLog /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
            <Route path="/transfer/transactionlog" element={<ProtectedRoute><TransactionLog /></ProtectedRoute>} />
            <Route path="/refferallog" element={<ProtectedRoute><RefferalLog /></ProtectedRoute>} />
            <Route path="/twofactor" element={<ProtectedRoute><TwoFactor /></ProtectedRoute>} />
            <Route path="/setting/profile" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
            <Route path="/depositconfirmationpage" element={<ProtectedRoute><DepositConfirmationPage /></ProtectedRoute>} />
            <Route path="/charts" element={<ProtectedRoute><Charts /></ProtectedRoute>} />
        

        {/* Admin routes */}

        <Route path="/admin/login" element={ <AdminLogin />} />

        <Route path="/admin/*" element={ <ProtectedAdminRoute> <AdminPanel />  </ProtectedAdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

     </>  
  );
}

export default App;
