// src/CompanyInfo.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import tesla from './assets/tesla.png';
import { PiUserCircleDashedThin } from "react-icons/pi";

const Wrapper = styled.div`
  height: 100vh;
//   padding: 2rem;
  background: linear-gradient(135deg, #141e30, #243b55);
  color: white;
  display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
`;

const LoginButton = styled.button`
  width:100px;
  height:100px;
  position:relative;
  left: 160px;
  top:200px;
  background-color: #ff8c00;
  color: white;
  &:hover {
    background-color: #ffa733;
  }
`;

const CompanyInfo = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
        <header className='header'>

             <div className='header-icon'>

             <img src={tesla} alt="Tesla Logo" className="tesla-logo" />
            
            </div>
            <ul className='header-title'>
                <li>HOME</li>
                <li>ABOUT US</li>
                <li>FAQ</li>
                <li>CONTACT</li>
            </ul>
             <PiUserCircleDashedThin  className='piuser' onClick={() => navigate('/login')} />
           



        </header>

      <LoginButton onClick={() => navigate('/login')}>
        Go to Login
      </LoginButton>
    </Wrapper>
  );
};

export default CompanyInfo;
