import React,{ useContext, useState } from 'react'
import { BalanceContext } from "../BalanceContext";
import Header from '../Header';
import Sidebar from '../Sidebar';


export const RefferalLog = () => {
    const { balance, setBalance } = useContext(BalanceContext);
    const [referrals, setReferrals] = useState(0);
    const [referralBonus, setReferralBonus] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const handleReferral = () => {
        setReferrals(referrals + 1);
        setReferralBonus(referralBonus + 10); // ✅ Earn $10 per referral
        setBalance(balance + 10);
    };
    return (

        <div className="dashboard-container">
              <Header toggleSidebar={toggleSidebar} />
              <div className="dashboard-content">
                <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="main-content">
                <div className="messages">
                <div className="referral">
                   <h2>Referral Program</h2>
                   <p>Refer a friend and earn <strong>$10</strong> when they make a deposit!</p>
                   <button onClick={handleReferral}>Refer a Friend</button>
                   <p>Referrals: {referrals} | Bonus Earned: ${referralBonus}</p>
                </div>
                </div>


                </main>
              </div>
        </div>
        
    
)};