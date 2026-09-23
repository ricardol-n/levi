import React, { useContext, useState,useEffect } from "react";
import { BalanceContext } from "../BalanceContext";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {AuthContext} from "../context/AuthContext"

export const Withdraw = () => {
  const {
    maturedProfit,
    withdrawableProfit,
    requestWithdrawal,
    loading,
    syncError,
    syncFromBackend, // ✅ ensure BalanceContext provides current user info
  } = useContext(BalanceContext);

  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const {user} = useContext(AuthContext);

  useEffect(() => {
  syncFromBackend();
}, [syncFromBackend]);

  // ✅ Handle submission
const onSubmit = async () => {
  setMessage({ type: "", text: "" });

  try {
    if (!user?._id) {
      throw new Error("User not logged in.");
    }

    if (!selectedMethod) {
      throw new Error("Please select a withdrawal method.");
    }

    const cleanAddress = address.trim();

    if (!cleanAddress) {
      throw new Error("Please enter your wallet address.");
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error("Please enter a valid withdrawal amount.");
    }

    // Frontend validation only.
    // Backend MUST enforce this again.
    const MIN_WITHDRAWAL = 5000;

    if (numericAmount < MIN_WITHDRAWAL) {
      throw new Error(
        `Minimum withdrawal amount is $${MIN_WITHDRAWAL.toLocaleString()}.`
      );
    }

    if (numericAmount > Number(withdrawableProfit || 0)) {
      throw new Error(
        `You can only withdraw up to your matured profit of $${Number(
          withdrawableProfit || 0
        ).toFixed(2)}.`
      );
    }

    const res = await requestWithdrawal({
      method: selectedMethod,
      amount: numericAmount,
      address: cleanAddress,
    });

    setMessage({
      type: "success",
      text:
        res?.message ||
        "Your withdrawal request has been submitted and is pending admin review.",
    });

    setAmount("");
    setAddress("");
    setSelectedMethod("");

    // Refresh balance/withdrawals after successful request
    await syncFromBackend();

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
              <h2 className="withdraw-title">💸 Withdraw Profit</h2>
              <p className="balance-info">
                Withdrawable Profit:
                <strong> ${Number(withdrawableProfit || 0).toFixed(2)}</strong>
              </p>

              {withdrawableProfit <= 0 ? (
                <p className="note">No matured profits available yet.</p>
              ) : (
                <>
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
                        <label htmlFor="amount">Amount ($) — Min $5,000</label>
                        <input
                          id="amount"
                          type="number"
                          className="withdraw-input"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          min="5000"
                        />
                      </div>

                      <button
                        onClick={onSubmit}
                        className="withdraw-button"
                        disabled={
                          loading ||
                          !selectedMethod ||
                          !address.trim() ||
                          !Number.isFinite(Number(amount)) ||
                          Number(amount) < 5000 ||
                          Number(amount) > Number(withdrawableProfit || 0)
                        }
                        >
                          {loading ? "Submitting..." : "Confirm Withdrawal"}
                      </button>
                    </>
                  )}
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
                <li>Only matured profit can be withdrawn</li>
                <li>Minimum withdrawal: $5,000</li>
                <li>Processing time: up to 24 hours</li>
                <li>Incorrect addresses may cause permanent loss</li>
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
                          <span
                            className={`badge badge-${(w.status || "pending").toLowerCase()}`}
                          >
                            {w.status || "pending"}
                          </span>
                        </td>
                        <td>
                          {new Date(w.createdAt || w.date || Date.now()).toLocaleString()}
                        </td>
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
