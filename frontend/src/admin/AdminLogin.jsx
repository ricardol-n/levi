
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const API_BASE =
    import.meta.env.VITE_API_URL || "/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/admin/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data?.message || "Admin login failed"
        );
        return;
      }

      if (!data.token || !data.user) {
        setError(
          "Invalid response from server."
        );
        return;
      }

      // Allow both admin and superadmin
      if (!["admin", "superadmin"].includes(data.user.role)) {
        setError(
          "Access denied: Not an administrator."
        );
        return;
      }

      // Save admin session separately
      localStorage.setItem(
        "adminToken",
        data.token
      );

      if (data.refreshToken) {
        localStorage.setItem(
          "adminRefreshToken",
          data.refreshToken
        );
      }

      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      // Navigate to React Admin
      navigate("/admin", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "❌ Admin login error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    }
  };

  return (
    <div className="admin-login-container">

      <h2>Admin Login</h2>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}

export default AdminLogin;
