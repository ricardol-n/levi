// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect,useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);


  // ✅ Refresh access token
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken) throw new Error("No refresh token available");

      const res = await axios.post("/api/auth/refresh-token", { refreshToken });

      if (res.data?.token) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);

        // update axios default
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        return res.data.token;
      } else {
        logout();
      }
    } catch (err) {
      console.error("❌ Refresh token failed:", err);
      logout();
      throw err;
    }
  };

  // ✅ Setup axios interceptor once
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
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  // ✅ Login
  const login = async (email, password, isAdmin = false) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (!res.data.success) return { success: false, message: res.data.message };

      const { token, refreshToken, user } = res.data;

      // ---- ROLE CHECK ----
      if (isAdmin && user.role !== "admin")
        return { success: false, message: "Use user login page." };
      if (!isAdmin && user.role === "admin")
        return { success: false, message: "Use admin login page." };

      // ---- STORE SESSION ----
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);

      // set axios default
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("🔑 Login success:", { user, token, refreshToken });
      console.log("📦 Stored userId:", user._id);


      return { success: true, user, redirectTo: user.role === "admin" ? "/admin" : "/dashboard" };
    } catch (err) {
      console.error("❌ Login error:", err);
      return { success: false, message: err.response?.data?.message || "Server error" };
    }
  };

  // ✅ Register
  const register = async ({ username, email, phone, password }, isAdmin = false) => {
    try {
      const res = await axios.post("/api/auth/register", { username, email, phone, password });

      if (res.data.success) {
        const { token, refreshToken, user } = res.data;

        if (isAdmin && user.role !== "admin")
          return { success: false, message: "Use the regular user registration page." };
        if (!isAdmin && user.role === "admin")
          return { success: false, message: "Use the admin registration page." };

        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user._id);
        localStorage.setItem("role", user.role);

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        console.log("📝 Registration success:", { user, token, refreshToken });
        return { success: true, user, redirectTo: user.role === "admin" ? "/admin" : "/dashboard" };
      }

      return { success: false, message: res.data.message || "Registration failed" };
    } catch (err) {
      console.error("❌ Registration error:", err);
      return { success: false, message: err.response?.data?.message || "Server error" };
    }
  };


  // ---- Logout ----
  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.clear();
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

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
      value={{ token, refreshToken, user, login, register, logout, refreshAccessToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
