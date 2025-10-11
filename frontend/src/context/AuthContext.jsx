// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // ✅ Global Axios defaults
  axios.defaults.baseURL = API_BASE;
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  // ✅ Refresh Access Token
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken) throw new Error("No refresh token available");
      const res = await axios.post(`/auth/refresh-token`, { refreshToken });
      if (res.data?.token) {
        const newToken = res.data.token;
        setToken(newToken);
        localStorage.setItem("token", newToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        console.log("♻️ Token refreshed");
        return newToken;
      }
      logout();
    } catch (err) {
      console.error("❌ Token refresh failed:", err);
      logout();
      throw err;
    }
  };

  // ✅ Axios interceptor for 401 (expired)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          error.response?.data?.message === "jwt expired" &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshAccessToken();
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshErr) {
            console.error("🔁 Refresh failed:", refreshErr);
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  // ✅ Login
  const login = async (email, password, isAdmin = false) => {
    try {
      const res = await axios.post(`/auth/login`, { email, password });
      if (!res.data.success) return { success: false, message: res.data.message };

      const { token, refreshToken, user } = res.data;

      // ✅ Role check
      if (isAdmin && user.role !== "admin")
        return { success: false, message: "Use the regular user login page." };
      if (!isAdmin && user.role === "admin")
        return { success: false, message: "Use the admin login page." };

      // ✅ Store session
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("🔑 Login success:", { user, token });
      return { success: true, user, redirectTo: user.role === "admin" ? "/admin" : "/dashboard" };
    } catch (err) {
      console.error("❌ Login error:", err);
      return { success: false, message: err.response?.data?.message || "Server error" };
    }
  };

  // ✅ Register
  const register = async ({ username, email, phone, password }, isAdmin = false) => {
    try {
      const res = await axios.post(`/auth/register`, { username, email, phone, password });
      if (!res.data.success)
        return { success: false, message: res.data.message || "Registration failed" };

      const { token, refreshToken, user } = res.data;

      if (isAdmin && user.role !== "admin")
        return { success: false, message: "Use user registration page." };
      if (!isAdmin && user.role === "admin")
        return { success: false, message: "Use admin registration page." };

      // ✅ Store user
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("📝 Registration success:", { user, token });
      return { success: true, user, redirectTo: user.role === "admin" ? "/admin" : "/dashboard" };
    } catch (err) {
      console.error("❌ Registration error:", err);
      return { success: false, message: err.response?.data?.message || "Server error" };
    }
  };

  // ✅ Logout
  const logout = () => {
    console.log("🚪 Logging out...");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.clear();
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

  // ✅ Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        user,
        login,
        register,
        logout,
        refreshAccessToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
