import React, { useContext, useEffect, useState } from "react";
import { BalanceContext } from "../BalanceContext";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export const RefferalLog = () => {
  const { balance } = useContext(BalanceContext);
  const { user, token } = useContext(AuthContext);
  const [referrals, setReferrals] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [link, setLink] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ✅ Smart API base URL – works in both dev and production
  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api" // your backend in local dev
      : "https://admin-backend-qyhk.onrender.com/api"; // Render backend in production

  useEffect(() => {
    if (!user?._id || !token) return;

    const fetchReferrals = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/${user._id}/referrals`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ handle both structured and fallback responses
        if (res.data?.success) {
          setReferrals(res.data.data.referrals || 0);
          setBonus(res.data.data.bonus || 0);
          setLink(res.data.data.referralLink || "");
        } else if (res.data?.referrals !== undefined) {
          setReferrals(res.data.referrals.length || 0);
          setBonus(res.data.bonus || 0);
          setLink(`${window.location.origin}/register?ref=${user._id}`);
        }
      } catch (err) {
        console.error("Referral fetch error:", err);
      }
    };

    fetchReferrals();
  }, [user, token]);

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="messages">
            <div className="referral">
              <h2>Referral Program</h2>
              <p>
                Refer a friend and earn <strong>$10</strong> when they make a
                deposit!
              </p>

              <div className="referral-link">
                <input type="text" value={link} readOnly />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    alert("Referral link copied!");
                  }}
                >
                  Copy Link
                </button>
              </div>

              <div className="referral-stats">
                <p>
                  <strong>Referrals:</strong> {referrals}
                </p>
                <p>
                  <strong>Bonus Earned:</strong> ${bonus}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
