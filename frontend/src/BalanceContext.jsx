import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./context/AuthContext";

export const BalanceContext = createContext();
export const useBalance = () => useContext(BalanceContext);

export const BalanceProvider = ({ children }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user || null;
  const token = auth?.token || localStorage.getItem("token") || null;
  const logout = auth?.logout || (() => {});
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState("");
  const [transaction,setTransation] = useState(0);

  const userId = user?._id || (typeof window !== "undefined" ? localStorage.getItem("userId") : null);

  // ---- Sync from backend ----------------------------------------------------
  const syncFromBackend = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setSyncError("");

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Fetch deposits + withdrawals (BTC only)
      const [depsRes, wdsRes, invRes, balRes] = await Promise.all([
        axios.get(`/api/users/${userId}/deposits`, {headers}),
        axios.get(`/api/users/${userId}/withdrawals`, { headers }),
        axios.get(`/api/investments`, {headers}),
        axios.get(`/api/users/${userId}/balance`, { headers }),

      ]);

      setDeposits(depsRes.data?.data || []);
      setWithdrawals(wdsRes.data?.data || []);
      setInvestments(invRes.data?.data || []);
      setBalance(balRes.data?.balance || 0);

    } catch (err) {
      console.error("❌ Sync error:", err?.response?.data || err.message);
    
      // ✅ Auto-logout if backend says user not found
      if (err.response?.status === 404 && err.response?.data?.message === "User not found") {
        console.warn("⚠️ Invalid userId detected. Clearing session...");
         localStorage.removeItem("userId");
         localStorage.removeItem("user");
         localStorage.removeItem("token");
         window.location.href = "/login"; // redirect instantly

      } else {
        setSyncError("Failed to sync wallet. Showing last known data.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  // Initial sync
  useEffect(() => {
  if (!userId || userId.length !== 24) { 
    console.warn("⚠️ Invalid userId in localStorage. Clearing...");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return; // stop here
  }
  syncFromBackend();
}, [userId, syncFromBackend]);
  // Auto-refresh every 20s
  useEffect(() => {
    if (!userId) return;
    const id = setInterval(syncFromBackend, 20000);
    return () => clearInterval(id);
  }, [userId, syncFromBackend]);

  // ---- Investments ----------------------------------------------------------
  const addInvestment = (name, amount, roi, duration) => {
    if (!duration || isNaN(duration) || duration <= 0) return;

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + duration * 24 * 60 * 60 * 1000
    );

    if (isNaN(startDate) || isNaN(endDate)) return;

    const profitOnly = (Number(amount) * Number(roi)) / 100;

    setInvestments((prev) => [
      ...prev,
      {
        name,
        amount: Number(amount),
        roi:Number(roi),
        expectedReturn: profitOnly,
        completed: false,
        status:"active",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    ]);
      // ✅ Deduct balance immediately
      setBalance((prevBal) => prevBal - Number(amount));
  };

  // Check matured investments every 5s
 useEffect(() => {
  const tick = () => {
    setInvestments((prev) =>
      prev.map((inv) => {
        const matured = inv.status === "active" && !inv.completed && new Date(inv.endDate) <= new Date();
        if (matured) {
          const payout = Number(inv.amount) + Number(inv.expectedReturn); // principal + profit
          setBalance((prevBal) => prevBal + payout);
          return { ...inv, completed: true, status: "matured" };
        }
        return inv;
      })
    );
  };
  const id = setInterval(tick, 5000);
  return () => clearInterval(id);
}, []);

const cancelInvestment = async (investmentId) => {
  try {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const res = await axios.post(
      "/api/investments/cancel",
      { investmentId, userId},
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send token
        },
      }
    );

    if (res.data.success) {
      setInvestments((prev) =>
        prev.map((inv) =>
          inv._id === investmentId ? { ...inv, status: "cancelled" } : inv
        )
      );
    } else {
      throw new Error(res.data.message || "Cancel failed");
    }
  } catch (err) {
    console.error("❌ Cancel investment error:", err.response?.data || err.message);
    throw err.response?.data || { message: "Server error cancelling investment." };
  }
};

  // ---- Withdrawals (BTC only) -----------------------------------------------
const requestWithdrawal = async ({ amount, address }) => {
  if (!userId) throw new Error("User not logged in.");
  const amt = Number(amount);

  if (!address || !amt || amt < 1) {
    throw new Error("Invalid withdrawal data. Minimum is $1.");
  }

  // ✅ Only allow profit withdrawals
  const totalProfits = investments
    .filter(inv => inv.status === "matured")
    .reduce((sum, inv) => sum + Number(inv.expectedReturn || 0), 0);

  if (amt > totalProfits) {
    throw new Error("You can only withdraw matured profits.");
  }

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await axios.post(
    `/api/withdrawals`,
    {
      userId,
      method: "BTC",
      amount: amt,
      address,
    },
    { headers }
  );

  const created = res.data?.withdrawal || res.data;
  setWithdrawals((prev) => [created, ...prev]);

  // 🔄 sync after withdrawal
  syncFromBackend();
  return created;
};



  // ---- Public API -----------------------------------------------------------
  return (
    <BalanceContext.Provider
      value={{
        user,
        balance,
        deposits,
        withdrawals,
        investments,
        loading,
        syncError,
        syncFromBackend,
        requestWithdrawal,
        addInvestment,
        cancelInvestment,
        setInvestments,
        transactions: [...deposits, ...withdrawals, ...investments],
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
