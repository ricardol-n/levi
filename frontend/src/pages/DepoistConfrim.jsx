// pages/DepositConfirmationPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import MessageBox from "./MessageBox";
import { useBalance } from "../BalanceContext";

export const DepositConfirmationPage = () => {
  const API_BASE = import.meta.env.VITE_API_URL; // ✅ Use .env base URL

  const location = useLocation();
  const navigate = useNavigate();
  const { syncFromBackend } = useBalance();

  const { amount, conversionRate, checkoutUrl } = location.state || {};
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usdAmount, setUsdAmount] = useState(location.state?.amount || 10);
  const [btcPrice, setBtcPrice] = useState(0);
  const [btcEquivalent, setBtcEquivalent] = useState(null);
  const [depositId, setDepositId] = useState(null);
  const [status, setStatus] = useState("pending");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ✅ Fetch BTC price when page loads
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await axios.get(`${API_BASE}/rates`);
        const coingecko = res?.data?.data;
        setBtcPrice(coingecko?.bitcoin?.usd || conversionRate || 0);
      } catch (err) {
        console.error("BTC price fetch error:", err.message);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [conversionRate, API_BASE]);

  // ✅ Convert USD → BTC whenever input changes
  useEffect(() => {
    if (usdAmount && btcPrice) {
      setBtcEquivalent((usdAmount / btcPrice).toFixed(8));
    }
  }, [usdAmount, btcPrice]);

  // ✅ Create BTC invoice
  const createBTCPayInvoice = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`${API_BASE}/create-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: usdAmount, userId }),
      });
      const data = await res.json();

      if (data.success && data.checkoutUrl && data.deposit?._id) {
        setDepositId(data.deposit._id);
        window.location.href = data.checkoutUrl;
      } else {
        setMessage("❌ Failed to create BTC invoice.");
        setShowMessageBox(true);
      }
    } catch (err) {
      console.error("BTCPay invoice error:", err);
      setMessage("❌ Error connecting to payment gateway.");
      setShowMessageBox(true);
    }
  };

  // ✅ Check for pending deposit
  useEffect(() => {
    const checkPendingDeposit = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await fetch(`${API_BASE}/deposits?userId=${userId}`);
        const deposits = await res.json();
        const pending = deposits.find((d) => d.status === "pending");

        if (pending) {
          setDepositId(pending._id);

          if (pending.checkoutUrl) {
            window.location.href = pending.checkoutUrl;
          }
        } else if (usdAmount) {
          createBTCPayInvoice();
        } else {
          setMessage("No deposit in progress.");
          setShowMessageBox(true);
        }
      } catch (err) {
        console.error("Error fetching pending deposits:", err);
      }
    };

    checkPendingDeposit();
  }, [usdAmount, API_BASE]);

  // ✅ Poll backend for deposit confirmation
  useEffect(() => {
    if (!depositId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/deposit-status/${depositId}`);
        const data = await res.json();

        if (data.checkoutUrl && !window.checkoutOpened) {
          window.checkoutOpened = true;
          window.location.href = data.checkoutUrl;
        }

        if (data?.status === "confirmed") {
          setStatus("confirmed");
          await syncFromBackend();
          clearInterval(interval);
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error checking deposit status:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [depositId, navigate, syncFromBackend, API_BASE]);

  if (!usdAmount) {
    return <p>❌ Missing deposit details. Please start again.</p>;
  }

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="deposit-confirm-card">
            <h2>
              {status === "pending"
                ? "Processing your deposit..."
                : "Deposit Confirmed!"}
            </h2>

            <div className="details">
              <p>
                <strong>Amount in USD:</strong> ${usdAmount.toFixed(2)}
              </p>
              <p>
                <strong>BTC Price:</strong> ${btcPrice.toLocaleString()}
              </p>
              <p>
                <strong>You will send:</strong>{" "}
                {btcEquivalent || "Loading..."} BTC
              </p>
            </div>

            {status === "pending" && (
              <p className="redirect-text">🔄 Redirecting to secure checkout...</p>
            )}
            {status === "confirmed" && (
              <p className="redirect-text">
                ✅ Deposit confirmed! Redirecting to dashboard...
              </p>
            )}

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                marginTop: "20px",
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                background: "linear-gradient(to right, #ff9900, #ff6600)",
                color: "white",
                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              }}
            >
              ⬅ Back to Dashboard
            </button>

            <MessageBox
              show={showMessageBox}
              message={message}
              onClose={() => setShowMessageBox(false)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
