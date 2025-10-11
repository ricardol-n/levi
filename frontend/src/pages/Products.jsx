// ✅ frontend/pages/Deposit.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import bitcoin from "./asset/bitcoin.png";
import { BalanceContext } from "../BalanceContext";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export const Deposit = () => {
  const API_BASE = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputBoxRef = useRef(null);

  const { user } = useContext(AuthContext);
  const { balance } = useContext(BalanceContext);

  const [btcPrice, setBtcPrice] = useState(0);
  const MIN_DEPOSIT = 1;
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ✅ Fetch BTC/USD conversion rate
  useEffect(() => {
    const fetchConversionRates = async () => {
      try {
        const response = await axios.get(`${API_BASE}/rates`);
        const coingecko = response?.data?.data;
        setBtcPrice(coingecko?.bitcoin?.usd || 0);
      } catch (error) {
        console.error("❌ Failed to fetch conversion rates:", error.message || error);
      }
    };

    fetchConversionRates();
  }, [API_BASE]);

  // ✅ Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputBoxRef.current && !inputBoxRef.current.contains(event.target)) {
        setShowInput(false);
      }
    };
    if (showInput) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInput]);

  const handlePayNow = () => {
    setAmount("");
    setMessage({ type: "", text: "" });
    setShowInput(true);
  };

  const handleDeposit = async () => {
  const depositAmount = parseFloat(amount);
  const userId = localStorage.getItem("userId");

  if (!userId) {
    setMessage({ type: "error", text: "⚠️ Please log in before depositing." });
    return;
  }

  if (isNaN(depositAmount) || depositAmount < MIN_DEPOSIT) {
    setMessage({ type: "error", text: `Minimum deposit is $${MIN_DEPOSIT}` });
    return;
  }

  try {
    console.log("🌐 Sending to API:", `${API_BASE}/create-invoice`);
    console.log("🧾 Creating invoice with:", { userId, amount: depositAmount });

    const res = await axios.post(`${API_BASE}/create-invoice`, {
      userId,
      amount: depositAmount,
    });

    const { success, checkoutUrl, testMode } = res.data;

    if (!success || !checkoutUrl) {
      console.error("❌ Invalid invoice response:", res.data);
      setMessage({
        type: "error",
        text: res.data?.message || "❌ Failed to create invoice.",
      });
      return;
    }

    // ✅ Optional: auto-redirect to BTCPay
    if (!testMode && checkoutUrl.includes("btcpay")) {
      window.location.href = checkoutUrl;
      return;
    }

    // ✅ Navigate to confirmation page
    navigate("/depositconfirmationpage", {
      state: { method: "Bitcoin", amount: depositAmount, checkoutUrl, testMode },
    });
  } catch (err) {
    console.error("❌ Error creating invoice:", err.response?.data || err.message);
    setMessage({
      type: "error",
      text: `❌ Failed to create invoice. ${
        err.response?.data?.message || "Server error"
      }`,
    });
  }
};


  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="deposit-container">
            <div className="deposit-card">
              <div className="item">
                <div className="caption">
                  One small deposit for you, one giant leap for your balance. 🌕
                </div>

                <div className="card-xrp">
                  <img src={bitcoin} alt="Bitcoin" className="bitcoin" />
                </div>

                <button className="pay-btn" onClick={handlePayNow}>
                  Pay now
                </button>
              </div>

              {message.text && (
                <div
                  style={{
                    padding: "10px",
                    marginBottom: "20px",
                    color: message.type === "success" ? "#4CAF50" : "#F44336",
                    border: `1px solid ${
                      message.type === "success" ? "#4CAF50" : "#F44336"
                    }`,
                    borderRadius: "4px",
                    backgroundColor:
                      message.type === "success" ? "#e8f5e9" : "#ffebee",
                  }}
                >
                  {message.text}
                </div>
              )}

              {showInput && (
                <div className="deposit-popup" ref={inputBoxRef}>
                  <button
                    onClick={() => setShowInput(false)}
                    className="close-btn"
                    aria-label="close"
                  >
                    &times;
                  </button>

                  <h3>
                    Deposit via:{" "}
                    <span style={{ color: "#4CAF50" }}>Bitcoin</span>
                  </h3>
                  <label htmlFor="amount">Enter deposit amount ($):</label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />

                  {btcPrice > 0 && amount && (
                    <p>≈ {(parseFloat(amount) / btcPrice).toFixed(8)} BTC</p>
                  )}

                  <button onClick={handleDeposit} className="pay-btn">
                    Confirm Deposit
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


export const DepositLog = () => {
  const { deposits, loading } = useContext(BalanceContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="deposit-log-container">
            <h2>Deposit History</h2>

            {loading ? (
              <p>Loading...</p>
            ) : deposits.length === 0 ? (
              <p>No deposit yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Currency</th>
                      <th>Amount ($)</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((d, index) => (
                      <tr key={d._id || index}>
                        <td>{index + 1}</td>
                        <td>{d.currency || "BTC"}</td>
                        <td>${Number(d.amount || 0).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${(d.status || "pending").toLowerCase()}`}>
                            {d.status || "pending"}
                          </span>
                        </td>
                        <td>{new Date(d.createdAt || d.date || Date.now()).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
