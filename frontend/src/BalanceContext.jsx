import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "../src/utils/axios";
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

export const BalanceContext = createContext(null);
export const useBalance = () => useContext(BalanceContext);

// ===============================
// 🔐 SAFE NUMBER
// ===============================
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const BalanceProvider = ({ children }) => {
  const { user, token, logout, loading: authLoading } = useContext(AuthContext);

  const navigate = useNavigate();

  // ===============================
  // 💰 STATE (DISPLAY ONLY)
  // ===============================
  const [balance, setBalance] = useState(0);
  const [maturedProfit, setMaturedProfit] = useState(0);
  const [withdrawnProfit, setWithdrawnProfit] = useState(0);

  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===============================
  // 🌍 AXIOS (SINGLE SOURCE TOKEN)
  // ===============================
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // ===============================
  // 🔁 SYNC FROM BACKEND
  // ===============================
  const syncFromBackend = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [userRes, depRes, witRes, invRes] = await Promise.all([
        axios.get("/users/me"),
        axios.get("/users/me/deposits"),
        axios.get("/users/me/withdrawals"),
        axios.get("/investments"),
      ]);

      const u = userRes.data?.data || userRes.data;


      setBalance(toNumber(u.balance));
      setMaturedProfit(toNumber(u.maturedProfit));
      setWithdrawnProfit(toNumber(u.withdrawnProfit));

      setDeposits(depRes.data?.data || []);
      setWithdrawals(witRes.data?.data || []);
      setInvestments(invRes.data?.data || []);
    } catch (err) {
      console.error("❌ Balance sync failed:", err);

      if (err.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      } else {
        setError("Failed to load wallet data");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  // ===============================
  // 🚀 INITIAL LOAD
  // ===============================
  useEffect(() => {
    if (authLoading || !user || !token) return;

    syncFromBackend(); // initial load
    const interval = setInterval(syncFromBackend, 20000); // repeat

    return () => clearInterval(interval);
  }, [authLoading, user, token, syncFromBackend]);

  // ===============================
  // 📊 DERIVED VALUES
  // ===============================
  const withdrawableProfit = useMemo(() => {
    return Math.max(maturedProfit - withdrawnProfit, 0);
  }, [maturedProfit, withdrawnProfit]);


  // ===============================
// ❌ CANCEL INVESTMENT
// ===============================
const cancelInvestment = async (investmentId) => {
  try {
    const res = await axios.post(
      "/investments/cancel",
      {
        investmentId,
      }
    );

    if (!res.data.success) {
      throw new Error(
        res.data.message ||
        "Failed to cancel investment"
      );
    }

    // Refresh wallet + investments
    await syncFromBackend();

    return res.data;
  } catch (err) {
    console.error(
      "❌ Cancel Investment Error:",
      err
    );

    throw new Error(
      err.response?.data?.message ||
      "Unable to cancel investment"
    );
  }
};

  // ===============================
  // 📤 WITHDRAW PROFIT
  // ===============================
  const requestWithdrawal = async ({ amount, method, address }) => {
    amount = toNumber(amount);

    if (amount <= 0) throw new Error("Invalid amount");
    if (amount > withdrawableProfit)
      throw new Error("Insufficient matured profit");

    await axios.post("/withdrawals", {
      amount,
      method,
      address,
    });

    

    await syncFromBackend();

    
  };

  // ===============================
  // 📦 CONTEXT VALUE
  // ===============================
  return (
    <BalanceContext.Provider
      value={{
        balance,
        maturedProfit,
        withdrawnProfit,
        withdrawableProfit,
        deposits,
        withdrawals,
        investments,
        loading,
        error,
        syncFromBackend,
        requestWithdrawal,
        cancelInvestment,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
