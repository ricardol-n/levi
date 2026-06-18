import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

export default function Verify2FA() {
  const navigate = useNavigate();
  const location = useLocation();

  const { verify2FALogin } = useContext(AuthContext);

  const userId = location.state?.userId;

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <div style={{ padding: "30px" }}>
        Invalid verification request.
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const result = await verify2FALogin(userId, otp);

    setLoading(false);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    navigate(result.redirectTo);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111"
      }}
    >
      <form
        onSubmit={handleVerify}
        style={{
          background: "#222",
          padding: "30px",
          borderRadius: "10px",
          width: "350px"
        }}
      >
        <h2 style={{ color: "#fff" }}>
          Two-Factor Authentication
        </h2>

        <p style={{ color: "#aaa" }}>
          Enter the 6-digit code from Google Authenticator
        </p>

        {message && (
          <p style={{ color: "red" }}>
            {message}
          </p>
        )}

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            marginBottom: "15px"
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px"
          }}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}