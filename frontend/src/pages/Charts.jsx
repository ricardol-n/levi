import React, { useContext } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { BalanceContext } from "../BalanceContext";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend } from "chart.js";

// ✅ Register required chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend);

export const Charts = () => {
    const { transactions } = useContext(BalanceContext);

    const deposits = transactions.filter(tx => tx.type === "Deposit").length;
    const withdrawals = transactions.filter(tx => tx.type === "Withdrawal").length;
    const investments = transactions.filter(tx => tx.type === "Investment").length;

    // ✅ Data for Bar Chart
    const barData = {
        labels: ["Deposits", "Withdrawals", "Investments"],
        datasets: [
            {
                label: "Transaction Count",
                data: [deposits, withdrawals, investments],
                backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
            },
        ],
    };

    // ✅ Data for Pie Chart
    const pieData = {
        labels: ["Deposits", "Withdrawals", "Investments"],
        datasets: [
            {
                data: [deposits, withdrawals, investments],
                backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false, // Allows dynamic resizing
        plugins: {
          legend: {
            position: "top",
          },
        },
      };

    return (
        <div className="charts">
            
            <div className="chart-container">
                <Bar data={barData} /> 
                <Pie data={pieData} /> options={options}
            </div>
        </div>
    );
};
