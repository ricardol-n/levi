import React, { useContext, useState } from "react";
import { BalanceContext } from "../BalanceContext";
import Header from "../Header";
import Sidebar from "../Sidebar";

export const Withdraw = () => {
  const {
    balance,
    requestWithdrawal,
    loading,
    syncError,
  } = useContext(BalanceContext);

  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const onSubmit = async () => {
    setMessage({ type: "", text: "" });
    try {
      await requestWithdrawal({
        method: selectedMethod,
        amount,
        address,
      });
      setMessage({
        type: "success",
        text:
          "✅ Withdrawal submitted and is now pending. Please allow up to 24 hours for processing.",
      });
      setAmount("");
      setAddress("");
      setSelectedMethod("");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to submit withdrawal.",
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="withdraw-page">
            {/* Form Card */}
            <div className="withdraw-card">
              <h2 className="withdraw-title">💸 Withdrawal</h2>
              <p className="balance-info">
                Current Balance:{" "}
                <span className="balance-amount">${balance.toFixed(2)}</span>
              </p>

              <div className="form-group">
                <label htmlFor="method">Select Method</label>
                <select
                  id="method"
                  className="withdraw-select"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  <option value="">--Choose Method--</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="ETH">Ethereum</option>
                  <option value="USDT_ERC20">USDT ERC20</option>
                  <option value="USDT_TRC20">USDT TRC20</option>
                  <option value="XRP">XRP Ripple</option>
                  <option value="DOGE">Dogecoin</option>
                </select>
              </div>

              {selectedMethod && (
                <>
                  <div className="form-group">
                    <label htmlFor="address">{selectedMethod} Address</label>
                    <input
                      id="address"
                      type="text"
                      className="withdraw-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={`Enter your ${selectedMethod} wallet address`}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="amount">Amount ($) — Min $100</label>
                    <input
                      id="amount"
                      type="number"
                      className="withdraw-input"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 250"
                      min="100"
                    />
                  </div>

                  <button
                    onClick={onSubmit}
                    className="withdraw-button"
                    disabled={loading || Number(balance) < 100}
                  >
                    {loading ? "Submitting..." : "Confirm Withdrawal"}
                  </button>
                </>
              )}

              {(message.text || syncError) && (
                <div
                  className={`alert ${
                    (message.type || (syncError && "error")) === "success"
                      ? "alert-success"
                      : "alert-error"
                  }`}
                >
                  {message.text || syncError}
                  <button
                    className="close-alert"
                    onClick={() => setMessage({ type: "", text: "" })}
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="withdraw-info">
              <h3>📌 Important</h3>
              <ul>
                <li>Minimum withdrawal: <strong>$100</strong>.</li>
                <li>Use the correct <strong>{selectedMethod || "coin"}</strong> address; wrong networks lead to permanent loss.</li>
                <li>Processing time: usually within <strong>24 hours</strong>.</li>
                <li>Network fees may apply depending on the coin/network congestion.</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const WithdrawLog = () => {
  const { withdrawals, loading } = useContext(BalanceContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <div className="team">
            <h2>Withdrawal History</h2>
            {loading ? (
              <p>Loading...</p>
            ) : withdrawals.length === 0 ? (
              <p>No withdrawals yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Method</th>
                      <th>Amount ($)</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w, i) => (
                      <tr key={w._id || i}>
                        <td>{i + 1}</td>
                        <td>{w.method}</td>
                        <td>${Number(w.amount || 0).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${(w.status || "pending").toLowerCase()}`}>
                            {w.status || "pending"}
                          </span>
                        </td>
                        <td>{new Date(w.createdAt || w.date || Date.now()).toLocaleString()}</td>
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
