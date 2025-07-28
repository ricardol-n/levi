import React, { useContext, useState } from 'react';
import { BalanceContext } from '../BalanceContext';
import Header from '../Header';
import Sidebar from '../Sidebar';
export const Withdraw = () => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { balance, setBalance, addTransaction } = useContext(BalanceContext);

    const handleMethodChange = (e) => {
        setSelectedMethod(e.target.value);
        setAmount('');
        setError('');
        setSuccess(false);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        setError('');
        setSuccess(false);
    };

    const handleWithdraw = () => {
        const withdrawalAmount = parseFloat(amount);

        if (isNaN(balance) || balance <= 0) {
            setError('Insufficient balance. Please add funds before withdrawing.');
            return;
        }
        if (!selectedMethod) {
            setError('Please select a withdrawal method.');
            return;
        }
        if (withdrawalAmount < 100) {
            setError('The withdrawal amount must be at least $100');
            return;
        }
         if (withdrawalAmount > balance) {
            setError('Insufficient balance for this withdrawal');
            return;
        }

        setBalance(prevBalance => prevBalance - withdrawalAmount);

        addTransaction("Withdrawal",selectedMethod, withdrawalAmount);

        setSuccess(`Withdrawal of $${withdrawalAmount} via ${selectedMethod} was successful!`);
        setError('');
        setAmount('');
        setSelectedMethod('');
    };

    
        


    return (
        <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">

        <div className="team-container">
            <div className="withdraw-details">
                <h2>Withdrawal Application</h2>
                <p><strong>Current Balance:</strong> ${balance.toFixed(2)}</p>
                <div className='withdraw-section'>
                    <h2>Select Withdrawal Method</h2>
                    <select className='withdraw-select' value={selectedMethod} onChange={handleMethodChange}>
                        <option value=''>--Select a Method--</option>
                        <option value='BTC'>Bitcoin</option>
                        <option value='DOGE'>Dogecoin</option>
                        <option value='ETH'>Ethereum</option>
                        <option value='USDT_ERC20'>USDT ERC20</option>
                        <option value='USDT_TRC20'>USDT TRC20</option>
                        <option value='XRP'>XRP Ripple</option>
                    </select>
                    {selectedMethod && (
                        <div>
                            <label htmlFor='amount'>Enter the amount (Minimum $100):</label>
                            <input type='number' id='amount' value={amount} onChange={handleAmountChange} placeholder='Enter amount' />
                            {error && <p className='error-message'>{error}</p>}
                            <button onClick={handleWithdraw} className='withdraw-button' disabled={balance < 100}>Confirm Withdrawal</button>
                        </div>
                    )}
                   {success && (
                   <div className="success-message1">
                     {success}
                      <button onClick={() => setSuccess('')}>✖</button>
            </div>
    )}
                </div>
            </div>
            <div className="withdraw-instructions">
                <h1>Withdraw Instruction</h1>
                <p>Ensure to use the correct {selectedMethod} address. Using any other coin's address will result in permanent loss.</p>
            </div>
        </div>
        


        </main>
      </div>
    </div>
      

)};

export const WithdrawLog = () => {
    const { withdrawals } = useContext(BalanceContext); 

    return (
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
          <div className="team">
            {withdrawals.length === 0 ? (
                <p>No withdrawals yet.</p>
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
                        {withdrawals.map((tx, index) => (
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
