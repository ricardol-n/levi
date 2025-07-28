// pages/DepoistConfrim.jsx
import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BalanceContext } from "../BalanceContext";
import Header from "../Header";
import Sidebar from "../Sidebar";
import MessageBox from "./MessageBox";

export const DepositConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setBalance, addTransaction } = useContext(BalanceContext);

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(true);

  if (!location.state) {
    return <div className="error-message">No deposit data. Return to deposit page.</div>;
  }

  const {address, amount, charge, method, conversionRate } = location.state;
  const total = amount + charge;
  const cryptoAmount = (amount * conversionRate).toFixed(6);

  const methodMap = {
    "Bitcoin": "BTC",
    "Dogecoin": "DOGE",
    "Ethereum": "ETH",
    "USDT ERC20": "USDT_ERC20",
    "USDT TRC20": "USDT_TRC20",
    "XRP": "XRP"
  };

  // 🧠 Load actual wallet address from backend
  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`/api/user/${userId}/wallets`);
        const data = await res.json();

        if (data.success) {
          const chainKey = methodMap[method];
          const address = data.depositAddresses[chainKey];
          setWalletAddress(address);
        } else {
          setMessage("❌ Could not load wallet address.");
          setShowMessageBox(true);
        }
      } catch (err) {
        console.error("Failed to fetch wallet address:", err);
        setMessage("❌ Error fetching wallet address.");
        setShowMessageBox(true);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchWalletAddress();
  }, [method]);

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setMessage("✅ Wallet address copied.");
      setShowMessageBox(true);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="deposit-confirmation">
            <h2>Deposit Confirmation</h2>
            <p><strong>Method:</strong> {method}</p>
            <p><strong>Amount:</strong> ${amount.toFixed(2)}</p>
            <p><strong>Fee:</strong> ${charge.toFixed(2)}</p>
            <p><strong>Total:</strong> ${total.toFixed(2)}</p>
            <p><strong>Rate:</strong> 1 USD = {conversionRate} {method}</p>
            <p><strong>You will send:</strong> {cryptoAmount} {method}</p>
            <p><strong>Send to:</strong> <code>{loadingAddress ? "Loading..." : walletAddress}</code></p>
            <button onClick={copyToClipboard}>📋 Copy Address</button>

            <div style={{ marginTop: "30px", color: "#4CAF50", fontWeight: "bold" }}>
              ⏳ Waiting for blockchain confirmation...
              <br />
              Your account will be credited automatically once we receive the payment.
            </div>

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
