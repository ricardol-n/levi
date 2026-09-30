// src/About.jsx

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";

import {
  FaChartPie,
  FaAward,
  FaGlobe,
  FaBuilding,
  FaHeadset,
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

import {
  PiUserCircleDashedThin,
} from "react-icons/pi";

import {
  FiMenu,
  FiX,
} from "react-icons/fi";

import tesla from "./assets/tesla.png";
import lowfee from "./assets/low-prices.png";
import security from "./assets/protection.png";
import female from "./assets/female.jpg";
import fcsc from "./assets/fcsc.png";
import fca from "./assets/fca.png";
import iso from "./assets/ISO.png";
import data from "./assets/data.png";
import edu from "./assets/education.jpg";

import ParallaxImage from "./utils/ParallaxImage";


/* =========================================================
   PAGE
========================================================= */

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background:
    radial-gradient(
      900px 500px at 10% 0%,
      rgba(239, 68, 68, 0.10),
      transparent 65%
    ),
    radial-gradient(
      800px 500px at 90% 15%,
      rgba(59, 130, 246, 0.10),
      transparent 65%
    ),
    radial-gradient(
      700px 400px at 50% 80%,
      rgba(201, 162, 39, 0.07),
      transparent 65%
    ),
    linear-gradient(
      135deg,
      #020617 0%,
      #0b1020 45%,
      #0f172a 100%
    );

  color: #fff;

  animation: aboutPageBounce 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;

  @keyframes aboutPageBounce {
    0% {
      opacity: 0;
      transform: translateY(35px) scale(0.97);
    }

    60% {
      opacity: 1;
      transform: translateY(-8px) scale(1.01);
    }

    80% {
      transform: translateY(3px) scale(0.995);
    }

    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;



/* =========================================================
   HERO
========================================================= */

const Hero = styled.section`
  position: relative;
  min-height: 560px;
  padding: 150px 7% 90px;

  display: flex;
  align-items: center;
  justify-content: center;

  text-align: center;

  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;

    background: rgba(239, 68, 68, 0.07);

    filter: blur(80px);

    top: -250px;
    left: -180px;
  }

  &::after {
    content: "";
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;

    background: rgba(201, 162, 39, 0.06);

    filter: blur(80px);

    right: -180px;
    bottom: -220px;
  }

  @media (max-width: 768px) {
    min-height: 520px;
    padding: 125px 22px 70px;
  }
`;


const HeroContent = styled.div`
  position: relative;
  z-index: 2;

  max-width: 900px;
  margin: 0 auto;
`;


const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 8px 15px;

  border-radius: 999px;

  border: 1px solid rgba(201, 162, 39, 0.28);

  background: rgba(201, 162, 39, 0.07);

  color: #d8b84c;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 1.8px;
  text-transform: uppercase;

  margin-bottom: 24px;
`;


const HeroTitle = styled.h1`
  margin: 0;

  font-size: clamp(42px, 6vw, 78px);

  line-height: 1.02;

  font-weight: 800;

  letter-spacing: -2.5px;

  background: linear-gradient(
    120deg,
    #ffffff 10%,
    #e5e7eb 45%,
    #c9a227 80%
  );

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;


const HeroText = styled.p`
  max-width: 720px;

  margin: 28px auto 0;

  color: #aeb8c8;

  font-size: 18px;

  line-height: 1.8;

  @media (max-width: 600px) {
    font-size: 15px;
  }
`;


const HeroButtons = styled.div`
  display: flex;

  justify-content: center;

  gap: 14px;

  margin-top: 35px;

  flex-wrap: wrap;
`;


const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  padding: 13px 22px;

  border: 1px solid rgba(239, 68, 68, 0.4);

  border-radius: 12px;

  background: linear-gradient(
    135deg,
    #ef4444,
    #b91c1c
  );

  color: white;

  font-weight: 700;

  cursor: pointer;

  box-shadow:
    0 10px 30px rgba(239, 68, 68, 0.18);

  transition: 0.25s ease;

  &:hover {
    transform: translateY(-2px);

    box-shadow:
      0 15px 35px rgba(239, 68, 68, 0.28);
  }
`;


const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  padding: 13px 22px;

  border-radius: 12px;

  border: 1px solid rgba(255,255,255,0.12);

  background: rgba(255,255,255,0.04);

  color: #e5e7eb;

  font-weight: 600;

  cursor: pointer;

  transition: 0.25s ease;

  &:hover {
    background: rgba(255,255,255,0.08);

    border-color: rgba(201,162,39,0.35);
  }
`;


/* =========================================================
   SECTION
========================================================= */

const Section = styled.section`
  width: min(1180px, calc(100% - 40px));

  margin: 0 auto;

  padding: 90px 0;

  @media (max-width: 600px) {
    padding: 65px 0;
  }
`;


const SectionHeader = styled.div`
  max-width: 700px;

  margin: 0 auto 45px;

  text-align: center;

  span {
    color: #c9a227;

    font-size: 12px;

    font-weight: 700;

    letter-spacing: 2px;

    text-transform: uppercase;
  }

  h2 {
    margin: 12px 0 15px;

    font-size: clamp(30px, 4vw, 46px);

    letter-spacing: -1px;
  }

  p {
    margin: 0;

    color: #9ca8ba;

    line-height: 1.8;
  }
`;


/* =========================================================
   WHY TXLA
========================================================= */

const Cards = styled.div`
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;


const Card = styled.div`
  position: relative;

  padding: 28px 24px;

  border-radius: 20px;

  border: 1px solid rgba(255,255,255,0.08);

  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,0.065),
      rgba(255,255,255,0.025)
    );

  backdrop-filter: blur(16px);

  transition: 0.3s ease;

  &:hover {
    transform: translateY(-7px);

    border-color:
      rgba(201,162,39,0.28);

    box-shadow:
      0 20px 50px rgba(0,0,0,0.22);
  }

  .icon {
    width: 52px;
    height: 52px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 14px;

    background:
      rgba(201,162,39,0.08);

    color: #c9a227;

    margin-bottom: 20px;
  }

  h3 {
    margin: 0 0 10px;

    font-size: 19px;
  }

  p {
    margin: 0;

    color: #98a4b5;

    font-size: 14px;

    line-height: 1.7;
  }
`;


/* =========================================================
   SECURITY
========================================================= */

const SecuritySection = styled.section`
  width: 100%;

  background:
    linear-gradient(
      180deg,
      rgba(255,255,255,0.025),
      rgba(255,255,255,0.01)
    );

  border-top:
    1px solid rgba(255,255,255,0.06);

  border-bottom:
    1px solid rgba(255,255,255,0.06);
`;


const SecurityGrid = styled.div`
  width: min(1180px, calc(100% - 40px));

  margin: auto;

  padding: 90px 0;

  display: grid;

  grid-template-columns:
    0.9fr 1.1fr;

  gap: 65px;

  align-items: center;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;

    gap: 40px;
  }
`;


const SecurityImage = styled.div`
  border-radius: 24px;

  overflow: hidden;

  border: 1px solid rgba(255,255,255,0.08);

  box-shadow:
    0 25px 70px rgba(0,0,0,0.3);

  img {
    width: 100%;
    display: block;
  }
`;


const SecurityContent = styled.div`
  .label {
    color: #c9a227;

    font-size: 12px;

    font-weight: 700;

    letter-spacing: 2px;

    text-transform: uppercase;
  }

  h2 {
    margin: 12px 0 18px;

    font-size: clamp(30px, 4vw, 46px);
  }

  > p {
    color: #9ca8ba;

    line-height: 1.8;
  }
`;


const SecurityPoints = styled.div`
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 14px;

  margin-top: 28px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;


const SecurityPoint = styled.div`
  display: flex;

  align-items: flex-start;

  gap: 10px;

  color: #d7dde7;

  font-size: 14px;

  line-height: 1.5;

  svg {
    flex-shrink: 0;

    margin-top: 2px;

    color: #c9a227;
  }
`;


/* =========================================================
   REGULATORY / SECURITY CARDS
========================================================= */

const TrustGrid = styled.div`
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;

  margin-top: 45px;

  @media (max-width: 900px) {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;


const TrustCard = styled.div`
  text-align: center;

  padding: 25px 18px;

  border-radius: 18px;

  border:
    1px solid rgba(255,255,255,0.08);

  background:
    rgba(255,255,255,0.035);

  img {
    width: 70px;
    height: 70px;

    object-fit: contain;

    margin-bottom: 15px;
  }

  p {
    margin: 0;

    color: #aab4c3;

    font-size: 13px;

    line-height: 1.6;
  }
`;


/* =========================================================
   EDUCATION
========================================================= */

const Education = styled.section`
  width: min(1180px, calc(100% - 40px));

  margin: auto;

  padding: 100px 0;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 65px;

  align-items: center;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;

    padding: 70px 0;
  }
`;


const EducationText = styled.div`
  span {
    color: #c9a227;

    font-size: 12px;

    font-weight: 700;

    letter-spacing: 2px;

    text-transform: uppercase;
  }

  h2 {
    font-size: clamp(30px, 4vw, 44px);

    margin: 12px 0 18px;
  }

  p {
    color: #9ca8ba;

    line-height: 1.8;
  }
`;


const ResourceList = styled.div`
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;

  margin-top: 25px;

  div {
    display: flex;

    align-items: center;

    gap: 8px;

    color: #d8dee8;

    font-size: 14px;
  }

  svg {
    color: #c9a227;
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;


const EducationImage = styled.div`
  border-radius: 24px;

  overflow: hidden;

  border: 1px solid rgba(255,255,255,0.08);

  img {
    width: 100%;

    display: block;
  }
`;


/* =========================================================
   ABOUT COMPONENT
========================================================= */

const AboutUs = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);


  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);


  const closeMenu = () => {
    setMenuOpen(false);
  };


  return (
    
    <Wrapper>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="header1">
        {/* LOGO */}
        <Link
          to="/"
          className="header-brand"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src={tesla}
            alt="TXLA Investment"
            className="tesla-logo1"
          />
      
          <div className="brand-text">
            <span>TXLA</span>
            <small>INVESTMENT</small>
          </div>
        </Link>
      
      
        {/* DESKTOP NAV */}
        <nav className="desktop-nav">
          <ul className="header-title">
            <li>
              <Link to="/">HOME</Link>
            </li>
      
            <li>
              <Link to="/about">ABOUT US</Link>
            </li>
      
            <li>
              <Link to="/company-info#FAQ">FAQ</Link>
            </li>
      
            <li>
              <Link to="/contact">CONTACT</Link>
            </li>
          </ul>
        </nav>
      
      
        {/* RIGHT SIDE */}
        <div className="icons">
      
          {/* LOGIN */}
          <button
            className="header-user-button"
            onClick={() => navigate('/login')}
            aria-label="Open login"
          >
            <PiUserCircleDashedThin
              className="piuser"
              size={26}
            />
      
            <span>Login</span>
          </button>
      
      
          {/* MOBILE MENU BUTTON */}
          <button
            className={`mobile-menu-icon ${
              menuOpen ? "is-open" : ""
            }`}
            onClick={() =>
              setMenuOpen(prev => !prev)
            }
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <FiX size={25} />
            ) : (
              <FiMenu size={25} />
            )}
          </button>
      
        </div>
      
      
        {/* MOBILE OVERLAY */}
        <div
          className={`mobile-overlay ${
            menuOpen ? "active" : ""
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}
        />
      
      
        {/* MOBILE MENU */}
        <aside
          className={`mobile-menu-panel ${
            menuOpen ? "open" : ""
          }`}
          aria-hidden={!menuOpen}
        >
      
          {/* PANEL HEADER */}
          <div className="mobile-menu-header">
      
            <div className="mobile-menu-brand">
              <img
                src={tesla}
                alt="TXLA Investment"
              />
      
              <div>
                <strong>TXLA</strong>
                <span>INVESTMENT</span>
              </div>
            </div>
      
          
      
          </div>
      
      
          {/* PANEL INTRO */}
          <div className="mobile-menu-intro">
            <span className="mobile-menu-eyebrow">
              TXLA INVESTMENT
            </span>
      
            <h3>
              Navigate your
              <br />
              investment journey.
            </h3>
      
            <p>
              Explore our platform, markets,
              resources and investor tools.
            </p>
          </div>
      
      
          {/* NAVIGATION */}
          <nav className="mobile-navigation">
      
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-nav-number">
                01
              </span>
      
              <span className="mobile-nav-content">
                <strong>Home</strong>
                <small>TXLA Investment</small>
              </span>
      
              <span className="mobile-nav-arrow">
                →
              </span>
            </Link>
      
      
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-nav-number">
                02
              </span>
      
              <span className="mobile-nav-content">
                <strong>About Us</strong>
                <small>Our company & mission</small>
              </span>
      
              <span className="mobile-nav-arrow">
                →
              </span>
            </Link>
      
      
            <Link
              to="/company-info#FAQ"
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-nav-number">
                03
              </span>
      
              <span className="mobile-nav-content">
                <strong>FAQ</strong>
                <small>Investment knowledge</small>
              </span>
      
              <span className="mobile-nav-arrow">
                →
              </span>
            </Link>
      
      
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-nav-number">
                04
              </span>
      
              <span className="mobile-nav-content">
                <strong>Contact</strong>
                <small>We're here to help</small>
              </span>
      
              <span className="mobile-nav-arrow">
                →
              </span>
            </Link>
      
          </nav>
      
      
          {/* MENU FOOTER */}
          <div className="mobile-menu-footer">
      
            <button
              className="mobile-login-card"
              onClick={() => {
                setMenuOpen(false)
                navigate('/login')
              }}
            >
              <span className="mobile-login-icon">
                <PiUserCircleDashedThin size={23} />
              </span>
      
              <span>
                <strong>Investor Login</strong>
                <small>Access your account</small>
              </span>
      
              <span className="mobile-login-arrow">
                →
              </span>
            </button>
      
      
            <div className="mobile-menu-status">
              <span className="status-dot" />
              Markets & platform online
            </div>
      
          </div>
      
        </aside>
      
            </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <Hero>

        <HeroContent>

          <Eyebrow>
            <FaShieldAlt />
            ABOUT TXLA INVESTMENT
          </Eyebrow>

          <HeroTitle>
            Investing built around
            <br />
            people, markets & trust.
          </HeroTitle>

          <HeroText>
            TXLA Investment is designed to give investors
            access to global markets through a modern,
            transparent and secure investment experience.
          </HeroText>


          <HeroButtons>

            <PrimaryButton
              onClick={() => navigate("/register")}
            >
              Get Started
              <FaArrowRight />
            </PrimaryButton>


            <SecondaryButton
              onClick={() =>
                document
                  .getElementById("why-choose")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore TXLA
            </SecondaryButton>

          </HeroButtons>

        </HeroContent>

      </Hero>


      {/* =====================================================
          WHY CHOOSE
      ===================================================== */}

      <Section id="why-choose">

        <SectionHeader>

          <span>WHY TXLA</span>

          <h2>
            Everything you need to invest
            with confidence
          </h2>

          <p>
            TXLA Investment brings together access to
            global markets, modern technology, security
            controls and investor-focused support.
          </p>

        </SectionHeader>


        <Cards>

          <Card>
            <div className="icon">
              <FaChartPie size={23} />
            </div>

            <h3>
              Fractional Shares
            </h3>

            <p>
              Access selected investments without
              needing to purchase a complete share.
            </p>
          </Card>


          <Card>
            <div className="icon">
              <FaAward size={23} />
            </div>

            <h3>
              Modern Platform
            </h3>

            <p>
              A streamlined experience designed
              for both new and experienced investors.
            </p>
          </Card>


          <Card>
            <div className="icon">
              <FaGlobe size={23} />
            </div>

            <h3>
              Global Markets
            </h3>

            <p>
              Explore investment opportunities
              across international markets.
            </p>
          </Card>


          <Card>
            <div className="icon">
              <FaBuilding size={23} />
            </div>

            <h3>
              Diverse Assets
            </h3>

            <p>
              Discover stocks, ETFs and other
              investment opportunities.
            </p>
          </Card>


          <Card>
            <div className="icon">
              <FaHeadset size={23} />
            </div>

            <h3>
              Investor Support
            </h3>

            <p>
              Our support team is available to help
              you navigate the platform.
            </p>
          </Card>


          <Card>
            <div className="icon">
              <FaShieldAlt size={23} />
            </div>

            <h3>
              Security First
            </h3>

            <p>
              Account protection and security
              controls are built into the platform.
            </p>
          </Card>

        </Cards>

      </Section>


      {/* =====================================================
          SECURITY
      ===================================================== */}

      <SecuritySection>

        <SecurityGrid>

          <SecurityImage>
            <img
              src={female}
              alt="TXLA Investment security"
              loading="lazy"
            />
          </SecurityImage>


          <SecurityContent>

            <span className="label">
              SECURITY
            </span>

            <h2>
              Protecting your account
              matters to us.
            </h2>

            <p>
              We use layered security practices and
              automated controls designed to help
              protect accounts, personal information
              and transactions.
            </p>


            <SecurityPoints>

              <SecurityPoint>
                <FaCheckCircle />
                Secure account authentication
              </SecurityPoint>

              <SecurityPoint>
                <FaCheckCircle />
                Password protection
              </SecurityPoint>

              <SecurityPoint>
                <FaCheckCircle />
                Transaction monitoring
              </SecurityPoint>

              <SecurityPoint>
                <FaCheckCircle />
                Data protection controls
              </SecurityPoint>

            </SecurityPoints>

          </SecurityContent>

        </SecurityGrid>


        <Section>

          <SectionHeader>

            <span>PROTECTION</span>

            <h2>
              Security & compliance
            </h2>

            <p>
              The following areas represent the
              security and protection measures used
              throughout the TXLA platform.
            </p>

          </SectionHeader>


          <TrustGrid>

            <TrustCard>
              <img
                src={fca}
                alt="Regulatory information"
              />

              <p>
                Regulatory and compliance
                standards.
              </p>
            </TrustCard>


            <TrustCard>
              <img
                src={fcsc}
                alt="Client protection"
              />

              <p>
                Client protection information.
              </p>
            </TrustCard>


            <TrustCard>
              <img
                src={iso}
                alt="Security standard"
              />

              <p>
                Secure password protection
                practices.
              </p>
            </TrustCard>


            <TrustCard>
              <img
                src={data}
                alt="Data protection"
              />

              <p>
                Data protection and privacy
                controls.
              </p>
            </TrustCard>

          </TrustGrid>

        </Section>

      </SecuritySection>


      {/* =====================================================
          EDUCATION
      ===================================================== */}

      <Education>

        <EducationText>

          <span>
            EDUCATION
          </span>

          <h2>
            Keep learning.
            Keep growing.
          </h2>

          <p>
            Investing is a continuous learning process.
            TXLA Investment provides educational resources
            designed to help users better understand markets,
            investment concepts and platform features.
          </p>


          <ResourceList>

            <div>
              <FaCheckCircle />
              Academy
            </div>

            <div>
              <FaCheckCircle />
              Webinars
            </div>

            <div>
              <FaCheckCircle />
              Market Insights
            </div>

            <div>
              <FaCheckCircle />
              Podcasts
            </div>

            <div>
              <FaCheckCircle />
              TradingLab
            </div>

            <div>
              <FaCheckCircle />
              Investment Guides
            </div>

          </ResourceList>

        </EducationText>


        <EducationImage>

          <ParallaxImage
            src={edu}
            alt="TXLA Investment educational resources"
          />

        </EducationImage>

      </Education>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <Section>

        <SectionHeader>

          <span>START TODAY</span>

          <h2>
            Ready to explore TXLA Investment?
          </h2>

          <p>
            Create an account and explore the
            platform built for modern investors.
          </p>

        </SectionHeader>


        <HeroButtons>

          <PrimaryButton
            onClick={() => navigate("/register")}
          >
            Create an Account
            <FaArrowRight />
          </PrimaryButton>


          <SecondaryButton
            onClick={() => navigate("/")}
          >
            Back to Home
          </SecondaryButton>

        </HeroButtons>

      </Section>

    </Wrapper>
  );
};


export default AboutUs;