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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
  const isAmountValid =
    amount &&
    !isNaN(parseFloat(amount)) &&
    parseFloat(amount) >= (selectedPlan?.min || 0) &&
    parseFloat(amount) <= (selectedPlan?.max || Infinity);

  return (
    <div className="dashboard-container">
    <Header toggleSidebar={toggleSidebar} />
    <div className="dashboard-contents">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
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
             <p><strong>Range:</strong> ${selectedPlan.min} - ${selectedPlan.max}</p>
             
                  <input
                    type="number"
                    placeholder={`Enter amount ($${selectedPlan.min} - $${selectedPlan.max})`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

              {/* Only calculate return if amount is valid */}
              {isAmountValid && (
                    <p>
                      <strong>Expected Return:</strong> $
                      {(parseFloat(amount) * (1 + selectedPlan.roi / 100)).toFixed(2)}
                    </p>
              )}

               <button className="confirm-btn" onClick={confirmInvestment} disabled={!isAmountValid}>Confirm</button>
               <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          </div>
          </div>)}

        </div>
     </main>
     </div>
     </div>
  );
};



export const InvestLog = () => {

  const { investments , setInvestments  } = useContext(BalanceContext);
  const [currentTime, setCurrentTime] = useState(new Date());
    const [sortBy, setSortBy] = useState("date"); 
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      setInvestments((prev) =>
        prev.map((inv) =>
          new Date(inv.endDate) <= new Date()
            ? { ...inv, completed: true }
            : inv
        )
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [setInvestments]);

  const calculateTimeLeft = (endDate) => {
    if (!endDate) return "Matured";
    const end = new Date(endDate);
    if (isNaN(end.getTime()) || end <= new Date()) return "Matured";

    const diff = end - new Date();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  // 🔥 Sorting Logic
  const sortedInvestments = [...investments].sort((a, b) => {
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "roi") return b.expectedReturn - a.expectedReturn;
    if (sortBy === "status") return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
    return 0;
  });

  // 🔥 Filtering Logic
  const filteredInvestments = sortedInvestments.filter((inv) => {
    if (filter === "active") return !inv.completed;
    if (filter === "matured") return inv.completed;
    return true; // all
  });

    return (

      <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar}/>
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
       <div className="investlog">
      <h2>Investment History</h2>
      {/* Controls */}
            <div className="log-controls">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="roi">Sort by ROI</option>
                <option value="status">Sort by Status</option>
              </select>

              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Show All</option>
                <option value="active">Active Only</option>
                <option value="matured">Matured Only</option>
              </select>
            </div>
      {filteredInvestments.length === 0 ? (
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
                <td data-label="#">{index + 1}</td>
                <td data-label="Plan">{inv.name}</td>
                <td data-label="Amount">${inv.amount.toFixed(2)}</td>
                <td data-label="ROI">{inv.expectedReturn}%</td>
                <td data-label="Expected Return">${(inv.amount * (1 + inv.expectedReturn / 100)).toFixed(2)}</td>
                <td data-label="Time Left">{calculateTimeLeft(inv.endDate)}</td>
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
