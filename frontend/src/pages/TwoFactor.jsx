// src/pages/TwoFactor.jsx

import React, { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "../utils/axios";

export const TwoFactor = () => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const toggleSidebar = () =>
    setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/2fa/status`
      );

      if (res.data.success) {
        setIs2FAEnabled(res.data.enabled);
      }
    } catch (err) {
      console.error(
        "2FA Status Error:",
        err
      );
    }
  };

  const setup2FA = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE}/2fa/generate-2fa`
      );

      if (res.data.success) {
        setQrCode(res.data.qrCodeUrl);

        setMessage(
          "Scan the QR code with Google Authenticator and enter the generated 6-digit code."
        );
      }
    } catch (error) {
      console.error(
        "Generate 2FA Error:",
        error
      );

      setMessage(
        "Unable to generate QR code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE}/2fa/verify-2fa`,
        {
          token,
        }
      );

      if (res.data.success) {
        setIs2FAEnabled(true);
        setQrCode(null);
        setToken("");

        setMessage(
          "Two-Factor Authentication has been enabled successfully."
        );
      } else {
        setMessage(
          "Invalid verification code."
        );
      }
    } catch (error) {
      console.error(
        "Verify 2FA Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to disable Two-Factor Authentication?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE}/2fa/disable-2fa`
      );

      if (res.data.success) {
        setIs2FAEnabled(false);
        setQrCode(null);
        setToken("");

        setMessage(
          "Two-Factor Authentication has been disabled."
        );
      }
    } catch (error) {
      console.error(
        "Disable 2FA Error:",
        error
      );

      setMessage(
        "Unable to disable Two-Factor Authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />

      <div className="dashboard-content">
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        <main className="main-content">
          <div className="twofactor-container">

            <div className="twofactor-header">
              <h2 className="twofactor-title">
                Two-Factor Authentication
              </h2>

              <span
                className={`status-badge ${
                  is2FAEnabled
                    ? "status-enabled"
                    : "status-disabled"
                }`}
              >
                {is2FAEnabled
                  ? "Protected"
                  : "Not Enabled"}
              </span>
            </div>

            <div className="twofactor-card">

              <p className="twofactor-description">
                Add an extra layer of security
                to your account by requiring a
                verification code from Google
                Authenticator whenever you sign
                in.
              </p>

              {!is2FAEnabled &&
                !qrCode && (
                  <button
                    className="primary-btn"
                    onClick={setup2FA}
                    disabled={loading}
                  >
                    {loading
                      ? "Generating QR Code..."
                      : "Enable Two-Factor Authentication"}
                  </button>
                )}

              {qrCode && (
                <>
                  <div className="qr-wrapper">
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      className="qr-code"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Enter 6-digit verification code"
                    value={token}
                    onChange={(e) =>
                      setToken(
                        e.target.value
                      )
                    }
                    maxLength={6}
                    className="input-field"
                  />

                  <div className="button-group">
                    <button
                      className="primary-btn"
                      onClick={verify2FA}
                      disabled={loading}
                    >
                      {loading
                        ? "Verifying..."
                        : "Verify & Activate"}
                    </button>
                  </div>
                </>
              )}

              {is2FAEnabled && (
                <div className="button-group">
                  <button
                    className="danger-btn"
                    onClick={disable2FA}
                    disabled={loading}
                  >
                    Disable Two-Factor Authentication
                  </button>
                </div>
              )}

              {message && (
                <div
                  className={`status-message ${
                    message
                      .toLowerCase()
                      .includes(
                        "success"
                      ) ||
                    message
                      .toLowerCase()
                      .includes(
                        "enabled"
                      )
                      ? "success-message"
                      : "error-message"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            <div className="security-info">
              <h4>
                Why Enable Two-Factor Authentication?
              </h4>

              <ul>
                <li>
                  Protects your account even if
                  your password is exposed.
                </li>

                <li>
                  Requires a unique
                  authentication code during
                  login.
                </li>

                <li>
                  Recommended for all
                  investors, traders, and
                  account holders.
                </li>

                <li>
                  Works with Google
                  Authenticator on Android and
                  iPhone devices.
                </li>
              </ul>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default TwoFactor;