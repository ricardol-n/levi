import React, { useState } from "react";
import axios from "./utils/axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/auth/forgot-password",
        {
          email: email.trim().toLowerCase(),
        }
      );

      console.log(
        "Forgot password response:",
        response.data
      );

      // IMPORTANT:
      // Do NOT navigate directly to ResetPassword.
      // The user must open the link from their email.
      setMessage(
        response.data.message ||
        "If an account exists with that email, a password reset link has been sent. Please check your email."
      );

      // Clear email field after successful request
      setEmail("");

    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">

      <div className="forgot-password-card">

        <h1>Forgot Password?</h1>

        <p>
          Enter your email address and we'll help you
          reset your password.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Continue"}
          </button>

        </form>

        {message && (
          <div className="success">
            <strong>Check your email</strong>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
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

export default ForgotPassword;