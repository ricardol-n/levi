// src/CompanyInfo.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import tesla from './assets/tesla.png';

const Wrapper = styled.div`
  height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #141e30, #243b55);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LoginButton = styled.button`
  margin-top: 2rem;
  padding: 12px 24px;
  font-size: 18px;
  border: none;
  background-color: #ff8c00;
  color: white;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #ffa733;
  }
`;

const CompanyInfo = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
         <div className='header-icon'>
        
                        
                        <img src={tesla} alt="Tesla Logo" className="tesla-logo" />
                            <div className='header-menu-icon'>
        
                            </div>
        
                        </div>
                       
        
                        <div className='header-user'>
                            
                            <div className='header-username'>
                            <PiUserCircleDashedThin className='piuser'/>
                             <h1 ref={iconRef}
                                onClick={()=>setOpen(!open)} >
                                
                                 Welcome, {username}! 
                                </h1>
        
                             {
                                open && (
                                    <div ref={menuRef} className="header-drop">
                                    <ul>
                                         {["Profile", "Settings", "Logout"].map((menu) => (
                                             <li key={menu} onClick={() => {setOpen(false);
                                                 if (menu === "Logout") logout(); }}>
                                                    {menu}
                                             </li>
                                         ))}
                                    </ul>
        
                                
                                </div>
                                )}
                                
                            </div>
                        </div>
                    
        
      <h1>Welcome to Fintrust Capital</h1>
      <p>
        Fintrust Capital is a modern investment platform where your digital assets grow.
        We provide secure, fast, and reliable ways to invest in crypto and manage funds.
      </p>

      <LoginButton onClick={() => navigate('/login')}>
        Go to Login
      </LoginButton>
    </Wrapper>
  );
};

export default CompanyInfo;
