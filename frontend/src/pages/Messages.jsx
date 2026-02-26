import React,{useContext,useState}  from 'react'
import { BalanceContext } from "../BalanceContext";
import Header from '../Header';
import Sidebar from '../Sidebar';
 
export const Transfer = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const {balance} = useContext(BalanceContext);

    return ( 
        <div className="dashboard-container">
        <Header toggleSidebar={toggleSidebar}/>
        <div className="dashboard-content">
          <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>
          <main className="main-content">
        
          <div className="messages">
            <div className="transfer-content">
                <div className="transfer-bal">
                    <h1> Transfer money</h1>
                    <p>Current Balance:  ${balance.toFixed(2)} USD</p>
                </div>
                <div className="transfer-receiver">
                    <p>Receiver Email</p>
                    <input type="text" placeholder='Transfer account email'  />
                    <p>Amount</p>
                    <input type="text" placeholder='Transfer Amount' />

                </div>
                <h2>Transfer charge 2%</h2>
                <div className="transfer-charge">
                    <div className="min-transfer">
                        <h3>Min transfer amount</h3>
                        <p>10 USD</p>
                    </div>
                    <div className="max-transfer">
                        <h3>Min transfer amount</h3>
                        <p>1000000 USD</p>
                    </div>
                </div>
                <button> Transfer Money </button>
            </div>
    
         </div>

        </main>
        </div>
        </div>

    );
};


export const TransactionLog = () => {
    const { transactions = [] } = useContext(BalanceContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    
    return (
        <div className="dashboard-container">
        <Header toggleSidebar={toggleSidebar} />
        <div className="dashboard-content">
          <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main className="main-content">
        
        <div className="transaction-log">
            <h2>Transaction History</h2>
            {transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Type</th>
                            <th>Method</th>
                            <th>Amount ($)</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, index) => (
                        <tr key={tx._id || index}>
                          <td>{index + 1}</td>
                          <td>{tx.type || "N/A"}</td>
                          <td>{tx.method || "N/A"}</td>
                          <td>${Number(tx.amount || 0).toFixed(2)}</td>
                          <td>
                            {tx.date ? new Date(tx.date).toLocaleString() : "N/A"}
                          </td>
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
