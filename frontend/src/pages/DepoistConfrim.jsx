// pages/DepositConfirmationPage.jsx
import React, { useState, useEffect } from "react";
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

  const { amount } = location.state || {};
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depositId, setDepositId] = useState(null);
  const [status, setStatus] = useState("pending");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ✅ Create BTCPay invoice (let BTCPay handle conversion)
  const createBTCPayInvoice = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`${API_BASE}/create-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, userId }),
      });
      const data = await res.json();
      console.log("create-invoice response:", res.status, data);

      const checkoutUrl = data.checkoutUrl || data.checkoutLink || data.invoice?.checkoutLink || data.checkout_link;
      if (data.success && checkoutUrl && data.deposit?._id) {
        setDepositId(data.deposit._id);
        window.location.href = checkoutUrl;
      } else {
        console.error("Create invoice failed:", data);
        setMessage(data.message || "❌ Failed to create BTC invoice.");
        setShowMessageBox(true);
      }
    } catch (err) {
      console.error("BTCPay invoice error:", err);
      setMessage("❌ Error connecting to payment gateway.");
      setShowMessageBox(true);
    }
  };

  // ✅ Check for existing pending deposit
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
        } else if (amount) {
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
  }, [amount, API_BASE]);

  // ✅ Poll backend for deposit confirmation
  useEffect(() => {
    if (!depositId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/deposit-status/${depositId}`);
        const data = await res.json();

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

  if (!amount) {
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
                <strong>Amount in USD:</strong> ${amount.toFixed(2)}
              </p>
              <p>💰 BTC amount will be calculated automatically by BTCPay Server.</p>
            </div>

            {status === "pending" && (
              <p className="redirect-text">🔄 Redirecting to secure BTCPay checkout...</p>
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
