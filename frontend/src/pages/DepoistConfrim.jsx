// pages/DepoistConfrim.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import MessageBox from "./MessageBox";
import { useBalance } from "../BalanceContext";

export const DepositConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { syncFromBackend } = useBalance();
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depositId, setDepositId] = useState(null);
  const [status, setStatus] = useState("pending");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!location.state) {
    return <div className="error-message">No deposit data. Return to deposit page.</div>;
  }

  const { amount, charge, method, conversionRate } = location.state;
  const total = amount + charge;
  const cryptoAmount = (amount / conversionRate).toFixed(8);

  

  // Step 0: On page load, check for any pending deposit
  useEffect(() => {
    const checkPendingDeposit = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await fetch(`/api/deposits?userId=${userId}`);
        const deposits = await res.json();
        const pending = deposits.find(d => d.status === "pending");
        if (pending) {
          setDepositId(pending._id);
        } else if (amount) {
          // Only create a new invoice if coming here from a fresh deposit
          createBTCPayInvoice();
        } else {
          setMessage("No deposit in progress.");
          setShowMessageBox(true);
        }
      } catch (err) {
        console.error("Error fetching pending deposits:", err);
      }
    };

    const createBTCPayInvoice = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await fetch("/api/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: cryptoAmount, currency: "BTC", userId }),
        });
        const data = await res.json();
        if (data.success && data.checkoutUrl && data.deposit?._id) {
          setDepositId(data.deposit._id);
          window.location.href = data.checkoutUrl;
        } else {
          setMessage("❌ Failed to create invoice.");
          setShowMessageBox(true);
        }
      } catch (err) {
        console.error("BTCPay invoice error:", err);
        setMessage("❌ Error connecting to payment gateway.");
        setShowMessageBox(true);
      }
    };

    checkPendingDeposit();
  }, [amount, cryptoAmount]);


  // Step 1: Poll backend for deposit confirmation
  useEffect(() => {
    if (!depositId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/deposit-status/${depositId}`);
        const data = await res.json();

        if (data?.status === "confirmed") {
          setStatus("confirmed");
          // Update balance via BalanceContext
          await syncFromBackend(); // fetch latest deposits/withdrawals
          clearInterval(interval);
          // Redirect to dashboard
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error checking deposit status:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [depositId, navigate, syncFromBackend]);

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
        <main className="main-content">
          <div className="deposit-confirm-card">
            <h2>{status === "pending" ? "Processing your deposit..." : "Deposit Confirmed!"}</h2>
            {amount && (
              <div className="details">
                  <p><strong>Method:</strong> {method}</p>
                  <p><strong>Amount:</strong> ${amount.toFixed(2)}</p>
                  <p><strong>Fee:</strong> ${charge.toFixed(2)}</p>
                  <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                  <p><strong>Rate:</strong> 1 {method} = ${conversionRate.toLocaleString()}</p>
                  <p><strong>You will send:</strong> {cryptoAmount} {method}</p>
              </div>
            )}
            {status === "pending" && <p className="redirect-text">🔄 Redirecting to secure checkout...</p>}
            {status === "confirmed" && <p className="redirect-text">✅ Deposit confirmed! Redirecting to dashboard...</p>}
            
            {/* ✅ New Back Button */}
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
