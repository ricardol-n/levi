import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaTimes } from "react-icons/fa";
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';
import { IconContext } from 'react-icons/lib';
import "./App.css";

const SidebarNav = styled.nav`
  background: #15171c;
  height: 100vh;
  position: fixed;
  top: 63px;
  left: 0;
  width: 200px;
  z-index: 2000;
  transition: left 0.3s ease;
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;
  transform: translateX(0);
  

  @media screen and (max-width: 1023px) {
  top: 57px;
  height: calc(100vh - 0px);
  transform: ${({ $open }) => ($open ? "translateX(0)" : "translateX(-100%)")};
  background: #0f0c12ec;
  }

  @media screen and (min-width: 1024px) {
    left: 0;
  }
  @media screen and (min-width: 767px) {
  top:55px; 
  }
`;

const SidebarWrap = styled.div`
  width: 100%;
  padding:10px;
`;


export function Sidebar({sidebarOpen,toggleSidebar}) {
  
  return (
    <IconContext.Provider value={{ color: 'red' }}>
      {/* Mobile Menu Toggle */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`} 
        onClick={toggleSidebar}
      ></div>

      <SidebarNav $open={sidebarOpen}>
    
        <SidebarWrap>
          {SidebarData.map((item, index) => (
            <SubMenu item={item} key={index} />
          ))}
        </SidebarWrap>
      </SidebarNav>
    </IconContext.Provider>
  );
}

export default Sidebar;
