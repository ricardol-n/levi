// pages/DepoistConfrim.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import MessageBox from "./MessageBox";

export const DepositConfirmationPage = () => {
  const location = useLocation();
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");

  if (!location.state) {
    return <div className="error-message">No deposit data. Return to deposit page.</div>;
  }

  const { amount, charge, method, conversionRate } = location.state;
  const total = amount + charge;
  const cryptoAmount = (amount / conversionRate).toFixed(8);

  useEffect(() => {
    const createBTCPayInvoice = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await fetch("/api/create-invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: cryptoAmount, // total in USD
            currency: "BTC",
            userId,
          }),
        });

        const data = await res.json();
        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl; // redirect to BTCPay
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

    createBTCPayInvoice();
  }, []);

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="deposit-confirmation">
            <h2>Creating BTCPay Invoice...</h2>
            <p><strong>Method:</strong> {method}</p>
            <p><strong>Amount:</strong> ${amount.toFixed(2)}</p>
            <p><strong>Fee:</strong> ${charge.toFixed(2)}</p>
            <p><strong>Total:</strong> ${total.toFixed(2)}</p>
            <p><strong>Rate:</strong> 1 {method} = ${conversionRate.toLocaleString()}</p>
            <p><strong>You will send:</strong> {cryptoAmount} {method}</p>
            <p>🔄 Redirecting to secure checkout...</p>

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
