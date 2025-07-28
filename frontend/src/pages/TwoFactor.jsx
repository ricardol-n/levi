import React from 'react'
import Header from '../Header';
import Sidebar from '../Sidebar';

export const TwoFactor = () => {
    return(
        
        <div className="dashboard-container">
              <Header />
              <div className="dashboard-content">
                <Sidebar />
                <main className="main-content">
                  <div className="twofactor">2fa</div>
                </main>
                </div>
                </div>
    );
};