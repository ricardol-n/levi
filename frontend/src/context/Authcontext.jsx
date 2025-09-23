import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // ✅ Login
  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      if (res.data.success) {
        const { token, user } = res.data;

        setToken(token);
        setUser(user);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user._id);

        return { success: true, user };
      }
      return { success: false, message: res.data.message || "Login failed" };
    } catch (err) {
      console.error("❌ Login error:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Server error",
      };
    }
  };

  // ✅ Register
  const register = async ({ username, email, phone, password }) => {
    try {
      const res = await axios.post("/api/auth/register", {
        username,
        email,
        phone,
        password,
      });

      if (res.data.success) {
        const { token, user } = res.data;

        setToken(token);
        setUser(user);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user._id);

        return { success: true, user };
      }
      return { success: false, message: res.data.message || "Registration failed" };
    } catch (err) {
      console.error("❌ Registration error:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Server error",
      };
    }
  };

  // ✅ Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
