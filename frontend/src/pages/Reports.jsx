import {  React,useEffect,useState, useContext } from "react";
import * as RiIcons from "react-icons/ri";
import { BalanceContext } from "../BalanceContext";
import Header from "../Header";
import Sidebar from "../Sidebar";

const investmentPlans = [
  { id: 1, name: "TESLA STARTER", roi: 10, min: 500, max: 5000, duration: 5 },
  { id: 2, name: "TESLA STOCK", roi: 30, min: 5000, max: 10000, duration: 5 },
  { id: 3, name: "TESLA COINS", roi: 50, min: 10000, max: 20000, duration: 5 },
  { id: 4, name: "TESLA GOLD", roi: 70, min: 20000, max: 50000, duration: 5 },
];

export const InvestmentPlans = () => {
  const { balance, setBalance, addTransaction,addInvestment } = useContext(BalanceContext);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleInvest = (plan) => {
    setSelectedPlan(plan);
    setAmount("");
    setShowConfirmModal(true); 
  };
  const confirmInvestment = () => {
    if (!addInvestment) {
      console.error("Error: addInvestment is not available in BalanceContext");
      return;
    }
  const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount < selectedPlan.min || investmentAmount > selectedPlan.max) {
      alert(`Amount must be between $${selectedPlan.min} - $${selectedPlan.max}`);
      return;
    }


    if (investmentAmount > balance) {
      alert("Insufficient balance. Please deposit funds.");
      return;
    }

    const profit = (investmentAmount * selectedPlan.roi) / 100;
    const totalReturn = investmentAmount + profit;

    setBalance(balance - investmentAmount);
    addTransaction("Investment", selectedPlan.name, investmentAmount, totalReturn);

    if (!selectedPlan.duration) {
      console.error("Error: selectedPlan.duration is undefined", selectedPlan);
      return;
   }
  
    addInvestment(selectedPlan.name, investmentAmount, totalReturn,selectedPlan.duration);


    alert(`Investment Successful! Expected return: $${totalReturn}`);
    setSelectedPlan(null);
    setShowConfirmModal(false);
  };

  return (
    <div className="dashboard-container">
    <Header />
    <div className="dashboard-content">
      <Sidebar />
      <main className="main-content">
        <div className="investment-container">
      <h1>Choose an Investment Plan</h1>
      <div className="investment-grid">
        {investmentPlans.map((plan) => (
          <div key={plan.id} className="investment-card">
            <h2>{plan.name}</h2>
            <p>ROI: {plan.roi}%</p>
            <p>Min: ${plan.min} | Max: ${plan.max}</p>
            <p>Duration: {plan.duration} Days</p>
            <button onClick={() => handleInvest(plan)}>Invest Now</button>
          </div>
        ))}
      </div>

      {showConfirmModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Investment</h2>
            <p><strong>Plan:</strong> {selectedPlan.name}</p>
            <p><strong>ROI:</strong> {selectedPlan.roi}%</p>
            <p><strong>Investment Amount:</strong> ${amount}</p>
            <p><strong>Expected Return:</strong> ${(amount * (1 + selectedPlan.roi / 100)).toFixed(2)}</p>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button className="confirm-btn" onClick={confirmInvestment}>Confirm</button>
            <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          </div>
        </div>
      )}
        </div>
     </main>
     </div>
     </div>
  );
};



export const InvestLog = () => {

  const { investments , setInvestments  } = useContext(BalanceContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  

  
  useEffect(() => {
    const timer = setInterval(() => {
      
      setCurrentTime(new Date());

      setInvestments(prevInvestments =>
        prevInvestments.map(inv =>
          new Date(inv.endDate) <= new Date() ? { ...inv, completed: true } : inv
        )
      );
    }, 1000); // Updates every second

    return () => clearInterval(timer);
  }, [setInvestments]);

  const calculateTimeLeft = (endDate) => {
    if (!endDate) return "Matured"; // ✅ Prevent undefined error

    const end = new Date(endDate);
    if (isNaN(end.getTime())) return "Matured";

    const now = new Date();
    if (end <= now) return "Matured";

    const difference = end - new Date();;
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

    return (

      <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
       <div className="investlog">
      <h2>Investment History</h2>
      {investments.length === 0 ? (
        <p>No investments found.</p>
      ) : (
        <table className="investment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Plan</th>
              <th>Amount ($)</th>
              <th>ROI (%)</th>
              <th>Expected Return ($)</th>
              <th>Time Left</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{inv.name}</td>
                <td>${inv.amount.toFixed(2)}</td>
                <td>{inv.expectedReturn}%</td>
                <td>${(inv.amount * (1 + inv.expectedReturn / 100)).toFixed(2)}</td>
                <td>{calculateTimeLeft(inv.endDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
       </div>

       </main>
     </div>
     </div>
    );
};
