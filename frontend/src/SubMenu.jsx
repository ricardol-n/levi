import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #e1e9fc;
  padding: 20px;
  height: 60px;
  text-decoration: none;
  font-size: 15.5px;
  font-family: cursive;
  transition: all 0.3s ease;

  &:hover {
    background: #252831;
    border-left: 4px solid #632ce4;
    cursor: pointer;
  }

  @media screen and (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
  }
`;

const SidebarLabel = styled.span`
  margin-left: 16px;
  transition: opacity 0.3s ease;

  /* Tablet collapsed: hide text until hover */
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    opacity: 0;
    visibility: hidden;
    position: absolute;
    left: 70px;
    background: #15171c;
    padding: 6px 10px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
  }

  /* When sidebar expands (hover), show text */
  ${SidebarLink}:hover & {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
`;

const DropdownLink = styled(Link)`
  color: white;
  height: 30px;
  display: flex;
  align-items: center;
  padding-left: 3rem;
  text-decoration: none;
  font-size: 12px;
  font-family: cursive;
  transition: all 0.3s ease;

  &:hover {
    background: brown;
    cursor: pointer;
    border-radius: 10px;
  }
`;

const SubMenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false);

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

      {subnav &&
        item.subNav.map((item, index) => (
          <DropdownLink to={item.path} key={index}>
            {item.icons}
            <SidebarLabel>{item.title}</SidebarLabel>
          </DropdownLink>
        ))}
    </>
  );
};

export default SubMenu;
