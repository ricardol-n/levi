import {  React,useEffect,useState, useContext } from "react";
import { BalanceContext } from "../BalanceContext";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "axios";


const investmentPlans = [
  { id: 1, name: "TESLA Starter Plan", roi: 10, min: 500, max: 5000, duration: 5 },
  { id: 2, name: "TESLA Growth Plan", roi: 30, min: 5000, max: 10000, duration: 5 },
  { id: 3, name: "TESLA Advanced Plan", roi: 50, min: 10000, max: 20000, duration: 5 },
  { id: 4, name: "TESLA Premium Plan", roi: 70, min: 20000, max: 50000, duration: 5 },
];

export const InvestmentPlans = () => {
  const API_BASE = import.meta.env.VITE_API_URL; 
  const { balance, syncFromBackend} = useContext(BalanceContext);
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
  const confirmInvestment = async () => {
  const investmentAmount = parseFloat(amount);
  if (
    isNaN(investmentAmount) ||
    investmentAmount < selectedPlan.min ||
    investmentAmount > selectedPlan.max
  ) {
    alert(`Amount must be between $${selectedPlan.min} - $${selectedPlan.max}`);
    return;
  }

  if (investmentAmount > balance) {
    alert("Insufficient balance. Please deposit funds.");
    return;
  }

  try {
 const res = await axios.post(
  `${API_BASE}/investments`,
  {
    name: selectedPlan.name,
    amount: investmentAmount,
    roi: selectedPlan.roi,
    duration: selectedPlan.duration,
  },
  {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }
);

const inv = res.data.investment;


alert(
        `✅ Investment Successful! You invested $${inv.amount}. Expected return will be calculated automatically.`
      );
setShowConfirmModal(false);

    // re-sync context
    if (typeof syncFromBackend === "function") {
      syncFromBackend();
    }
  } catch (err) {
    console.error("❌ Investment failed:", err.response?.data || err.message);
    alert("Investment failed. Try again.");
  }
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
      {/* <h1>       Access Plan</h1> */}
      <div className="investment-grid">
        {investmentPlans.map((plan) => (
          <div key={plan.id} className="investment-card">
            <h2>{plan.name}</h2>
            <p>Target Return: {plan.roi}%</p>
            <p>Min: ${plan.min} | Max: ${plan.max}</p>
            <p>Duration: {plan.duration} Days</p>

            <ul className="plan-features">
                    <li>✔ Transparent duration</li>
                    <li>✔ Professionally managed</li>
                    <li>✔ Daily monitoring</li>
                  </ul>

            <button onClick={() => handleInvest(plan)}>View Plan</button>
          </div>
        ))}
      </div>

      {showConfirmModal && selectedPlan && (
         <div className="modal-overlay">
         <div className="modal">
             <h2>Confirm Investment</h2>
             <p className="disclaimer">⚠️ Investments carry risk. Capital is not guaranteed.</p>
             <p><strong>Plan:</strong> {selectedPlan.name}</p>
             <p><strong>Target Return:</strong> {selectedPlan.roi}%</p>
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
                      <strong>Estimated Return at Maturity:</strong> ${(parseFloat(amount) * (1 + selectedPlan.roi / 100)).toFixed(2)}
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

  const { investments , syncFromBackend   } = useContext(BalanceContext);
  const [sortBy, setSortBy] = useState("date"); 
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

 // ✅ Always refresh from backend on mount
  useEffect(() => {
    if (typeof syncFromBackend === "function") {
      syncFromBackend();
    }
  }, [syncFromBackend]);

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
 const sortedInvestments = [...(investments || [])].sort((a, b) => {
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "roi") return b.roi - a.roi;
    if (sortBy === "return") return b.expectedReturn - a.expectedReturn;
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return new Date(b.startDate) - new Date(a.startDate); // newest first
  });

// 🔥 Filtering Logic
const filteredInvestments = sortedInvestments.filter((inv) => {
    if (filter === "active") return inv.status === "active";
    if (filter === "matured" || filter === "completed") return inv.status === "completed";
    if (filter === "cancelled") return inv.status === "cancelled";
    return true;
  });


    return (

      <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar}/>
      <div className="dashboard-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="main-content">
       <div className="investlog">
      {/* Controls */}
            <div className="log-controls">
    <div className="control-group">
      <label>Sort</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="date">Sort by Date</option>
        <option value="amount">Sort by Amount</option>
        <option value="roi">Sort by Target Return:</option>
        <option value="return">Sort by Return</option>
        <option value="status">Sort by Status</option>
      </select>
    </div>

    <div className="control-group">
      <label>Filter</label>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">Show All</option>
        <option value="active">Active Only</option>
        <option value="matured">Matured Only</option>
        <option value="cancelled">Cancelled Only</option>
      </select>
    </div>
  </div>
      {filteredInvestments.length === 0 ? (
        <p>No investments found.</p>
      ) : (
        <div className="table-responsive">
          <table className="investment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Plan</th>
              <th>Amount ($)</th>
              <th>Target Return: (%)</th>
              <th>Expected Return ($)</th>
              <th>Status</th>
              <th>Time Left</th>
            </tr>
          </thead>
          <tbody>
                  {filteredInvestments.map((inv, index) => (
                    <tr key={inv._id || index}>
                      <td>{index + 1}</td>
                      <td>{inv.name}</td>
                      <td>${Number(inv.amount).toFixed(2)}</td>
                      <td>{inv.roi}%</td>
                      <td>${Number(inv.expectedReturn).toFixed(2)}</td>
                      <td>{inv.status}</td>
                      <td>{calculateTimeLeft(inv.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
          </table>
        </div>
      )}
       </div>

       </main>
     </div>
     </div>
    );
};
