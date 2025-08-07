import React, { useContext, useEffect, useRef, useState } from 'react';
import bitcoin from './asset/bitcoin.png';
import { BalanceContext } from '../BalanceContext';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { AuthContext } from "../context/Authcontext";
import axios from 'axios';

export const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const inputBoxRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { balance } = useContext(BalanceContext);

  const [conversionRates, setConversionRates] = useState({});
  const MIN_DEPOSIT = 500;

  // ✅ Fetch conversion rates
  useEffect(() => {
    const fetchConversionRates = async () => {
      try {
        const response = await axios.get('/api/rates');
        const coingecko = response?.data?.data;

        const rates = {
          Bitcoin: coingecko?.bitcoin?.usd || 1,
        };

        setConversionRates(rates);
      } catch (error) {
        console.error('❌ Failed to fetch conversion rates:', error.message || error);
      }
    };

    fetchConversionRates();
  }, []);

  // ✅ Handle click outside input
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputBoxRef.current && !inputBoxRef.current.contains(event.target)) {
        setShowInput(false);
      }
    };
    if (showInput) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInput]);

  const handlePayNow = () => {
    setAmount('');
    setMessage({ type: '', text: '' });
    setShowInput(true);
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    const userId = localStorage.getItem('userId');

    if (isNaN(depositAmount) || depositAmount < MIN_DEPOSIT) {
      setMessage({ type: 'error', text: `Minimum deposit is $${MIN_DEPOSIT}` });
      return;
    }

    try {
      const res = await axios.post('/api/create-invoice', {
        userId,
        amount: depositAmount,
        currency: 'BTC',
      });

      const { success, checkoutUrl } = res.data;

      if (!success || !checkoutUrl) {
        setMessage({ type: 'error', text: '❌ Failed to create invoice.' });
        return;
      }

      const conversionRate = conversionRates['Bitcoin'] || 1;

      navigate('/depositconfirmationpage', {
        state: {
          method: 'Bitcoin',
          amount: depositAmount,
          charge: 2.5,
          conversionRate,
          checkoutUrl
        }
      });

    } catch (err) {
      console.error('❌ Error creating invoice:', err);
      setMessage({ type: 'error', text: '❌ Failed to create invoice.' });
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="products">
            <div className="item">
              <div className="card-xrp">
                <img src={bitcoin} alt="Bitcoin" className="bitcoin" />
              </div>
              <h3 className="item-mid">Bitcoin</h3>
              <p className="xrp-pa" onClick={handlePayNow}>Pay now</p>
            </div>

            <div style={{ marginBottom: "20px", fontSize: "18px" }}>
              <strong>Current Balance:</strong> ${balance.toFixed(2)}
            </div>

            {message.text && (
              <div style={{
                padding: "10px",
                marginBottom: "20px",
                color: message.type === "success" ? "#4CAF50" : "#F44336",
                border: `1px solid ${message.type === "success" ? "#4CAF50" : "#F44336"}`,
                borderRadius: "4px",
                backgroundColor: message.type === "success" ? "#e8f5e9" : "#ffebee"
              }}>
                {message.text}
              </div>
            )}

            {showInput && (
              <div
                ref={inputBoxRef}
                style={{
                  position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                  border: "1px solid #ccc", borderRadius: "8px", padding: "20px", backgroundColor: "#fff",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)", width: "300px", textAlign: "center",
                }}
              >
                <button onClick={() => setShowInput(false)} style={{
                  position: "absolute", top: "10px", right: "10px", backgroundColor: "transparent",
                  border: "none", fontSize: "16px", cursor: "pointer", color: "green"
                }} aria-label="close">&times;</button>

                <h3>Deposit via: <span style={{ color: "#4CAF50" }}>Bitcoin</span></h3>
                <label htmlFor="amount">Enter deposit amount ($):</label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{ marginLeft: "10px", padding: "8px", fontSize: "16px", width: "200px" }}
                />
                <button
                  onClick={handleDeposit}
                  style={{
                    marginTop: "10px", padding: "8px 12px", backgroundColor: "#008CBA",
                    color: "white", border: "none", borderRadius: "4px", cursor: "pointer"
                  }}
                >Confirm Deposit</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
