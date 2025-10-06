import React, { createContext, useState, useEffect, useCallback, useContext, useMemo, useRef } from "react";
import axios from "axios";
import { AuthContext } from "./context/AuthContext";

export const BalanceContext = createContext();
export const useBalance = () => useContext(BalanceContext);

export const BalanceProvider = ({ children }) => {
  const { user: authUser, token: authToken, logout, loading: authLoading } = useContext(AuthContext);

  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState("");


  // ---- Ref to prevent overlapping sync calls ----
  const syncing = useRef(false);

 console.log("🟢 Initial BalanceContext values:", {  authUser, authToken, authLoading });

  // ---- Refresh access token ----
  const refreshAccessToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) throw new Error("No refresh token");

      console.log("🔑 Trying refresh with token:", storedRefreshToken);

      const res = await axios.post("/api/auth/refresh-token", { refreshToken: storedRefreshToken });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        console.log("🔑 Refreshed token:", res.data.token);
        return res.data.token;
      } else {
        logout();
        throw new Error("Refresh failed");
      }
    } catch (err) {
      console.error("❌ Refresh token failed:", err);
      logout();
      throw err;
    }
  };

  // ---- Axios interceptor for 401 ----
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      async err => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
          console.warn("⚠️ 401 detected, retrying with refresh token...");
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []); // only once

// ---- Sync from backend ----
 const syncFromBackend = useCallback(async () => {
    const userId = authUser?._id || localStorage.getItem("userId");
    const token = authToken || localStorage.getItem("token");

    if (!userId || !token || syncing.current) {
      console.warn("⚠️ Skipping sync: missing token/userId or already syncing");
      return;
    }

    syncing.current = true;
    setLoading(true);
    setSyncError("");


    const investmentsUrl = authUser?.role === "admin" ? "/api/investments/all" : "/api/investments";


    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [depsRes, wdsRes, invRes, balRes] = await Promise.all([
        axios.get(`/api/users/${userId}/deposits`, { headers }),
        axios.get(`/api/users/${userId}/withdrawals`, { headers }),
        axios.get(investmentsUrl, { headers }),
        axios.get(`/api/users/${userId}/balance`, { headers }),
      ]);

      setDeposits(depsRes.data?.data ?? depsRes.data ?? []);
      setWithdrawals(wdsRes.data?.data ?? wdsRes.data ?? []);
      setInvestments(invRes.data?.data ?? invRes.data ?? []);

      const newBalance = balRes.data?.balance ?? 0;
      setBalance(newBalance);
      console.log("✅ Balance sync success:", newBalance);

    } catch (err) {
      console.error("❌ Sync error:", err?.response?.data || err.message);

      if (
        err.response?.status === 404 &&
        err.response?.data?.message === "User not found"
      ) {
        console.warn("⚠️ User not found, logging out...");
        localStorage.clear();
        window.location.href = "/login";
      } else if (err.response?.status === 403) {
        console.warn(
          "⚠️ Forbidden access to resource. Keeping session."
        );
        setSyncError("Forbidden: Cannot access this resource.");
      } else {
        setSyncError("Failed to sync wallet. Showing last known data.");
      }
    } finally {
      setLoading(false);
      syncing.current = false;
    }
  }, [authUser, authToken,logout]);

  
   // ---- Auto sync every 20s & trigger on login ----
  useEffect(() => {
    if (authLoading) {
      console.log("⏳ Auth still loading, skipping balance sync...");
      return;
    }
    if (!authUser || !authToken) {
      console.log("⚠️ No authUser/token after loading, skipping balance sync...");
      return;
    }
    if (authUser.role === "admin") {
      console.log("👮 Admin logged in, skipping balance/deposit sync.");
      return;
    }

    syncFromBackend();
    const id = setInterval(syncFromBackend, 20000);
    return () => clearInterval(id);
  }, [authUser, authToken, authLoading, syncFromBackend]);


  // ---- Investments ----
 const addInvestment = async (name, amount, roi, duration) => {
    const token = authToken || localStorage.getItem("token");
    const userId = authUser?._id || localStorage.getItem("userId");

    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.post("/api/investments", { name, amount, roi, duration }, { headers });

    if (res.data?.investment) {
      setInvestments(prev => [res.data.investment, ...prev]);
      setBalance(res.data.balance ?? balance);
    }
    await syncFromBackend();
  };

  const cancelInvestment = async (investmentId) => {
    const token = authToken || localStorage.getItem("token");
    const userId = authUser?._id || localStorage.getItem("userId");

    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.post("/api/investments/cancel", { investmentId, userId }, { headers });

    if (res.data.success) {
      setInvestments(prev => prev.map(inv => inv._id === investmentId ? { ...inv, status: "cancelled" } : inv));
      await syncFromBackend();
    } else {
      throw new Error(res.data.message || "Cancel failed");
    }
  };

  // ---- Withdrawals ----
  const withdrawableProfit = useMemo(() => {
    return (investments || [])
      .filter(inv => inv.status === "completed")
      .reduce((sum, inv) => sum + (Number(inv.expectedReturn || 0) - Number(inv.amount || 0)), 0);
  }, [investments]);

  const requestWithdrawal = async ({ amount, method, address }) => {
    const token = authToken || localStorage.getItem("token");
    const userId = authUser?._id || localStorage.getItem("userId");

    if (!userId || !token) throw new Error("User not logged in.");

    if (!address || !amount || amount < 1) throw new Error("Invalid withdrawal data.");

    if (amount > withdrawableProfit) throw new Error("You can only withdraw matured profits.");

    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.post("/api/withdrawals", { userId, method, amount, address }, { headers });

    const created = res.data?.data || res.data?.withdrawal;
    setWithdrawals((prev) => [created, ...prev]);
    await syncFromBackend();
    return created;
  };


  // ---- Transactions sorted ----
  const transactions = useMemo(() => {
    return [...deposits, ...withdrawals, ...investments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [deposits, withdrawals, investments]);

  return (
    <BalanceContext.Provider
      value={{
        user:authUser,
        balance,
        deposits,
        withdrawals,
        investments,
        withdrawableProfit,
        transactions,
        loading,
        syncError,
        syncFromBackend,
        requestWithdrawal,
        addInvestment,
        cancelInvestment,
        setInvestments,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
