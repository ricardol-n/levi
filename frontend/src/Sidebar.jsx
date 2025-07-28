import React, { useState } from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import { FaBars, FaTimes } from "react-icons/fa";
import {SidebarData} from './SidebarData';
import SubMenu from './SubMenu';
import { IconContext } from 'react-icons/lib';
import { color } from 'framer-motion';


const SidebarNav = styled.nav`
 background:#15171c;
 width:160px;
 height:100vh;
 display:flex;
 transition:350ms;
 position:fixed;
 overflow:hidden;
  top: 63px;
  left: 0;
  transition: 0.3s ease-in-out;
  z-index: 2000;
  
  



  @media screen and (max-width: 768px) {
    width:160px;
  }
`;


const SidebarWrap = styled.div`
 width: 100%;
`
const NavIcon = styled(Link)`
  position: absolute;
  top: 10px;
  left: 15px;
  font-size: 1.5rem;
  background: none;
  cursor: pointer;
  color: #fff;
`;
const CloseIcon = styled(FaTimes)`
  position: absolute;
  top: 20px;
  right: 15px;
  font-size: 1.8rem;
  color: #fff;
  cursor: pointer;
`;

export function Sidebar() {
  const [sidebar,setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);
  return (
    <>
    <IconContext.Provider value={{color:'gold'}}>
            <div className="menu-bar">
                
            </div>
            <NavIcon to="#">
             <FaBars onClick={showSidebar} />
           </NavIcon>
      
      <SidebarNav  className={sidebar ? "active" : ""}> 
          <SidebarWrap>
          {SidebarData.map((item,index) => {
            return <SubMenu item={item} key={index}/>;

          })}
              
          </SidebarWrap>

      </SidebarNav>
    </IconContext.Provider> 
    </>
  );
}

export default Sidebar;
