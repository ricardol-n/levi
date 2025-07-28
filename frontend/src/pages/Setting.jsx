import React from 'react'
import Header from '../Header';
import Sidebar from '../Sidebar';
export const Setting = () =>{
    return (
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
        <div className='setting'>
            <h1>Profile</h1>
        </div>
        </main>
        </div>
        </div>
    );
};


export const Logout = () =>{
    return (
        <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
        <div className='setting'>
            <h1>Logout</h1>
        </div>
        </main>
        </div>
        </div>
    );
};