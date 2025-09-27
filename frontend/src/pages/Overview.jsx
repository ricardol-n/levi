import React, { useContext, useEffect, useState, useRef } from 'react'
import { FaArtstation,FaDigitalTachograph } from "react-icons/fa";
import { GiTimeTrap } from "react-icons/gi";
import { FaHandHoldingDollar,FaArrowTurnDown,FaRegFaceSadCry } from "react-icons/fa6";
import { MdOutlineMoneyOffCsred,MdFolderCopy } from "react-icons/md";
import {useCopyToClipboard} from 'usehooks-ts' 
import {BalanceContext}  from '../BalanceContext';
import { motion ,useAnimation} from "framer-motion";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { AuthContext } from '../context/AuthContext';
import { duration } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend,ChartDataLabels);



export const Overview = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user || null;
    const balanceCtx = useContext(BalanceContext);
    const {
    balance = 0,
    deposits = [],
    investments = [],
    withdrawals = [],
    referralEarnings = 0,
    cancelInvestment,
    transactions: ctxTransactions = [],
  } = balanceCtx || {};
    const [totalInvested, setTotalInvested] = useState(0);
    const [expectedReturns, setExpectedReturns] = useState(0);
    const [pendingInvestments, setPendingInvestments] = useState(0);
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
    const [currentInvestments, setCurrentInvestments] = useState(0);
    const [currentPlan, setCurrentPlan] = useState("N/A");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [investmentToCancel, setInvestmentToCancel] = useState(null);
    const [notification, setNotification] = useState("");
    const [canceling, setCanceling] = useState(false);
    const transactions = Array.isArray(ctxTransactions) ? ctxTransactions : [];
    const controls = useAnimation();
    const tickerTransition = { repeat: Infinity, duration: 20, ease: "linear" };
    // compute sums when investments/withdrawals change
useEffect(() => {
  if (!Array.isArray(investments)) return;

  // 💰 Total invested = sum of all amounts (active + completed + cancelled)
  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.amount || 0),
    0
  );

  // 📌 Current active investments (still running)
  const activeInvestments = investments
    .filter((inv) => inv.status === "active")
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  // 🎯 Expected profits (sum of profit parts for all investments)
  const expectedProfits = investments.reduce(
  (sum, inv) => sum + Number(inv.expectedReturn || 0),0);

  // 🏆 Matured profits (only completed investments, withdrawable)
  const maturedProfits = investments
    .filter((inv) => inv.status === "completed")
    .reduce(
      (sum, inv) => sum + (Number(inv.expectedReturn || 0) - Number(inv.amount || 0)),
      0
    );

  // 📌 Latest active plan
  const latestActive = investments.find((inv) => inv.status === "active") || null;

  // ✅ Set state
  setTotalInvested(totalInvested);
  setCurrentInvestments(activeInvestments);
  setPendingInvestments(activeInvestments); // synonym for clarity
  setExpectedReturns(expectedProfits);
  setPendingWithdrawals(maturedProfits);
  setCurrentPlan(latestActive?.name || "N/A");
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
    setCanceling(true);
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
      setCanceling(false);
    }
  };
// 💰 Sum up deposits
const depositSum = deposits.reduce(
  (sum, dep) => sum + Number(dep.amount || 0),
  0
);

// 💸 Sum up withdrawals
const withdrawalSum = withdrawals.reduce(
  (sum, wd) => sum + Number(wd.amount || 0),
  0
);

// 📈 Sum up investments (principal + profit expected)
const investmentSum = investments.reduce(
  (sum, inv) => sum + Number(inv.expectedReturn || 0), 
  0
);

// ✅ Fallback to avoid empty chart
const total = depositSum + withdrawalSum + investmentSum;

const pieData = {
  labels: ["Deposits", "Withdrawals", "Investments"],
  datasets: [
    {
      data: total > 0 ? [depositSum, withdrawalSum, investmentSum] : [1, 1, 1],
      backgroundColor: ["#2196F3",  "#FFC107","#F44336"], // blue, red, yellow
      borderColor: [
        "rgba(0, 100, 200, 0.9)",    // darker edges for 3D feel
        "rgba(200, 121, 30, 0.9)",
        "rgba(200, 150, 0, 0.9)",
      ],
      hoverOffset: 20,
      borderWidth: 3,
    },
  ],
};

const pieOptions = {
  plugins: {
    legend: { display: true, position: "bottom" },
    datalabels: {
      color: "#fff",
      font: { size: 14, weight: "bold" },
      shadowBlur: 10,
      shadowColor: "rgba(0,0,0,0.7)", // glowing labels
      formatter: (value, context) => {
        const dataset = context.chart.data.datasets[0].data;
        const sum = dataset.reduce((a, b) => a + b, 0);
        return sum > 0 ? `${((value / sum) * 100).toFixed(1)}%` : "";
      },
    },
  },
  animation: { animateRotate: true, animateScale: true, duration: 2000,easing:"easeOutBounce", }, layout:{padding:20,},
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
// Start ticker animation on mount
useEffect(() => {
const startTicker = () => {
controls.start({ x: "-100%" }, { transition: tickerTransition });
};
startTicker();
// cleanup stops animation
return () => controls.stop();
}, []); // eslint-disable-line react-hooks/exhaustive-deps
    
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
            <div className="ticker-wrapper overflow-hidden">
  <motion.div
    className="ticker-container whitespace-nowrap inline-flex items-center"
    initial={{ x: "100%" }}
    animate={{ x: "-100%" }}
    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
  >
    {Array.isArray(investments) &&
      investments
        .filter(inv => inv.status === "active")
        .map((inv) => {
          const timeLeft = calculateTimeLeft(inv.endDate);

          return (
            <span
              key={inv._id || `${inv.name}-${inv.amount}`}
              className="ticker-item inline-flex items-center mx-6 gap-3"
            >
              {/* 👷 Miner inline */}
              

              {/* Investment details */}
              <strong>{inv.name}</strong> | 
              Amount: ${Number(inv.amount || 0).toFixed(2)} |  
              ROI: {Number(inv.roi || 0).toFixed(2)}% |  
              <GiTimeTrap /> {timeLeft}
              

              {timeLeft !== "Matured" && (
                <button
                  className="cancel-btn ml-2 bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleCancelClick(inv._id)}
                >
                  Cancel
                </button>
              )}
            </span>
          );
        })}
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
                       <div className="piggy-content"><p>Expected Profits</p> <p>${Number(expectedReturns || 0).toFixed(2)} USD</p></div>
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
          <div className="details-content1"><h1>${Number(pendingInvestments || 0).toFixed(2)} USD</h1> {""}<a href="#"><FaArrowTurnDown /></a></div>
        </div>

        <div className="details-card3">
          <div className="details-content"><GiTimeTrap /></div>
          <p className="con-tails">Matured Profits</p>
          <div className="details-content1"><h1>${Number(pendingWithdrawals || 0).toFixed(2)} USD</h1>{" "} <a href="#"><FaArrowTurnDown /></a></div>
        </div>

        <div className="details-card4">
          <div className="details-content"><FaHandHoldingDollar /></div>
          <p className="con-tails">Referral earn</p>
          <div className="details-content1"><h1>${Number(referralEarnings || 0).toFixed(2)} USD</h1>{" "} <a href="#"><FaArrowTurnDown /></a></div>
        </div>

        <div className="details-card5">
          <div className="chart-section">
            {total === 0 ? (
              <p>No data available</p>
            ) : (
              <Pie data={pieData} options={pieOptions} />
            )}
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
