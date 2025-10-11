import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import axios from "axios";
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

export const BalanceContext = createContext();
export const useBalance = () => useContext(BalanceContext);

// ✅ Global Axios setup (applies to ALL requests)
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const BalanceProvider = ({ children }) => {
  const { user: authUser, token: authToken, logout, loading: authLoading } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState("");
  const syncing = useRef(false);

  const API_BASE = import.meta.env.VITE_API_URL;
  console.log("🌍 Using API base:", API_BASE);

  // ✅ Keep axios in sync with token
  useEffect(() => {
    axios.defaults.baseURL = API_BASE;
    const token = authToken || localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }, [authToken, API_BASE]);

  // ✅ Refresh Access Token
  const refreshAccessToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) throw new Error("No refresh token found");

      const res = await axios.post(`/auth/refresh-token`, {
        refreshToken: storedRefreshToken,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
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

  // ✅ Intercept 401 errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch {
            logout();
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ✅ Sync Data From Backend
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

    const investmentsUrl =
      authUser?.role === "admin" ? `/investments/all` : `/investments`;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [depsRes, wdsRes, invRes, balRes] = await Promise.all([
        axios.get(`/users/${userId}/deposits`, { headers }),
        axios.get(`/users/${userId}/withdrawals`, { headers }),
        axios.get(investmentsUrl, { headers }),
        axios.get(`/users/${userId}/balance`, { headers }),
      ]);

      setDeposits(depsRes.data?.data ?? depsRes.data ?? []);
      setWithdrawals(wdsRes.data?.data ?? wdsRes.data ?? []);
      setInvestments(invRes.data?.data ?? invRes.data ?? []);
      setBalance(balRes.data?.balance ?? 0);

      console.log("✅ Balance sync successful");
    } catch (err) {
      console.error("❌ Sync error:", err?.response?.data || err.message);
      if (err.response?.status === 404 && err.response?.data?.message === "User not found") {
        localStorage.clear();
        navigate("/login", { replace: true });
      } else if (err.response?.status === 403) {
        setSyncError("Forbidden: Cannot access this resource.");
      } else {
        setSyncError("Failed to sync wallet. Showing last known data.");
      }
    } finally {
      setLoading(false);
      syncing.current = false;
    }
  }, [authUser, authToken, logout, navigate]);

  // ✅ Auto-sync every 20s
  useEffect(() => {
    if (authLoading || !authUser || !authToken || authUser.role === "admin") return;
    syncFromBackend();
    const id = setInterval(syncFromBackend, 20000);
    return () => clearInterval(id);
  }, [authUser, authToken, authLoading, syncFromBackend]);

  // ✅ Add New Investment
  const addInvestment = async (name, amount, roi, duration) => {
    const token = authToken || localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.post(`/investments`, { name, amount, roi, duration }, { headers });
    if (res.data?.investment) {
      setInvestments((prev) => [res.data.investment, ...prev]);
      setBalance(res.data.balance ?? balance);
    }
    await syncFromBackend();
  };

  // ✅ Cancel Investment
  const cancelInvestment = async (investmentId) => {
    const token = authToken || localStorage.getItem("token");
    const userId = authUser?._id || localStorage.getItem("userId");
    const headers = { Authorization: `Bearer ${token}` };

    const res = await axios.post(`/investments/cancel`, { investmentId, userId }, { headers });

    if (res.data.success) {
      setInvestments((prev) =>
        prev.map((inv) => (inv._id === investmentId ? { ...inv, status: "cancelled" } : inv))
      );
      await syncFromBackend();
    } else {
      throw new Error(res.data.message || "Cancel failed");
    }
  };

  // ✅ Withdrawal Calculation
  const withdrawableProfit = useMemo(() => {
    return (investments || [])
      .filter((inv) => inv.status === "completed")
      .reduce(
        (sum, inv) =>
          sum + (Number(inv.expectedReturn || 0) - Number(inv.amount || 0)),
        0
      );
  }, [investments]);

  // ✅ Request Withdrawal
  const requestWithdrawal = async ({ amount, method, address }) => {
    const token = authToken || localStorage.getItem("token");
    const userId = authUser?._id || localStorage.getItem("userId");

    if (!userId || !token) throw new Error("User not logged in.");
    if (!address || !amount || amount < 1)
      throw new Error("Invalid withdrawal data.");
    if (amount > withdrawableProfit)
      throw new Error("You can only withdraw matured profits.");

    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.post(`/withdrawals`, { userId, method, amount, address }, { headers });

    const created = res.data?.data || res.data?.withdrawal;
    setWithdrawals((prev) => [created, ...prev]);
    await syncFromBackend();
    return created;
  };

  // ✅ Merge Transactions
  const transactions = useMemo(() => {
    return [...deposits, ...withdrawals, ...investments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [deposits, withdrawals, investments]);

  return (
    <BalanceContext.Provider
      value={{
        user: authUser,
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
