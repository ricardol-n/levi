// src/pages/TwoFactor.jsx
import React, { useState } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "axios";


export const TwoFactor = () => {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId"); // ✅ get logged-in user

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const setup2FA = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/2fa/generate-2fa`, {
        userId,
      });
      setQrCode(res.data.qrCodeUrl);
      setMessage("Scan this QR code using Google Authenticator.");
    } catch (error) {
      console.error("Error generating 2FA:", error);
      setMessage("⚠️ Could not generate 2FA. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/2fa/verify-2fa`, {
        userId,
        token,
      });
      if (res.data.success) {
        setMessage("✅ 2FA verified successfully!");
      } else {
        setMessage("❌ Invalid code, please try again.");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      setMessage("⚠️ Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="twofactor-container">
            <h2>🔐 Two-Factor Authentication</h2>

            {!qrCode ? (
              <button className="primary-btn" onClick={setup2FA} disabled={loading}>
                {loading ? "Generating..." : "Enable 2FA"}
              </button>
            ) : (
              <div className="twofactor-verify">
                <p>{message}</p>
                <img src={qrCode} alt="QR Code" className="qr-code" />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  maxLength={6}
                  className="input-field"
                />
                <button className="primary-btn" onClick={verify2FA} disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            )}

            {message && <p className="status-message">{message}</p>}
          </div>
        </main>
      </div>
    </div>
  );
};
