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
import { AuthContext } from '../context/Authcontext';

ChartJS.register(ArcElement, Tooltip, Legend);



export const Overview = () => {
    const { user } = useContext(AuthContext);
    const carrytrad = useRef(null);
    const { balance, investments = [], withdrawals = [], referralEarnings = 0,cancelInvestment  } = useContext(BalanceContext);
    const [totalInvested, setTotalInvested] = useState(0);
    const [currentInvestments, setCurrentInvestments] = useState(0);
    const [expectedReturns, setExpectedReturns] = useState(0);
    const [pendingInvestments, setPendingInvestments] = useState(0);
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const mylink = `https/myreferrel/link`;
    const [currentPlan, setCurrentPlan] = useState("N/A");
    const [value,copy] = useCopyToClipboard();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [investmentToCancel, setInvestmentToCancel] = useState(null);
    const [notification, setNotification] = useState("");
    const { transactions } = useContext(BalanceContext);
   

        useEffect(() => {
            const timer = setInterval(() => {
                     setCurrentTime(new Date());

                     investments.forEach(inv => {
                        if (!inv.completed && new Date(inv.endDate) <= new Date()) {
                            setNotification(`Your investment in ${inv.name} has matured!`);
                        }
                    });
        
                
                 }, 5000);
             
                 return () => clearInterval(timer);
             }, [investments]);

        useEffect(() => {
                if (investments.length > 0) {
                    const invested = investments.reduce((sum, inv) => sum + inv.amount, 0);
                    const returns = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0);
                    const pending = investments.filter(inv => !inv.completed).reduce((sum, inv) => sum + inv.amount, 0);
                    const latestInvestment = investments[investments.length - 1];
        
                    setTotalInvested(invested);
                    setExpectedReturns(returns);
                    setPendingInvestments(pending);
                    setCurrentInvestments(invested - pending);
                    setCurrentPlan(latestInvestment.name);
                }
        
                if (withdrawals.length > 0) {
                    const pendingWithdraw = withdrawals.filter(w => !w.completed).reduce((sum, w) => sum + w.amount, 0);
                    setPendingWithdrawals(pendingWithdraw);
                }
            }, [investments, withdrawals]);
    
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

        const handleCancelClick = (index) => {
            setInvestmentToCancel(index);
            setShowCancelModal(true);
        };

        const confirmCancelInvestment = () => {
            cancelInvestment(investmentToCancel);
            setShowCancelModal(false);
            setNotification("Investment canceled successfully!");
        };

        const deposits = transactions ? transactions.filter(tx => tx.type === "Deposit").length : [];
        const withdrawalsCount = transactions ? transactions.filter(tx => tx.type === "Withdrawal").length : [];
        const investmentsCount = transactions ? transactions.filter(tx => tx.type === "Investment").length : [];

        
    // ✅ Pie Chart Data
    const pieData = {
        labels: ["Deposits", "Withdrawals", "Investments"] ,
        datasets: [
            {
                data: [deposits, withdrawalsCount, investmentsCount],
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
                formatter: (value, context) => `${value} (${((value / transactions.length) * 100).toFixed(1)}%)`,
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
        },
    };
    
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
                    {investments.length === 0 ? (
                        <p>No active investments</p>
                    ) : (
                        investments.map((inv, index) => (
                            <span key={index} className="ticker-item">
                                <strong>{inv.name}</strong> | Amount: ${inv.amount.toFixed(2)} | ROI: {inv.expectedReturn}% | 
                                <GiTimeTrap /> {calculateTimeLeft(inv.endDate)}
                                {calculateTimeLeft(inv.endDate) !== "Matured" && (
                                    <button className="cancel-btn" onClick={() => handleCancelClick(index)}>Cancel</button>
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
                        <button className="confirm-btn" onClick={confirmCancelInvestment}>Yes, Cancel</button>
                        <button className="cancel-btn" onClick={() => setShowCancelModal(false)}>No, Keep It</button>
                    </div>
                </div>
            )}

            <div className='home-container-content'>
                <div className='container-card1'>
                    <div className="card-account">
                        <h1>Account balance</h1>
                        <p> ${balance.toFixed(2)} USD</p>
                        
                    </div>
                    
                </div>
                <div className='container-card1'>
                    <div className="piggy"><MdOutlineMoneyOffCsred  /></div>
                    <div className="piggy-content"><p>Total Invested</p> <p>${totalInvested.toFixed(2)}USD</p></div>
                </div>
                <div className='container-card1'>
                    <div className="piggy"><MdFolderCopy  /></div>
                    <div className="piggy-content"><p>Current  invest</p> <p>${currentInvestments.toFixed(2)} USD</p></div>
                </div>
                <div className='container-card1'>
                    <div className="piggy"><GiTimeTrap /></div>
                    <div className="piggy-content"><p>Pending Investment</p>   <p>${pendingInvestments.toFixed(2)} USD</p></div>
                </div>
                <div className='container-card1'>
                    <div className="piggy"><FaHandHoldingDollar  /></div>
                    <div className="piggy-content"><p>Expected Returns</p>  <p>${expectedReturns.toFixed(2)} USD</p></div>
                </div> 
            </div>

            <div className='home-container-content2'>
                
                
            <div className="details-card1">
                    <div className="details-content"> <FaArtstation/></div>
                    <p className='con-tails'>Current plan</p>
                    <div className="details-content1"><h1>{currentPlan}</h1> <a href="#"><FaArrowTurnDown/></a></div> 
            </div>

            <div className="details-card2">
                <div className="details-content"> <FaDigitalTachograph/></div>
                    <p className='con-tails'>Pending invest</p>
                    <div className="details-content1"><h1>${pendingInvestments.toFixed(2)} USD</h1>  <a href="#"><FaArrowTurnDown/></a></div>
            </div>

            <div className="details-card3">
                <div className="details-content"> <GiTimeTrap/></div>
                    <p className='con-tails'>Pending withdraw</p>
                    <div className="details-content1"><h1>${pendingWithdrawals.toFixed(2)} USD</h1>  <a href="#"><FaArrowTurnDown/></a></div>
            </div>


            <div className="details-card4">
            
                <div className="details-content"> <FaHandHoldingDollar/></div>
                    <p className='con-tails'>Refferal earn</p>
                    <div className="details-content1"><h1>${referralEarnings.toFixed(2)} USD</h1>  <a href="#"><FaArrowTurnDown/></a></div>
            </div>

                <div className="details-card5">

                    <div className="chart-section">
                    <Pie data={pieData} options={pieOptions} />
                    
                </div>
                <div className="details-card6">
                    <div className="crypto-market">
                    <h3>Live Crypto Market Trends</h3>
                
                    <iframe 
                    src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_47cf3&symbol=TSLA&interval=D&theme=dark&style=3"
                    width="100%" height="400"
                    frameBorder="0"
                    allowFullScreen>
                    </iframe>
                </div>
                </div>

                

                
                </div>    
                {/* <Link to="/charts">View Transaction Charts</Link> */}
                {/* <Link to="/refferallog">Referral Program</Link> */}

            </div>

        </div>
    );
}
export default Overview;
