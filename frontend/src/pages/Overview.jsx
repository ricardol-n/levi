import React, { useContext, useEffect, useState, useMemo } from "react";
import { FaArtstation, FaDigitalTachograph } from "react-icons/fa";
import { GiTimeTrap } from "react-icons/gi";
import {
  FaHandHoldingDollar,
  FaArrowTurnDown,
} from "react-icons/fa6";
import { MdOutlineMoneyOffCsred, MdFolderCopy } from "react-icons/md";
import { BalanceContext } from "../BalanceContext";
import { motion, useAnimation } from "framer-motion";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { AuthContext } from "../context/AuthContext";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export const Overview = () => {
  const { user } = useContext(AuthContext);
  const {
    balance = 0,
    deposits = [],
    investments = [],
    withdrawals = [],
    referralEarnings = 0,
    cancelInvestment,
    transactions: ctxTransactions = [],
  } = useContext(BalanceContext) || {};

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [investmentToCancel, setInvestmentToCancel] = useState(null);
  const [notification, setNotification] = useState("");
  const [canceling, setCanceling] = useState(false);
  const controls = useAnimation();

  // 🔁 Smooth ticker animation
  const tickerTransition = { repeat: Infinity, duration: 20, ease: "linear" };

  // ✅ Key Investment Metrics
  const totalInvested = useMemo(
    () => investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0),
    [investments]
  );

  const expectedProfit = useMemo(
    () =>
      investments
        .filter((inv) => inv.status === "active" || inv.status === "pending")
        .reduce((sum, inv) => sum + Number(inv.amount || 0) * 0.1, 0),
    [investments]
  );

  const maturedProfit = useMemo(
    () =>
      investments
        .filter((inv) => inv.status === "completed")
        .reduce((sum, inv) => sum + Number(inv.amount || 0) * 0.1, 0),
    [investments]
  );

  const pendingInvestments = useMemo(
    () =>
      investments
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0),
    [investments]
  );

  const currentInvestments = useMemo(
    () =>
      investments
        .filter((inv) => inv.status === "active")
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0),
    [investments]
  );

  const currentPlan = useMemo(() => {
    const latestActive = investments.find((inv) => inv.status === "active");
    return latestActive?.name || "N/A";
  }, [investments]);

  // ⏱ Calculate time left for investment maturity
  const calculateTimeLeft = (endDate) => {
    if (!endDate) return "Matured";
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return "Matured";

    const now = new Date();
    if (end <= now) return "Matured";

    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // ❌ Cancel investment flow
  const handleCancelClick = (investmentId) => {
    setInvestmentToCancel(investmentId);
    setShowCancelModal(true);
  };

  const confirmCancelInvestment = async () => {
    if (!investmentToCancel) return;
    setCanceling(true);
    try {
      await cancelInvestment(investmentToCancel);
      setNotification("✅ Investment canceled successfully!");
    } catch (err) {
      console.error("Cancel error:", err);
      setNotification("❌ Failed to cancel investment.");
    } finally {
      setShowCancelModal(false);
      setInvestmentToCancel(null);
      setCanceling(false);
    }
  };

  // 📊 Chart Calculations
  const depositSum = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const withdrawalSum = withdrawals.reduce(
    (sum, w) => sum + Number(w.amount || 0),
    0
  );
  const investmentSum = investments.reduce(
    (sum, inv) => sum + Number(inv.amount || 0),
    0
  );
  const total = depositSum + withdrawalSum + investmentSum;

  const pieData = {
    labels: ["Deposits", "Withdrawals", "Investments"],
    datasets: [
      {
        data: total > 0 ? [depositSum, withdrawalSum, investmentSum] : [1, 1, 1],
        backgroundColor: ["#2196F3", "#FFC107", "#F44336"],
        borderWidth: 3,
        hoverOffset: 20,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { display: true, position: "bottom" },
      datalabels: {
        color: "#fff",
        font: { size: 14, weight: "bold" },
        formatter: (value, ctx) => {
          const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          return `${((value / sum) * 100).toFixed(1)}%`;
        },
      },
    },
    animation: { animateRotate: true, duration: 2000 },
  };

  // 📈 TradingView Widget
  useEffect(() => {
    const container = document.getElementById("tradingview_ticker");
    if (container) {
      container.innerHTML = "";
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
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

  // 🎬 Start ticker animation
  useEffect(() => {
    controls.start({ x: "-100%" }, { transition: tickerTransition });
    return () => controls.stop();
  }, []);

  return (
    <div className="home-container">
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

      {/* 🔄 Ticker for Active Investments */}
      <div className="ticker-wrapper overflow-hidden">
        <motion.div
          className="ticker-container whitespace-nowrap inline-flex items-center"
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={tickerTransition}
        >
          {investments
            .filter((inv) => inv.status === "active")
            .map((inv) => {
              const timeLeft = calculateTimeLeft(inv.endDate);
              return (
                <span
                  key={inv._id || inv.name}
                  className="ticker-item inline-flex items-center mx-6 gap-3"
                >
                  <strong>{inv.name}</strong> | Amount: $
                  {Number(inv.amount || 0).toFixed(2)} | ROI:{" "}
                  {Number(inv.roi || 10).toFixed(2)}% | <GiTimeTrap /> {timeLeft}
                  {timeLeft !== "Matured" && (
                    <button
                      className="cancel-btn bg-red-500 text-white px-2 py-1 rounded ml-2"
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

      {/* ❌ Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure you want to cancel this investment?</h3>
            <p>A 20% penalty will be applied.</p>
            <button
              className="confirm-btn"
              onClick={confirmCancelInvestment}
              disabled={canceling}
            >
              {canceling ? "Canceling…" : "Yes, Cancel"}
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowCancelModal(false)}
            >
              No, Keep It
            </button>
          </div>
        </div>
      )}

      {/* 💰 Overview Stats */}
      <div className="home-container-content">

        <div className="container-card1">
          <div className="card-account">
            <h1>Account Balance</h1>
            <p>${Number(balance || 0).toFixed(2)} USD</p>
          </div>
        </div>

        <div className="container-card1">
          <div className="piggy">
            <MdOutlineMoneyOffCsred />
          </div>
          <div className="piggy-content">
            <p>Total Invested</p>
            <p>${Number(totalInvested).toFixed(2)} USD</p>
          </div>
        </div>

        <div className="container-card1">
          <div className="piggy">
            <MdFolderCopy />
          </div>
          <div className="piggy-content">
            <p>Current Invest</p>
            <p>${Number(currentInvestments).toFixed(2)} USD</p>
          </div>
        </div>

        <div className="container-card1">
          <div className="piggy">
            <GiTimeTrap />
          </div>
          <div className="piggy-content">
            <p>Pending Investment</p>
            <p>${Number(pendingInvestments).toFixed(2)} USD</p>
          </div>
        </div>

        <div className="container-card1">
          <div className="piggy">
            <FaHandHoldingDollar />
          </div>
          <div className="piggy-content">
            <p>Expected Profits</p>
            <h3>${expectedProfit.toFixed(2)} USD</h3>
          </div>
        </div>
      </div>

      {/* 📊 Extra Info Section */}
      <div className="home-container-content2">
        <div className="details-card1">
          <div className="details-content">
            <FaArtstation />
          </div>
          <p className="con-tails">Current Plan</p>
          <div className="details-content1">
            <h1>{currentPlan}</h1> <FaArrowTurnDown />
          </div>
        </div>

        <div className="details-card2">
          <div className="details-content">
            <FaDigitalTachograph />
          </div>
          <p className="con-tails">Pending Invest</p>
          <div className="details-content1">
            <h1>${Number(pendingInvestments).toFixed(2)} USD</h1> <FaArrowTurnDown />
          </div>
        </div>

        <div className="details-card3">
          <div className="details-content">
            <GiTimeTrap />
          </div>
          <p className="con-tails">Matured Profits</p>
          <div className="details-content1">
            <h3>${maturedProfit.toFixed(2)} USD</h3> <FaArrowTurnDown />
          </div>
        </div>

        <div className="details-card4">
          <div className="details-content">
            <FaHandHoldingDollar />
          </div>
          <p className="con-tails">Referral Earn</p>
          <div className="details-content1">
            <h1>${Number(referralEarnings).toFixed(2)} USD</h1> <FaArrowTurnDown />
          </div>
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
    </div>
  );
};

export default Overview;
