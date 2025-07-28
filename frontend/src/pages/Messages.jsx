import React,{useContext}  from 'react'
import { BalanceContext } from "../BalanceContext";
import Header from '../Header';
import Sidebar from '../Sidebar';
 
export const Transfer = () => {

    return ( 
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
        
          <div className="messages">
            <div className="transfer-content">
                <div className="transfer-bal">
                    <h1> Transfer money</h1>
                    <p>Current Balance: 0.00 USD</p>
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

export const TransferMoneyLog = () => {
    return (
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
        
        <div className="messages">
            <h1 color='red'>TransferMoneyLog</h1>
        </div>
        </main>
        </div>
        </div>

    );
};

export const InterestLog = () => {
    return (
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
        
        <div className="messages">
            <h1 color='red'>interestlog</h1>
        </div>

        </main>
        </div>
        </div>

    );
};

export const TransactionLog = () => {
    const { transactions } = useContext(BalanceContext);
    return (
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
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
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{tx.type}</td>
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
    );
};
