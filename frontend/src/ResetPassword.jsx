import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "./utils/axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("This password reset link is invalid or missing.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/auth/reset-password", {
        token,
        password,
      });

      setMessage(
        response.data.message || "Password reset successfully."
      );

      // Give the user time to see the success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("Reset password error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">

      <div className="reset-password-card">

        <h1>Reset Password</h1>

        <p>
          Create a new password for your TXLA Advisory account.
        </p>

        <form onSubmit={handleReset}>

          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>

        {error && (
          <p className="reset-error">
            {error}
          </p>
        )}

        {message && (
          <p className="reset-success">
            {message}
          </p>
        )}

        <button
          type="button"
          className="back-login"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>

      </div>

    </div>
  );
};

export default ResetPassword;