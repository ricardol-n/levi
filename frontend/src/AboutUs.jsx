// src/AboutUs.js
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { FaChartPie, FaAward, FaGlobe, FaBuilding, FaHeadset } from "react-icons/fa";
import { PiUserCircleDashedThin } from "react-icons/pi";
import { FiMenu, FiX } from "react-icons/fi";

import lowfee from "./assets/low-prices.png";
import security from "./assets/protection.png";
import tesla from "./assets/tesla.png";
import female from "./assets/female.jpg";
import fcsc from "./assets/fcsc.png";
import fca from "./assets/fca.png";
import iso from "./assets/ISO.png";
import data from "./assets/data.png";
import edu from "./assets/education.jpg";
import ParallaxImage from "./utils/ParallaxImage";



const Wrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #141e30, #243b55);
  color: white;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;


const Paragraph = styled.p`
  font-size: 1.2rem;
  max-width: 700px;
  line-height: 1.7;
  margin-bottom: 3rem;
  color: #e0e0e0;
`;

const Button = styled.button`
  padding: 12px 28px;
  border-radius: 30px;
  background-color: #0c0701;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #300157ff;
  }
`;

const WhyChooseSection = styled.section`
  max-width: 900px;
  width: 100%;
  margin: 3rem 0 0;
  text-align: left;

  .why-choose-header {
    margin-bottom: 2rem;

    h1 {
      font-size: 2.4rem;
      color: #ffd700;
      margin-bottom: 0.5rem;
      text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
    }

    p {
      color: #d0d0d0;
      font-size: 1.1rem;
      line-height: 1.6;
      max-width: 600px;
    }
  }

  .why-choose-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 2rem;
  }

  .why-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.8rem 1.2rem;
    border-radius: 15px;
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease;
    cursor: default;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    h2 {
      margin-top: 1rem;
      color: #ffd700;
      font-size: 1.4rem;
      text-align: center;
    }

    p {
      margin-top: 0.5rem;
      color: #ddd;
      font-size: 1rem;
      text-align: center;
    }

    img {
      width: 50px;
      height: 50px;
      margin-bottom: 0.8rem;
      filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.7));
    }

    svg {
      filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.7));
    }
  }
`;

const AboutUs = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Wrapper className="about-wrapper">
      {/* Overlay */}
      <div
        className={`overlay ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Header with sidebar toggle */}
      <header className="header1 fixed-header">
        <img src={tesla} alt="Tesla Logo" className="tesla-logo1" />

        <nav className={menuOpen ? "open" : ""}>
          <ul className="header-title">
            <li onClick={() => navigate('/')}>HOME</li>
            <li onClick={() => navigate('/about')}>ABOUT US</li>
            <li onClick={() => {document.getElementById("FAQ")?.scrollIntoView({ behavior: "smooth" });
              }}>FAQ</li>
            <li><Link to="/contact">CONTACT</Link></li>
          </ul>
        </nav>

        <div className="icons">
          <PiUserCircleDashedThin
            className="piuser"
            size={28}
            onClick={() => navigate("/login")}
          />
          {/* Mobile Menu Toggle */}
          <div
            className="mobile-menu-icon"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </div>
        </div>
      </header>

      {/* Main Content */}

      <section id="about-us" className="why-choose">
        <div className="why-choose-header">
          <h1>Why Choose Txla Investment</h1>
          <p>
            Txla Investment is specially designed to help you start investing
            easily, with powerful tools, competitive pricing, and award-winning
            customer support.
          </p>
        </div>

        <div className="why-choose-grid">
          <div className="why-card">
            <FaChartPie size={50} color="#FFD700" />
            <h2>Fractional Shares</h2>
            <p>Own a piece of even the most expensive US shares. Start from $1,000.</p>
          </div>

          <div className="why-card">
            <FaAward size={50} color="#FFD700" />
            <h2>Award-winning Platform</h2>
            <p>Trusted by thousands, perfect for both beginners and pros.</p>
          </div>

          <div className="why-card">
            <FaGlobe size={50} color="#FFD700" />
            <h2>ETFs & Trusts</h2>
            <p>Access a wide range of sectors and markets worldwide.</p>
          </div>

          <div className="why-card">
            <FaBuilding size={50} color="#FFD700" />
            <h2>Global Stocks</h2>
            <p>Thousands of stocks from NYSE, NASDAQ, LSE, and beyond.</p>
          </div>

          <div className="why-card">
            <FaHeadset size={50} color="#FFD700" />
            <h2>World-class Support</h2>
            <p>Our multilingual team is ready to assist 24/7.</p>
          </div>

          <div className="why-card">
            <img src={security} alt="Security" />
            <h2>Bank-level Security</h2>
            <p>Advanced encryption keeps your funds and data safe.</p>
          </div>

          <div className="why-card">
            <img src={lowfee} alt="Low Fees" />
            <h2>Low & Transparent Fees</h2>
            <p>No hidden charges — keep more of your profits.</p>
          </div>
        </div>
      </section>

      <section className="security">
        <div className="security-img">
          <img src={female} alt="Security measures illustration" />
        </div>

        <div className="security-text">
          <h1>Our Security Measures</h1>
          <p>
            When placing your money with a broker, you need to make sure your
            broker is secure and can endure through good and bad times. Our
            strong capital position, conservative balance sheet, and automated
            risk controls are designed to protect Txla Investment and our
            clients from large trading losses.
          </p>
        </div>

        <div className="equity-capital">
          <div className="equ-cap">
            <h1>$13.8B</h1>
            <p>Equity Capital*</p>
          </div>
          <div className="equ-cap">
            <h1>$8.5B</h1>
            <p>Excess Regulatory Capital*</p>
          </div>
          <div className="equ-cap">
            <h1>$2.08M</h1>
            <p>Client Account*</p>
          </div>
          <div className="equ-cap">
            <h1>$1.95M</h1>
            <p>Daily Avg Revenue Trades*</p>
          </div>
        </div>

        <div className="fca">
          <div className="fca-auth">
            <img src={fca} alt="" />
            <p>We are authorised and regulated by the FCA.</p>
          </div>
          <div className="fca-auth">
            <img src={fcsc} alt="" />
            <p>Your funds are protected by the FSCS scheme up to $85,000.</p>
          </div>
          <div className="fca-auth">
            <img src={iso} alt="" />
            <p>Password protection with Bcrypt hashing algorithm.</p>
          </div>
          <div className="fca-auth">
            <img src={data} alt="" />
            <p>We follow industry best practices to protect your data at all times.</p>
          </div>
        </div>
      </section>

      <section className="tesla1">
        <div className="edu-res">
          <h1>Educational Resources</h1>
          <p>
            Even the most experienced traders or investors need to keep learning
            to stay ahead. Txla Investment provides several resources to help
            you better understand Txla Investment products and services, markets
            and technology.
          </p>
          <div className="tesla-ul">
            <ul>
              <li>Academy</li>
              <li>Webinars</li>
              <li>Insights</li>
              <li>Podcasts</li>
              <li>TradingLab</li>
            </ul>
          </div>
        </div>
        <div className="tesla-img">
          <ParallaxImage  src={edu} alt="Tesla " />
        </div>
      </section>

      <Button onClick={() => navigate("/")}>Back to Home</Button>
    </Wrapper>
  );
};

export default AboutUs;
