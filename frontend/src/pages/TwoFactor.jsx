import React, { useState } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "axios";

export const TwoFactor = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const setup2FA = async () => {
    try {
      const res = await axios.post("/api/2fa/generate-2fa", {
        userId: "USER_ID_HERE", // replace with logged-in user
      });
      setQrCode(res.data.qrCodeUrl);
    } catch (error) {
      console.error("Error generating 2FA:", error);
    }
  };

  const verify2FA = async () => {
    try {
      const res = await axios.post("/api/2fa/verify-2fa", {
        userId: "USER_ID_HERE",
        token,
      });
      if (res.data.success) {
        setMessage("✅ 2FA verified successfully!");
      } else {
        setMessage("❌ Invalid code, try again.");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="twofactor">
            <h2>Two-Factor Authentication</h2>
            {!qrCode ? (
              <button onClick={setup2FA}>Enable 2FA</button>
            ) : (
              <div>
                <p>📲 Scan this QR code in Google Authenticator</p>
                <img src={qrCode} alt="QR Code" style={{ maxWidth: "250px" }} />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <button onClick={verify2FA}>Verify</button>
                <p>{message}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
