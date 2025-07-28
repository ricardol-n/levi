import React,{createContext,useState,useEffect} from 'react'

export const BalanceContext = createContext();

export const BalanceProvider = ({children}) => {
    const [balance,setBalance] =useState(0);
    const [transactions,setTransactions] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [deposits, setDeposits] = useState([]);


    const addTransaction = (type , method , amount) => {
        const newTransaction = {
            id: transactions.length + 1,
            type,
            method,
            amount,
            date: new Date().toLocaleString(),
        };
        setTransactions((prev) => [...prev,newTransaction]);

        if (type === "Deposit") {
            setDeposits(prev => [...prev, newTransaction]);
        } else if (type === "Withdrawal") {
            setWithdrawals(prev => [...prev, newTransaction]);
        } else if (type === "Investment") {
            setInvestments(prev => [...prev, newTransaction]);
        }
    };
    const addInvestment = (name, amount, expectedReturn,duration) => {
        if (!duration || isNaN(duration) || duration <= 0) {
            console.error("Invalid duration:", duration);
            return;
        }
        const startDate = new Date();
        if (isNaN(startDate.getTime())) {
            console.error("Invalid startDate:", startDate);
            return;
        }
        const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000); // ✅ Store as Date object
        if (isNaN(endDate.getTime())) {
            console.error("Invalid endDate:", endDate);
            return;
        }


        setInvestments(prev => [...prev, { 
            name,
            amount,
            expectedReturn,
            completed: false,
            startDate:  startDate.toISOString(),
            endDate: endDate.toISOString()
        }]);
        console.log("Investment Added:", { name, amount, expectedReturn,duration });
    };
    useEffect(() => {
        const checkMaturedInvestments = () => {
            setInvestments(prevInvestments =>
                prevInvestments.map(inv => {
                    if (!inv.completed && new Date(inv.endDate) <= new Date()) {
                        setBalance(prevBalance => prevBalance + inv.amount + (inv.amount * inv.expectedReturn / 100));
                        return { ...inv, completed: true };
                    }
                    return inv;
                })
            );
        };

        const interval = setInterval(checkMaturedInvestments, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const cancelInvestment = (index) => {
        setInvestments(prevInvestments => {
            const investment = prevInvestments[index];

            if (!investment || investment.completed) return prevInvestments; // Prevent canceling completed investments

            const penaltyAmount = investment.amount * 0.2; // 20% penalty
            const refundedAmount = investment.amount - penaltyAmount;

            setBalance(prevBalance => prevBalance + refundedAmount);

            return prevInvestments.filter((_, i) => i !== index); // Remove canceled investment
        });
    };


  return(
    <BalanceContext.Provider value={{balance,setBalance,transactions,addTransaction,investments,addInvestment,setInvestments,cancelInvestment,withdrawals,deposits}}>
        {children}
    </BalanceContext.Provider>
 );
};



