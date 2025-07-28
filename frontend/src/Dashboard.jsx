import Header from './Header';
import Sidebar from './Sidebar';
import Overview from './pages/Overview';

const Dashboard = () => {
    return (
        <div>
             <Header />
             <Sidebar />
            <Overview />
        </div>
    );
};

export default Dashboard;