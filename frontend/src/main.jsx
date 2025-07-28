import React , { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/Authcontext.jsx'
import { BalanceProvider } from './BalanceContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BalanceProvider>
      <AuthProvider>
        <App/>
      </AuthProvider>
    </BalanceProvider>
  </StrictMode>
)
