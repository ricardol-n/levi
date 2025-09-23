import React, { useRef, useEffect, useState, useContext } from "react";
import { PiUserCircleDashedThin } from "react-icons/pi";
import tesla from "./assets/tesla.png";
import {RiMenu4Fill} from "react-icons/ri";
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

function Header({toggleSidebar}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const iconRef = useRef();
  const { user, logout } = useContext(AuthContext);

  const username = user?.username || "Guest";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !iconRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <header className="header">
      {/* Left: Logo */}
      <div className="header-left">
        <RiMenu4Fill className="hamburger" onClick={toggleSidebar} />
        <img src={tesla} alt="Tesla Logo" className="tesla-logo" />
      </div>

      {/* Right: User */}
      <div className="header-right">
        <div
          className="header-user"
          ref={iconRef}
          onClick={() => setOpen(!open)}
        >
          <PiUserCircleDashedThin className="piuser" />
          <span className="username">Hi, {username}</span>
        </div>

        {open && (
          <div ref={menuRef} className="header-dropdown">
            <ul>
              {["Profile", "Settings", "Logout"].map((menu) => (
                <li
                  key={menu}
                  onClick={() => {
                    setOpen(false);
                    if (menu === "Logout") logout();
                  }}
                >
                  {menu}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
