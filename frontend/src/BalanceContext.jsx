import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";

export const BalanceContext = createContext();

export const useBalance = () => useContext(BalanceContext);

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState("");

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // ---- Helpers --------------------------------------------------------------

  const computeFallbackBalance = (deps = [], wds = []) => {
    // Only count confirmed BTC deposits and approved BTC withdrawals
    const confirmedDeposits = deps
      .filter(
        (d) => (d.status || "").toLowerCase() === "confirmed" && d.currency === "BTC"
      )
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const approvedWithdrawals = wds
      .filter(
        (w) => (w.status || "").toLowerCase() === "approved" && w.method === "BTC"
      )
      .reduce((sum, w) => sum + Number(w.amount || 0), 0);

    return Math.max(0, confirmedDeposits - approvedWithdrawals);
  };

  // ---- Sync from backend ----------------------------------------------------

  const syncFromBackend = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setSyncError("");

    try {
       // Safe GET helper
    const safeGet = async (url, params = {}) => {
      try {
        const res = await axios.get(url, { params });
        if (Array.isArray(res.data)) return res.data; // ✅ expected list
        return []; // fallback if backend sends {success:false}
      } catch (err) {
        console.warn(`⚠️ Failed fetching ${url}:`, err?.response?.data || err.message);
        return [];
      }
    };

    // 1) Pull deposits + withdrawals
    const [depsRaw, wdsRaw] = await Promise.all([
      safeGet(`/api/deposits`, { userId }),
      safeGet(`/api/withdrawals`, { userId }),
    ]);
      // ✅ Filter BTC only
      const deps = depsRaw.filter((d) => d.currency === "BTC");
      const wds = wdsRaw.filter((w) => w.method === "BTC");

      setDeposits(deps);
      setWithdrawals(wds);

      // 2) Fetch canonical balance
      try {
        const balRes = await axios.get(`/api/users/${userId}/balance`);
        if (typeof balRes.data?.balance === "number") {
          setBalance(balRes.data.balance);
        } else {
          setBalance(computeFallbackBalance(deps, wds));
        }
      } catch {
        setBalance(computeFallbackBalance(deps, wds));
      }
    } catch (err) {
      console.error("❌ Sync error:", err?.response?.data || err.message);
      setSyncError("Failed to sync wallet. Showing last known data.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial sync
  useEffect(() => {
    if (userId) syncFromBackend();
  }, [userId, syncFromBackend]);

  // Auto-refresh every 20s
  useEffect(() => {
    if (!userId) return;
    const id = setInterval(syncFromBackend, 20000);
    return () => clearInterval(id);
  }, [userId, syncFromBackend]);

  // ---- Investments (unchanged) ----------------------------------------------

  const addInvestment = (name, amount, expectedReturn, duration) => {
    if (!duration || isNaN(duration) || duration <= 0) return;

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + duration * 24 * 60 * 60 * 1000
    );

    if (isNaN(startDate) || isNaN(endDate)) return;

    setInvestments((prev) => [
      ...prev,
      {
        name,
        amount: Number(amount),
        expectedReturn: Number(expectedReturn),
        completed: false,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    ]);
  };

  // Check matured investments every 5s
  useEffect(() => {
    const tick = () => {
      setInvestments((prev) =>
        prev.map((inv) => {
          const matured = !inv.completed && new Date(inv.endDate) <= new Date();
          if (matured) {
            const payout =
              Number(inv.amount) +
              (Number(inv.amount) * Number(inv.expectedReturn)) / 100;
            setBalance((prevBal) => prevBal + payout);
            return { ...inv, completed: true };
          }
          return inv;
        })
      );
    };
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  const cancelInvestment = (index) => {
    setInvestments((prev) => {
      const inv = prev[index];
      if (!inv || inv.completed) return prev;
      const penalty = Number(inv.amount) * 0.2;
      const refund = Number(inv.amount) - penalty;
      setBalance((prevBal) => prevBal + refund);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ---- Withdrawals (BTC only) -----------------------------------------------

  const requestWithdrawal = async ({ amount, address }) => {
    if (!userId) throw new Error("User not logged in.");
    const amt = Number(amount);

    if (!address || !amt || amt < 1) {
      throw new Error("Invalid withdrawal data. Minimum is $100.");
    }
    if (amt > balance) throw new Error("Insufficient balance.");

    // POST to backend
    const res = await axios.post(`/api/withdrawals`, {
      userId,
      method: "BTC", // ✅ force BTC
      amount: amt,
      address,
    });

    const created =
      res.data?.withdrawal ||
      res.data?.data ||
      res.data || {
        userId,
        method: "BTC",
        amount: amt,
        address,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

    setWithdrawals((prev) => [created, ...prev]);
    setBalance((prev) => Math.max(0, prev - amt));

    // Re-sync
    syncFromBackend();

    return created;
  };

  // ---- Public API -----------------------------------------------------------

  return (
    <BalanceContext.Provider
      value={{
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
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
