import React, { useContext, useEffect, useState, useRef } from 'react'
import { FaArtstation,FaDigitalTachograph } from "react-icons/fa";
import { GiTimeTrap } from "react-icons/gi";
import { FaHandHoldingDollar,FaArrowTurnDown,FaRegFaceSadCry } from "react-icons/fa6";
import { MdOutlineMoneyOffCsred,MdFolderCopy } from "react-icons/md";
import {useCopyToClipboard} from 'usehooks-ts' 
import {BalanceContext}  from '../BalanceContext';
import { motion } from "framer-motion";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { AuthContext } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend,ChartDataLabels);



export const Overview = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user || null;
    const balanceCtx = useContext(BalanceContext);
    const {
    balance = 0,
    investments = [],
    withdrawals = [],
    referralEarnings = 0,
    cancelInvestment,
    transactions: ctxTransactions = [],
  } = balanceCtx || {};
    const [totalInvested, setTotalInvested] = useState(0);
    const [currentInvestments, setCurrentInvestments] = useState(0);
    const [expectedReturns, setExpectedReturns] = useState(0);
    const [pendingInvestments, setPendingInvestments] = useState(0);
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPlan, setCurrentPlan] = useState("N/A");
    const [value,copy] = useCopyToClipboard();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [investmentToCancel, setInvestmentToCancel] = useState(null);
    const [notification, setNotification] = useState("");
    const [canceling, setCanceling] = useState(false);
    const transactions = Array.isArray(ctxTransactions) ? ctxTransactions : [];

   

        useEffect(() => {
            const timer = setInterval(() => {
                     setCurrentTime(new Date());

                     investments.forEach(inv => {
                        if (inv.status === "active" && new Date(inv.endDate) <= new Date()) {
          setNotification(`Your investment in ${inv.name} has matured!`);
        }
      });
    }, 5000);
             
                 return () => clearInterval(timer);
             }, [investments]);

        // compute sums when investments/withdrawals change
  useEffect(() => {
    if (Array.isArray(investments) && investments.length > 0) {
      const invested = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
      const returns = investments.reduce((sum, inv) => sum + Number(inv.roi || inv.expectedReturn || 0), 0);
      const pending = investments.filter((inv) => inv.status === "active" && !inv.completed).reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
      const latestInvestment = investments[0] || investments[investments.length - 1];

      setTotalInvested(invested);
      setExpectedReturns(returns);
      setPendingInvestments(pending);
      setCurrentInvestments(invested - pending);
      setCurrentPlan(latestInvestment?.name || "N/A");
    } else {
      setTotalInvested(0);
      setExpectedReturns(0);
      setPendingInvestments(0);
      setCurrentInvestments(0);
      setCurrentPlan("N/A");
    }

    if (Array.isArray(investments) && investments.length > 0) {
      const pendingWithdraw = investments
        .filter((inv) => inv.status === "active" || inv.status === "matured")
        .reduce((sum, inv) => sum + Number(inv.expectedReturn || 0), 0);

      setPendingWithdrawals(pendingWithdraw);
    } else {
      setPendingWithdrawals(0);
    }
  }, [investments]);

    
        const calculateTimeLeft = (endDate) => {
            if (!endDate) return "Matured";
    
            const end = new Date(endDate);
            if (isNaN(end.getTime())) return "Matured";
    
            const now = new Date();
            if (end <= now) return "Matured";
    
            const difference = end - now;
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / (1000 * 60)) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
    
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        const handleCancelClick = (investmentId) => {
            setInvestmentToCancel(investmentId);
            setShowCancelModal(true);
        };

    const confirmCancelInvestment = async () => {
    if (!investmentToCancel) return;
    // call cancelInvestment from context (which hits backend)
    try {
      await cancelInvestment(investmentToCancel);
      setNotification("Investment canceled successfully!");
    } catch (err) {
      console.error("Cancel error:", err);
      setNotification("Failed to cancel investment.");
    } finally {
      setShowCancelModal(false);
      setInvestmentToCancel(null);
    }
  };
    // ✅ Auto-detect transactions by type (case-insensitive)
const deposits = transactions && transactions.length > 0
  ? transactions.filter(tx => tx.type?.toLowerCase() === "deposit").length
  : 0;

const withdrawalsCount = transactions && transactions.length > 0
  ? transactions.filter(tx => tx.type?.toLowerCase() === "withdrawal").length
  : 0;

const investmentsCount = transactions && transactions.length > 0
  ? transactions.filter(tx => tx.type?.toLowerCase() === "investment").length
  : 0;

// ✅ Fallback so chart is never empty
const total = deposits + withdrawalsCount + investmentsCount;

const pieData = {
  labels: ["Deposits", "Withdrawals", "Investments"],
  datasets: [
    {
      data: total > 0 ? [deposits, withdrawalsCount, investmentsCount] : [1, 1, 1], // fallback
      backgroundColor: ["#F44336", "#4CAF50", "#FFC107"],
      hoverOffset: 10,
      borderWidth: 2,
    },
  ],
};

const pieOptions = {
  plugins: {
    legend: {
      display: true,
      position: "bottom",
    },
    datalabels: {
      color: "#fff",
      font: { weight: "bold" },
      formatter: (value, context) => {
        const dataset = context.chart.data.datasets[0].data;
        const sum = dataset.reduce((a, b) => a + b, 0);
        return sum > 0 ? `${((value / sum) * 100).toFixed(1)}%` : "";
      },
    },
  },
  animation: {
    animateRotate: true,
    animateScale: true,
  },
};

// ✅ TradingView script injection
  useEffect(() => {
    const container = document.getElementById("tradingview_ticker");
    if (container) {
      container.innerHTML = ""; // clear previous script
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbol: "NASDAQ:TSLA",
        width: "100%",
        height: "400",
        locale: "en",
        colorTheme: "dark",
      });
      container.appendChild(script);
    }
  }, []);

    
    return (
        
        <div className='home-container'>
          
            {notification && (
                <motion.div
                    className="notification"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {notification}
                    <button onClick={() => setNotification("")}>✖</button>
                </motion.div>
            )}

            
            <div className="ticker-wrapper">
                <motion.div
                    className="ticker-container"
                    initial={{ x: "100%" }}
                    animate={{ x: "-100%" }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                >
                    {investments.filter(inv => inv.status === "active").length === 0 ? (
  <p>No active investments</p>
) : (
  investments
    .filter(inv => inv.status === "active") // 👈 only active
    .map((inv, index) => (
      <span key={index} className="ticker-item">
        <strong>{inv.name}</strong> | Amount: ${Number(inv.amount || 0).toFixed(2)} | 
        ROI: {inv.expectedReturn}% | 
        <GiTimeTrap /> {calculateTimeLeft(inv.endDate)}
        {calculateTimeLeft(inv.endDate) !== "Matured" && (
          <button
            className="cancel-btn"
            onClick={() => handleCancelClick(inv._id)}
          >
            Cancel
          </button>
        )}
      </span>
    ))
)}

                </motion.div>
            </div>

            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Are you sure you want to cancel this investment?</h3>
                        <p>A 20% penalty will be applied.</p>
                        <button className="confirm-btn" onClick={confirmCancelInvestment} disabled={canceling}>
                          {canceling ? "Canceling…" : "Yes, Cancel"}
                        </button>
                        <button className="cancel-btn" onClick={() => setShowCancelModal(false)}>
                          No, Keep It
                        </button>
                    </div>
                </div>
            )}

                <div className="home-container-content">
                     <div className="container-card1">
                       <div className="card-account">
                         <h1>Account balance</h1>
                         <p> ${Number(balance || 0).toFixed(2)} USD</p>
                       </div>
                     </div>

                     <div className="container-card1">
                       <div className="piggy"><MdOutlineMoneyOffCsred /></div>
                       <div className="piggy-content"><p>Total Invested</p> <p>${Number(totalInvested || 0).toFixed(2)} USD</p></div>
                     </div>

                     <div className="container-card1">
                       <div className="piggy"><MdFolderCopy /></div>
                       <div className="piggy-content"><p>Current invest</p> <p>${Number(currentInvestments || 0).toFixed(2)} USD</p></div>
                     </div>

                     <div className="container-card1">
                       <div className="piggy"><GiTimeTrap /></div>
                       <div className="piggy-content"><p>Pending Investment</p> <p>${Number(pendingInvestments || 0).toFixed(2)} USD</p></div>
                     </div>

                     <div className="container-card1">
                       <div className="piggy"><FaHandHoldingDollar /></div>
                       <div className="piggy-content"><p>Expected Returns</p> <p>${Number(expectedReturns || 0).toFixed(2)} USD</p></div>
                     </div>
                </div>

            <div className="home-container-content2">
        <div className="details-card1">
          <div className="details-content"><FaArtstation /></div>
          <p className="con-tails">Current plan</p>
          <div className="details-content1"><h1>{currentPlan}</h1> <a href="#"><FaArrowTurnDown /></a></div>
        </div>

        <div className="details-card2">
          <div className="details-content"><FaDigitalTachograph /></div>
          <p className="con-tails">Pending invest</p>
          <div className="details-content1"><h1>${Number(pendingInvestments || 0).toFixed(2)} USD</h1> <a href="#"><FaArrowTurnDown /></a></div>
        </div>

        <div className="details-card3">
          <div className="details-content"><GiTimeTrap /></div>
          <p className="con-tails">Pending withdraw</p>
          <div className="details-content1"><h1>${Number(pendingWithdrawals || 0).toFixed(2)} USD</h1> <a href="#"><FaArrowTurnDown /></a></div>
        </div>

        <div className="details-card4">
          <div className="details-content"><FaHandHoldingDollar /></div>
          <p className="con-tails">Referral earn</p>
          <div className="details-content1"><h1>${Number(referralEarnings || 0).toFixed(2)} USD</h1> <a href="#"><FaArrowTurnDown /></a></div>
        </div>

        <div className="details-card5">
          <div className="chart-section">
            {total === 0 ? <p>No data available</p> : <Pie data={pieData} options={pieOptions} />}
          </div>

          <div className="details-card6">
            <div className="crypto-market">
              <h3>Live Crypto Market Trends</h3>
              <div id="tradingview_ticker"></div>
            </div>
          </div>
        </div>
      </div>
       
                {/* <Link to="/charts">View Transaction Charts</Link> */}
                {/* <Link to="/refferallog">Referral Program</Link> */}

        </div>

    );
}
export default Overview;
