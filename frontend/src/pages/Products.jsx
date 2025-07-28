import React, { useContext, useEffect, useRef, useState } from 'react';
import bitcoin from './asset/bitcoin.png';
import doge from './asset/dogecoin.png';
import eth from './asset/ethereum.png';
import usdt from './asset/money.png';
import xrp from './asset/xrp.png';
import { BalanceContext } from '../BalanceContext';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';
import {AuthContext} from "../context/Authcontext";
import axios from 'axios';



export const Deposit = () => {
    const [selectedMethod,setSelectedMethod] = useState("");
    const [amount,setAmount] = useState("");
    const { user } = useContext(AuthContext);
    const [conversionRates, setConversionRates] = useState({});
    const [showInput,setShowInput] = useState(false);
    const inputBoxRef = useRef(null);
    const navigate = useNavigate();

    const balanceContext = useContext(BalanceContext);
    const balance = balanceContext.balance;
    const setBalance = balanceContext.setBalance;
    const addTransaction = balanceContext.addTransaction;
    const [message,setMessage] = useState({ type:"",text:""});

    const MIN_DEPOSIT = 500;

    const methodMap = {
    "Bitcoin": "BTC",
    "Dogecoin": "DOGE",
    "Ethereum": "ETH",
    "USDT ERC20": "ETH",
    "USDT TRC20": "TRON",
    "XRP": "XRP"
  };

   // ✅ Fetch live conversion rates from backend
   const fetchConversionRates = async () => {
  try {
    const response = await axios.get('/api/rates');

    const coingecko = response?.data?.data;

    if (!coingecko || !coingecko.bitcoin) {
      console.error("❌ Unexpected rate format:", coingecko);
      return;
    }

    const rates = {
      Bitcoin: coingecko.bitcoin.usd,
      Ethereum: coingecko.ethereum.usd,
      Dogecoin: coingecko.dogecoin.usd,
      'USDT ERC20': coingecko.tether.usd,
      'USDT TRC20': coingecko.tether.usd,
      XRP: coingecko.ripple.usd,
    };

    setConversionRates(rates);
        } catch (error) {
           console.error('❌ Failed to fetch conversion rates:', error.message || error);
        }
    };

    useEffect(() => {
    fetchConversionRates();
    }, []);

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
  }, [showInput,inputBoxRef]);

  const handlePayNow = (method) => {
    setSelectedMethod(method);
    setAmount('');
    setMessage({ type: '', text: '' });
    setShowInput(true);
  };

  const handleDeposit = async () => {
  const depositAmount = parseFloat(amount);
  const userId = localStorage.getItem('userId'); // ✅ Set during login

  // 1. Validate amount
  if (isNaN(depositAmount) || depositAmount < MIN_DEPOSIT) {
    setMessage({ type: 'error', text: `Minimum deposit is $${MIN_DEPOSIT}` });
    return;
  }

  try {
    // 2. Fetch user wallet addresses from backend
    const response = await axios.get(`/api/user/${userId}/wallets`);

    if (!response.data.success) {
      setMessage({ type: 'error', text: '❌ Failed to load wallet address.' });
      return;
    }

    const depositAddresses = response.data.depositAddresses;

    console.log("Wallets from backend:", depositAddresses);

    const chainKey = methodMap[selectedMethod]; // e.g., "BTC", "ETH", etc.
    const walletAddress = depositAddresses[chainKey];

    console.log("Using method:", selectedMethod, "→", chainKey, "→", walletAddress);


    if (!walletAddress) {
      setMessage({ type: 'error', text: '❌ Wallet address missing for this method' });
      return;
    }


    // 3. Calculate conversion rate
    const conversionRate = conversionRates[selectedMethod]
      ? 1 / conversionRates[selectedMethod]
      : 1;

    // 4. Navigate to confirmation page
    navigate('/depositconfirmationpage', {
      state: {
        method: selectedMethod,
        amount: depositAmount,
        charge: 2.5,
        address: walletAddress,
        conversionRate: conversionRate,
      }
    });

  } catch (err) {
    console.error("Error getting wallet:", err);
    setMessage({ type: 'error', text: '❌ Failed to fetch wallet address.' });
  }
};


    return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="products">
            {/* Deposit Cards */}
            {[
              { name: "Bitcoin", img: bitcoin },
              { name: "Dogecoin", img: doge },
              { name: "Ethereum", img: eth },
              { name: "USDT ERC20", img: usdt },
              { name: "USDT TRC20", img: usdt },
              { name: "XRP", img: xrp },
            ].map(({ name, img }) => (
              <div key={name} className="item">
                <div className="card-xrp">
                  <img src={img} alt={name} className="bitcoin" />
                </div>
                <h3 className="item-mid">{name}</h3>
                <p className="xrp-pa" onClick={() => handlePayNow(name)}>Pay now</p>
              </div>
            ))}

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

                <h3>Deposit via: <span style={{ color: "#4CAF50" }}>{selectedMethod}</span></h3>
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
                    marginLeft: "10px", padding: "8px 12px", backgroundColor: "#008CBA",
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
    // return (
    //     <div className="dashboard-container">
    //     <Header />
    //     <div className="dashboard-content">
    //       <Sidebar />
    //       <main className="main-content">
    //      <div className="products">
            
    //         <div className='item1'>
    //              <div className='card-xrp'>
    //                 <img src={bitcoin} alt={bitcoin} className='bitcoin' />
    //              </div>
    //              <h2 className='item-mid'>Bitcoin</h2>
    //              <p className='xrp-pa' onClick={() => handlePayNow("Bitcoin")}>Pay now</p>

    //         </div>
    //         <div className='item2'>
    //              <div className='card-xrp'>
    //                 <img src={doge} alt={doge} className='bitcoin' />
    //              </div>
    //              <h2 className='item-mid'>Dogecoin</h2>
    //              <p className='xrp-pa' onClick={() => handlePayNow("Dogecoin")}>Pay now</p>

    //         </div>
    //         <div className='item3'>
    //              <div className='card-xrp'>
    //                 <img src={eth} alt={eth} className='bitcoin' />
    //              </div>
    //              <h2 className='item-mid'>Ethereum</h2>
    //              <p className='xrp-pa' onClick={() => handlePayNow("Ethereum")}>Pay now</p>

    //         </div>
    //         <div className='item4'>
    //              <div className='card-xrp'>
    //                 <img src={usdt} alt={usdt} className='bitcoin' />
    //              </div>
    //              <h3 className='item-mid'>Usdt ERC20</h3>
    //              <p className='xrp-pa' onClick={() => handlePayNow("USDT ERC20")}>Pay now</p>

    //         </div>
    //         <div className='item5'>
    //              <div className='card-xrp'>
    //                 <img src={usdt} alt={bitcoin} className='bitcoin' />
    //              </div>
    //              <h3 className='item-mid'>Usdt TRC20</h3>
    //              <p className='xrp-pa' onClick={() => handlePayNow("USDT TRC20")}>Pay now</p>

    //         </div>
    //         <div className='item6'>
    //              <div className='card-xrp'>
    //                 <img src={xrp} alt={xrp} className='bitcoin' />
    //              </div>
    //              <h3 className='item-mid'>XRP Ripple</h3>
    //              <p className='xrp-pa' onClick={() => handlePayNow("XRP")}>Pay now</p>

    //         </div>
    //         <div style={{marginBottom:"20px",fontSize:"18px"}}>
    //         <strong>Current Balance:</strong> ${balance.toFixed(2)}
    //         </div>

    //         {message.text &&(
    //             <div style={{padding:"10px",marginBottom:"20px",color:message.type === "success"? "#4CAF50" : "#F44336",
    //                 border:`1px solid ${message.type === "success" ? "#4CAF50" :"#F44336"}`,
    //                 borderRadius:"4px", backgroundColor: message.type === "success" ? "#e8f5e9" : "#ffebee"
    //             }} 
    //             >{message.text}</div>
    //         )}
    //         {showInput &&( 
    //             <div style={{position:"fixed", top:"50%",left:"50%",transform:"translate(-50%,-50%)"
    //                 ,border:"1px solid #ccc",borderRadius:"8px",padding:"20px",backgroundColor:"#fff",
    //                 boxShadow:"0 4px 8px rgba(0,0,0,0.1)",width:"300px",textAlign:"center",
    //             }} ref={inputBoxRef} > 
    //             <button onClick={() => setShowInput(false)} style={{
    //                 position: "absolute", top:"10px", right:"10px",
    //                 backgroundColor:"transparent",border:"none",fontSize:"16px",cursor:"pointer",color:"green"
    //             }} aria-label='close'> &times;

    //             </button>
    //                 <h3>
    //                     Deposit via: <span style={{ color: "#4CAF50"}}>{selectedMethod}</span>
    //                 </h3>
    //                 <label htmlFor="amount">Enter depoist amount ($):</label>
    //                 <input id='amount' type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder='Enter amount' style={{marginLeft: "10px",padding:"8px",fontSize:"16px",width:"200px"}} />
                   
    //                 <button onClick={handleDeposit}
    //                 style={{marginLeft:"10px", padding:"8px 12px", backgroundColor:"#008CBA",color:"white",border:"none",borderRadius:"4px",cursor:"pointer"}}>Confirm Deposit</button>

                
    //             </div>
                
    //         )}
    //      </div>
    //      </main>
    //     </div>
    //     </div>
        
    // );



export const DepositLog = () => {
    
    const { transactions } = useContext(BalanceContext);

    const deposits = transactions.filter((tx) => tx.type === "Deposit");
  
    return (
        
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
        
            <div className="team">
            {deposits.length === 0 ? (
                <p>No depoist yet.</p>
            ) : (
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Method</th>
                            <th>Amount ($)</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deposits.map((tx, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{tx.method}</td>
                                <td>${tx.amount.toFixed(2)}</td>
                                <td>{tx.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
           </div>

        </main>
        </div>
        
        </div>


    )};