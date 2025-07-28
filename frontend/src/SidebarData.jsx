import React from 'react'
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai'; 
import * as IoIcons from 'react-icons/io';
import * as RiIcons from 'react-icons/ri';
import { CiCoinInsert} from "react-icons/ci";
import { SiDepositphotos } from "react-icons/si";
import { BiMoneyWithdraw } from "react-icons/bi";
import { PiHandWithdraw } from "react-icons/pi";
import { TbTransfer,TbTransactionBitcoin,TbAuth2Fa } from "react-icons/tb";
import { FaMoneyBillTransfer } from "react-icons/fa6";

export const SidebarData = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icons:<AiIcons.AiFillHome/>,
        iconClosed: <RiIcons.RiArrowDownSFill/>,
        iconOpened: <RiIcons.RiArrowUpSFill/>,
        
    },
    {
        title: 'Investment',
        icons:<CiCoinInsert/>,
        iconClosed: <RiIcons.RiArrowDownSFill/>,
        iconOpened: <RiIcons.RiArrowUpSFill/>,
        subNav:[
            {
                title: 'Investment Plans',
                path: '/investmentplans',
                icons:<FaIcons.FaFileInvoiceDollar/>,
                
            },
            {
                title: 'Invest Log',
                path: '/InvestLog',
                icons:<IoIcons.IoIosPaper/>,
                
            }

        ]
    },
    {
        title: 'Deposit',
        icons:<SiDepositphotos/>,
        iconClosed: <RiIcons.RiArrowDownSFill/>,
        iconOpened: <RiIcons.RiArrowUpSFill/>,
        subNav:[
            {
                title:'Deposit',
                path:'/deposit',
                icons:<RiIcons.RiLuggageDepositLine/>,
                
            },
            {
                title:'Deposit Log',
                path:'/depositlog',
                icons:<IoIcons.IoIosPaper/>,
                
            }
        ]
    },
    {
        title: 'Withdraw',
        icons:<BiMoneyWithdraw/>,
        iconClosed: <RiIcons.RiArrowDownSFill/>,
        iconOpened: <RiIcons.RiArrowUpSFill/>,
        subNav:[
            {
                title:'Withdraw',
                path: '/withdraw',
                icons:<PiHandWithdraw/>,
            },
            {
                title:'Withdraw Log',
                path: '/withdrawlog',
                icons:<IoIcons.IoIosPaper/>,
            }
        ]
    },
    {
        title: 'Transfer',
        path: '/transfer',
        icons:<TbTransfer/>,
        iconClosed:<RiIcons.RiArrowDownSFill/>,
        iconOpened:<RiIcons.RiArrowUpSFill/>,
        subNav:[
            {
                title: 'Transfer Money Log',
                path: '/transfer/transferlog',
                icons:<FaMoneyBillTransfer/>,
                
            },
            {
                title: 'Interest Log',
                path: '/transfer/interestlog',
                icons:<IoIcons.IoIosPaper/>,
                
            },
            {
                title: 'Transaction Log',
                path: '/transfer/transactionlog',
                icons:<TbTransactionBitcoin/>,
                
            },
            
        ]
    },
    {
        title: 'Refferal Log',
        path: '/refferallog',
        icons:<FaIcons.FaUsers/>,
    },
    {
        title: '',
        path: '/twofactor',
        icons:<TbAuth2Fa/>,
    },
    {
        title: 'Setting',
        icons:<AiIcons.AiOutlineSetting/>,
        subNav:[
            {
                title: 'Profile',
                path: '/Setting/profile',
                icons:<RiIcons.RiUserSettingsLine/>,
            },
            {
                title: 'Logout',
                path: '/Setting/logout',
                icons:<RiIcons.RiLogoutCircleLine/>,
            }
        ]
    }
]