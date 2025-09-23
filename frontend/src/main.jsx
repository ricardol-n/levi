import React , { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from "react-router-dom";
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BalanceProvider } from './BalanceContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BalanceProvider>
      <AuthProvider>
        <HashRouter>
           <App/>
        </HashRouter>
      </AuthProvider>
    </BalanceProvider>
  </StrictMode>
)
