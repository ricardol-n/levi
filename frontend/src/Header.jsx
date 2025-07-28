import React, { useRef,useEffect, useState, useContext } from 'react'
import * as RiIcons from 'react-icons/ri';
import { PiUserCircleDashedThin } from "react-icons/pi";
import tesla from './assets/tesla.png';
import { RiMenu4Fill } from "react-icons/ri";
import Sidebar from './Sidebar';
import { AuthContext } from './context/Authcontext';


function Header(){
    const [open,setOpen] = useState(false);
    const Menus = ["Profile","Settings"," Logout"];
    const menuRef = useRef();
    const iconRef = useRef();
    const { user, logout } = useContext(AuthContext);
    const username = user?.username || "Guest";


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) && !iconRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className='header'>
        
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
            

        </header>

    )
}

export default Header;