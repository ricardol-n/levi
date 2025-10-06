import React , { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BalanceProvider } from './BalanceContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    
      <AuthProvider>
        <BrowserRouter>
        <BalanceProvider>
           <App/>
        </BalanceProvider>
        </BrowserRouter>
      </AuthProvider>
    
  </StrictMode>
)
