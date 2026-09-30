import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'

const SidebarLink = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: calc(100% - 18px);
  height: 52px;
  margin: 4px 9px;
  padding: 0 15px;

  color: rgba(231, 238, 252, 0.72);
  text-decoration: none;

  font-size: 14px;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-weight: 500;
  letter-spacing: -0.01em;

  border: 1px solid transparent;
  border-radius: 12px;

  background: transparent;

  transition:
    color 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &::before {
    content: "";
    position: absolute;
    left: -9px;
    top: 50%;
    width: 3px;
    height: 0;
    border-radius: 0 4px 4px 0;

    background: linear-gradient(
      180deg,
      #8b5cf6,
      #6366f1
    );

    box-shadow: 0 0 14px rgba(99, 102, 241, 0.7);

    transform: translateY(-50%);
    transition: height 0.25s ease;
  }

  &:hover {
    color: #ffffff;

    background:
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.075),
        rgba(255, 255, 255, 0.025)
      );

    border-color: rgba(255, 255, 255, 0.075);

    box-shadow:
      0 8px 25px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.045);

    transform: translateX(2px);

    &::before {
      height: 24px;
    }
  }

  & > div:first-child {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  svg {
    flex-shrink: 0;
    width: 19px;
    height: 19px;

    color: rgba(190, 201, 225, 0.62);

    transition:
      color 0.25s ease,
      transform 0.25s ease,
      filter 0.25s ease;
  }

  &:hover svg {
    color: #a78bfa;
    transform: translateX(1px);
    filter: drop-shadow(0 0 7px rgba(139, 92, 246, 0.45));
  }

  @media screen and (max-width: 768px) {
    width: calc(100% - 12px);
    height: 48px;
    margin: 3px 6px;
    padding: 0 13px;
    font-size: 14px;
  }
`;


const SidebarLabel = styled.span`
  margin-left: 13px;

  color: inherit;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  transition:
    opacity 0.25s ease,
    transform 0.25s ease;

  /* Tablet collapsed state */
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    opacity: 0;
    visibility: hidden;

    position: absolute;
    left: 57px;

    margin-left: 0;
    padding: 9px 13px;

    color: #eef2ff;

    background:
      linear-gradient(
        145deg,
        rgba(30, 34, 48, 0.98),
        rgba(15, 18, 28, 0.98)
      );

    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 9px;

    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.38),
      0 0 0 1px rgba(99, 102, 241, 0.04);

    backdrop-filter: blur(18px);

    transform: translateX(-5px);

    pointer-events: none;
    z-index: 100;
  }

  ${SidebarLink}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
    pointer-events: auto;
  }
`;


const DropdownLink = styled(Link)`
  position: relative;

  display: flex;
  align-items: center;

  width: calc(100% - 30px);
  height: 42px;

  margin: 2px 15px;
  padding: 0 12px 0 45px;

  color: rgba(214, 222, 242, 0.55);

  text-decoration: none;

  font-size: 13px;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-weight: 450;

  border-radius: 9px;

  transition:
    color 0.22s ease,
    background 0.22s ease,
    transform 0.22s ease;

  &::before {
    content: "";

    position: absolute;
    left: 27px;
    top: 50%;

    width: 5px;
    height: 5px;

    border-radius: 50%;

    background: rgba(148, 163, 184, 0.35);

    transform: translateY(-50%);

    transition:
      background 0.22s ease,
      box-shadow 0.22s ease;
  }

  svg {
    width: 15px;
    height: 15px;
    margin-right: 10px;

    color: rgba(148, 163, 184, 0.5);

    transition:
      color 0.22s ease,
      transform 0.22s ease;
  }

  &:hover {
    color: #ffffff;

    background:
      linear-gradient(
        90deg,
        rgba(139, 92, 246, 0.12),
        rgba(99, 102, 241, 0.045)
      );

    transform: translateX(2px);

    &::before {
      background: #8b5cf6;
      box-shadow: 0 0 9px rgba(139, 92, 246, 0.7);
    }

    svg {
      color: #a78bfa;
      transform: translateX(2px);
    }
  }
`;


const SubMenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false)
  const location = useLocation()

  const showSubnav = (e) => {
    if (item.subNav) {
      e.preventDefault()
      setSubnav((prev) => !prev)
    }
  }

  const isActive =
    item.path &&
    location.pathname === item.path

  return (
    <>
      <SidebarLink
        to={item.path || '#'}
        onClick={showSubnav}
        style={
          isActive
            ? {
                color: '#ffffff',
                background:
                  'linear-gradient(135deg, rgba(139,92,246,0.13), rgba(99,102,241,0.045))',
                borderColor:
                  'rgba(139,92,246,0.14)',
              }
            : undefined
        }
      >
        <div>
          {item.icons}

          <SidebarLabel>
            {item.title}
          </SidebarLabel>
        </div>

        {item.subNav && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(203, 213, 225, 0.45)',
            }}
          >
            {subnav
              ? item.iconOpened
              : item.iconClosed}
          </div>
        )}
      </SidebarLink>

      {subnav && item.subNav && (
        <div
          style={{
            position: 'relative',
            margin: '2px 0 8px',
            padding: '3px 0',
          }}
        >
          {item.subNav.map((subItem, index) => (
            <DropdownLink
              to={subItem.path}
              key={index}
            >
              {subItem.icons}

              <SidebarLabel>
                {subItem.title}
              </SidebarLabel>
            </DropdownLink>
          ))}
        </div>
      )}
    </>
  )
}

export default SubMenu