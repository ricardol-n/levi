import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'


const SidebarLink = styled(Link)`
  display:flex;
  color:#e1e9fc;
  justify-content: space-between;
  align-items:center;
  padding:20px;
  list-style:none;
  height:60px;
  text-decoration:none;
  font-size:15.5px;
  font-family:cursive;

  
  &:hover {
  background:#252831;
  border-left: 4px solid #632ce4;
  cursor:pointer;
  }

  @media screen and (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
  }
`;
const SidebarLabel = styled.span`
 margin-left:16px;

 
`;

const DropdownLink = styled(Link)`
    color:white;
    height:30px;
    display:flex;
    align-items:center;
    padding-left:3rem;
    text-decoration:none;
    font-size:12px;
    font-family:cursive;
    
    

    &:hover {
      background: brown;
      cursor: pointer;
      border-radius:10px;
    }
`


const SubMenu = ({item}) => {
    const [subnav,setSubnav] = useState(false);

    const showSubnav = () => setSubnav(!subnav);

    return (
        <>
        <SidebarLink to={item.path} onClick={item.subNav && showSubnav}>
            <div>
                {item.icons}
                <SidebarLabel>{item.title}</SidebarLabel>
            </div>
            <div>
                {item.subNav && subnav 
                ? item.iconOpened 
                : item.subNav 
                ? item.iconClosed 
                : null}
            </div>

        </SidebarLink>
        {subnav && item.subNav.map((item,index) => {
            return (
                <DropdownLink to={item.path} key={index}>
                    {item.icons}
                    <SidebarLabel>{item.title}</SidebarLabel>
                </DropdownLink>
            )
        })}

        </>
    );
};

export default SubMenu;