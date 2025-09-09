import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Overview from "./pages/Overview";
import "./App.css"; 

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="dashboard-body">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
        {/* Main Content */}
        <main className="dashboard-contents">
          <Overview />
        </main>
      
    </div>
  );
};

export default Dashboard;
