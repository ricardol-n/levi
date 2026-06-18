import React, { useState ,useEffect,useRef } from 'react';
import { useNavigate ,useLocation} from 'react-router-dom';
import styled from 'styled-components';
import tesla from './assets/tesla.png';
import { PiUserCircleDashedThin } from "react-icons/pi";
import { FiMenu, FiX } from "react-icons/fi";
import { FaChartPie, FaAward, FaGlobe, FaBuilding, FaHeadset } from "react-icons/fa";
import bg4 from './assets/tesla1.jpg';
import bg5 from './assets/tesla2.jpg';
import axios from "axios";
import netflixLogo from './assets/netflix.png';
import spotifyLogo from './assets/spotify.png';
import teslaLogo from './assets/tesla3.png';
import metaLogo from './assets/facebook.png';
import amazonLogo from './assets/amazon.png';
import googleLogo from './assets/google.png';
import lowfee from './assets/low-prices.png';
import security from './assets/protection.png';
import female from './assets/female.jpg';
import edu from './assets/education.jpg';
import fcsc from './assets/fcsc.png';
import fca from './assets/fca.png';
import iso from './assets/ISO.png';
import data from './assets/data.png';
import conference1 from './assets/conference1.jpeg';
import conference2 from './assets/conference2.jpeg';
import conference3 from './assets/conference3.jpeg';
import conference4 from './assets/conference4.jpeg';
import conference5 from './assets/CTAf.jpeg';
import profile from './assets/profile.jpeg';
import profile1 from './assets/profile1.jpeg';
import profile2 from './assets/profile2.jpeg';
import profile3 from './assets/profile3.jpeg';
import profile4 from './assets/profile4.jpg'; 
import { Link } from "react-router-dom";
import Counter from './Counter';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { motion,useScroll, useTransform, useReducedMotion } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_URL;






const logoMap = {
  NFLX: netflixLogo,
  SPOT: spotifyLogo,
  TSLA: teslaLogo,
  META: metaLogo,
  AMZN: amazonLogo,
  GOOGL: googleLogo,
};


const Wrapper = styled.div`
  min-height: 100vh;
  display: block;
  overflow:hidden;
  background:
    radial-gradient(
      1200px 600px at 10% 10%,
      rgba(34, 197, 94, 0.15),
      transparent 60%
    ),
    radial-gradient(
      900px 500px at 90% 20%,
      rgba(59, 130, 246, 0.12),
      transparent 60%
    ),
    radial-gradient(
      800px 400px at 50% 80%,
      rgba(168, 85, 247, 0.08),
      transparent 60%
    ),
    linear-gradient(
      135deg,
      #0b1020,
      #0f172a,
      #020617
    );

    @media (max-width: 768px) {
      
      background:
        linear-gradient(
          180deg,
          #020617,
          #020617
        );

      }

`;


const LoginButton = styled.button`
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #0c0701ff;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #ff3d33ff;
  }
`;
// 🔹 Fade-in section
const FadeInSection = ({ children, delay = 0 }) => {
  const [isVisible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(element); // Animate only once
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
  ref={ref}
  initial={{ opacity: 0, y: 40 }}
  animate={
    isVisible
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 40 }
  }
  transition={{
    duration: 0.7,
    delay,
    ease: "easeOut"
  }}
>
      {children}
    </motion.div>
  );
};
  /* ===== Scroll Progress Bar ===== */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      className="scroll-bar"
    />
  );
};

/* ===== Mobile-Safe Parallax ===== */
const ParallaxImage = ({ src, alt }) => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const y = shouldReduceMotion
    ? 0
    : useTransform(scrollY, [0, 600], [0, -120]);

  return (
    <motion.img
      src={src}
      alt={alt}
      style={{ y }}
      loading="lazy"
    />
  );
};

/* ===== Magnetic Button ===== */
const MagneticButton = ({ children, ...props }) => {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const move = (e) => {
    if (shouldReduceMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  };

  const reset = () => {
    ref.current.style.transform = "translate(0,0)";
  };

  return (
    <button
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      className="btn-primary magnetic"
      {...props}
    >
      {children}
    </button>
  );
};
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 }
};

const CompanyInfo = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("TSLA"); // default Tesla
  const [openFAQ, setOpenFAQ] = useState(null);
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };
  const [stocks, setStocks] = useState([]); // ✅ define state

  const allowedSymbols = ["NFLX", "SPOT", "TSLA", "META", "AMZN", "GOOGL"];

  const safeSymbol = allowedSymbols.includes(selectedSymbol)
  ? selectedSymbol
  : "TSLA";

 
 const fetchData = async () => {
  console.log("🌍 Using API base:", API_BASE_URL);
  setLoading(true);

  try {
    const { data } = await axios.get(`${API_BASE_URL}/stocks`);

    console.log("✅ Raw stock data:", data);

    const stocksArray = Array.isArray(data)
      ? data
      : Array.isArray(data.data)
      ? data.data
      : Object.values(data || {});

    setStocks(stocksArray);

  } catch (error) {
    console.error("❌ Error fetching stock data:", error.message);
    setStocks([]);
  } finally {
    setLoading(false);
  }
};



useEffect(() => {
  fetchData();

  let interval = setInterval(fetchData, 60000);

  const handleVisibility = () => {
    if (document.hidden) {
      clearInterval(interval);
    } else {
      fetchData();
      interval = setInterval(fetchData, 60000);
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);

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
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  
  

 
  
  return (
  
    <Wrapper>
     <ScrollProgress />

      <header className="header1">
        <img src={tesla} alt="Tesla Logo" className="tesla-logo1" />

        <nav className={menuOpen ? "open" : ""}>
          <ul className="header-title">
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/about">ABOUT US</Link></li>
            <li onClick={() => {document.getElementById("FAQ")?.scrollIntoView({ behavior: "smooth" });
              }}>FAQ</li>
            <li><Link to="/contact">CONTACT</Link></li>
          </ul>
        </nav>
        

        <div className="icons">
          <PiUserCircleDashedThin
            className="piuser"
            size={28}
            onClick={() => navigate('/login')}
            title="User Login"
          />
            {/* Mobile Menu Toggle */}
          <div className="mobile-menu-icon" onClick={() => setMenuOpen(prev => !prev)} aria-label="Toggle menu" role="button" tabIndex={0}>
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </div>
        </div>

        {/* overlay (click outside to close) */}
        <div
          className={`mobile-overlay ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}/>

          
      </header>
     <FadeInSection delay={0.4}>
      <section className="tesla">
        <div className="tesla-text">
        <motion.h1
          className="gradient-text"
          initial={{ backgroundPosition: "0%" }}
          animate={{ backgroundPosition: "100%" }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Trade CFDs on FX, Stocks and more with a leading global broker
        </motion.h1>

          <h4>Discover over 5,800 stocks, ETFs and REITs on one brokerage</h4>
          <p>
            More investment options. More opportunities to grow.
            Trade stocks or make long-term investments on the same platform.
          </p>
          <MagneticButton onClick={() => navigate('/register')}>
            Create An Account
          </MagneticButton>

        </div>
        <div className="tesla-img">
          <img src={bg4} alt="Tesla" />
        </div>
      </section>

      <section className='tesla1'>
        <div className="tesla-img1">
            <img src={bg5} alt="" />
        </div>
        <div className="tesla-text1">
            <h1>Take That Step</h1>
            <p>With TXLA Investment you get a transparent pricing structure and a secure and regulated trading environment. As an active trader, you can also qualify for lower fees and extra benefits.</p>
            <div className="tesla-ul" >
              <FadeInSection delay={0.4}>
                <ul>
                    <li >Access to US investments</li>
                    <li >Commission- free stock trades</li>
                    <li >Trade flexibility</li> 
                    <li >Trade flexibility</li>
                    <li >Local deposit methods</li>
                    <li >Seamless US Dollar conversion</li>
                </ul>
              </FadeInSection>
        </div>
        </div>
      </section>
      </FadeInSection>
      
       <section className='tesla2'>
        <div className="invest-text">
                <p>Get started with TXLA Investment</p>
                <h1>Discover Top-Performing Stocks</h1>

        </div>
          <motion.div className="invest" variants={containerVariants} initial="hidden" whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          >
  {loading ? (
    <p style={{ textAlign: "center", color: "#ccc" }}>Loading stock data...</p>
  ) : stocks.length === 0 ? (
    <p style={{ textAlign: "center", color: "#f66" }}>No stocks available</p>
  ) : (
    stocks.map(stock => (
      <motion.div
        key={stock.symbol || stock.name}
        className="invest-card"
        variants={itemVariants}
        whileHover={{ scale: 1.03 }}
        onClick={() => setSelectedSymbol(stock.symbol)}
      >
        <img
         src={logoMap[stock.symbol]}
          alt={stock.name}
          className="stock-logo"
        />
        <p className="NFLX">{stock.name || "Unknown"}</p>
        <p className="NFL">{stock.symbol || "?"}</p>
        <p className="price">
          {stock.price ? (
            `$${Number(stock.price).toFixed(2)}`
          ) : (
            <span className="loading-spinner"></span>
          )}
        </p>
      </motion.div>
    ))
  )}
          </motion.div>

    
            <div className="Trending">
            <h1>Trending Stocks</h1>
            <p>Discover the most popular Stocks available on TXLA Investment</p>
            <div style={{ width: "100%", height: "500px" }}>
              <iframe
                key={selectedSymbol} // 🔑 ensures iframe reloads on symbol change
                src={`https://s.tradingview.com/widgetembed/?symbol=${safeSymbol}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowTransparency={true}
                scrolling="no"
              ></iframe>
            </div>

        </div>
      </section>
      


      <section id="about-us" className="why-choose">
            <div className="why-choose-header">
              <h1>Why Choose TXLA Investment</h1>
              <p>
                TXLA Investment is specially designed to help you start investing easily,
                with powerful tools, competitive pricing, and award-winning customer support.
              </p>
            </div>

            <FadeInSection delay={0.2}>

            <div className= "why-choose-grid" >
              <motion.div className="why-card glass"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 200 }}
              >
                <FaChartPie size={50} color="#FFD700" />
                <h2>Fractional Shares</h2>
                <p>Own a piece of even the most expensive US shares. Start from $1,000.</p>
              </motion.div>

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
            </FadeInSection>
      </section>

    
      <section className='security fixed-sec' >
          <div className="sec-info">

            <FadeInSection delay={0.1}>
            <div className="security-img img"> <img  src={female} alt="Security Illustration" /> </div>
            </FadeInSection>

              <div>
              <FadeInSection delay={0.2}>
              <div className="security-text">
                <h1>Our Security Measures</h1>
                <p>When placing your money with a broker, you need to make sure your broker is secure and can endure through good and bad times. Our strong capital position, conservative balance sheet and automated risk controls are designed to protect Txla Investment and our clients from large trading losses.</p>  
              </div>
              </FadeInSection>

              <FadeInSection delay={0.4}>
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
                </FadeInSection>

              </div>
            </div>

            <FadeInSection delay={0.5}>
            <div className="fca">
             
                  <div className="fca-auth">
                     <motion.div 
                     animate={{ y: [0, -6, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                    <img src={fca} alt="" />
                    {/* <h1>FCA authorised</h1> */}
                    <p>We are authorised and regulated by the FCA.</p>
                    </motion.div>
                  </div>


                  <div className="fca-auth">
                  <motion.div 
                     animate={{ y: [0, -6, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                    <img src={fcsc} alt="" />
                    {/* <h1>FSCS protected</h1> */}
                    <p>Your funds are protected by the FSCS scheme up to $85,000.</p>
                    </motion.div>
                  </div>

                 

                  <div className="fca-auth">
                    <motion.div 
                     animate={{ y: [0, -6, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                    <img src={iso} alt="" />
                    {/* <h1>Account Security Standard</h1> */}
                    <p>Password protection with Bcrypt hashing algorithm.</p>
                    </motion.div>
                  </div>


                  <motion.div 
                     animate={{ y: [0, -6, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                  <div className="fca-auth">
                    
                    <img src={data} alt="" />
                    
                    <p>We follow industry best practices to protect your data at all times.</p>

                  </div>
                   </motion.div>
            </div>
            </FadeInSection>
      </section>
      

        <section className="stats-section">
      <motion.div className="stat-card glass"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <h2>
          <Counter end={5000} duration={3000} />+</h2>
        <p>Active Users</p>
      </motion.div>

      <motion.div className="stat-card" 
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <h2>
          <Counter end={1200000} duration={4000} prefix="$" />
        </h2>
        <p>Total Investments</p>
      </motion.div>

      <motion.div 
      className="stat-card"animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} >
        <h2>
          <Counter end={98} duration={2000} suffix="%" />
        </h2>
        <p>Customer Satisfaction</p>
      </motion.div>
    </section>

    <section className='tesla1 edu-res1' id='edu' >

        <div className="edu-res">
            <h1>Educational Resources</h1>
            <p>Even the most experienced traders or investors need to keep learning to stay ahead. Txla Investment provides several resources to help you better understand Txla Investment products and services, markets and technology.</p>
            <div className="tesla-ul" >
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
            <img src={edu} alt="Tesla " />
        </div>

      </section>
 <section className="trustpilot-section">
  <div className="trustpilot-header">
    <span className="trustpilot-badge">★★★★★ Investor Reviews</span>

    <h1 className="trustpilot-title">
      Trusted by Investors Worldwide
    </h1>

    <p className="trustpilot-subtitle">
      Discover how investors are growing their portfolios with TXLA Investment
      while participating in our global investment conferences and networking events.
    </p>
  </div>

  <div className="trustpilot-slider">
    <div className="trustpilot-track">

      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile} alt="James Richardson" />
          <div>
            <h3>Maria Richardson</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          Consistent growth and reliable withdrawals
        </p>

        <p>
          I joined TXLA Investment in early 2024 and started with
          a portfolio of $8,500. The platform is easy to use,
          performance tracking is transparent, and withdrawals
          have always been processed efficiently. It's one of the
          most professional investment experiences I've had.
        </p>

        <small>Reviewed on August 12, 2025</small>
      </div>

      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile4} alt="Daniel Roberts" />
          <div>
            <h3>Daniel Roberts</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          Excellent platform for portfolio management
        </p>

        <p>
          What stands out most is the simplicity of the dashboard.
          Everything from deposits to monitoring performance is
          straightforward. Customer support has been responsive,
          and the overall experience has exceeded expectations.
        </p>

        <small>Reviewed on September 4, 2025</small>
      </div>

       {/* CONFERENCE */}
      <div className="conference-slide">
        <img src={conference5} alt="Investor Leadership Forum" />
      </div>



      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile1} alt="Jennifer Cole" />
          <div>
            <h3>Jennifer Cole</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          Perfect for new investors
        </p>

        <p>
          I started with a modest investment and gradually built
          confidence through the educational resources available.
          The platform helped me understand portfolio diversification
          and long-term investing.
        </p>

        <small>Reviewed on October 19, 2025</small>
      </div>

      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile2} alt="Michael Adams" />
          <div>
            <h3>Michael Adams</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          Professional support team
        </p>

        <p>
          The customer service team deserves recognition.
          Every question I've had has been answered promptly.
          Combined with the investment tools available,
          the experience has been excellent from day one.
        </p>

        <small>Reviewed on November 7, 2025</small>
      </div>

      {/* CONFERENCE */}
      <div className="conference-slide">
        <img src={conference2} alt="Annual Investment Summit" />
        <div className="conference-overlay">
          <h3>Annual Investment Summit</h3>
          <p>Future Trends & Wealth Building</p>
        </div>
      </div>

      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile3} alt="Sarah Mitchell" />
          <div>
            <h3>Larry Quintero</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          A platform I confidently recommend
        </p>

        <p>
          I've been investing for several years and TXLA Investment
          has become one of my preferred platforms. The user
          experience, account security, and portfolio tools make
          it easy to manage investments efficiently.
        </p>

        <small>Reviewed on December 3, 2025</small>
      </div>

      {/* CONFERENCE */}
      <div className="conference-slide">
        <img src={conference1} alt="Global Wealth Conference" />
        <div className="conference-overlay">
          <h3>Global Wealth Conference</h3>
          <p>Building the Future of Investing</p>
        </div>
      </div>

      <div className="conference-slide">
        <img src={conference3} alt="TXLA Global Investment Summit" />
        <div className="conference-overlay">
          <h3>TXLA Global Investment Summit</h3>
          <p>Dubai • Investor Networking Event</p>
        </div>
      </div> 
           {/* CONFERENCE */}
      <div className="conference-slide">
        <img src={conference4} alt="London Investors Conference" />
        <div className="conference-overlay">
          <h3>London Investors Conference</h3>
          <p>Investment Strategies & Market Insights</p>
        </div>
      </div>


       {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile} alt="James Richardson" />
          <div>
            <h3>Maria Richardson</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          Consistent growth and reliable withdrawals
        </p>

        <p>
          I joined TXLA Investment in early 2024 and started with
          a portfolio of $8,500. The platform is easy to use,
          performance tracking is transparent, and withdrawals
          have always been processed efficiently. It's one of the
          most professional investment experiences I've had.
        </p>

        <small>Reviewed on August 12, 2025</small>
      </div>

      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile4} alt="Daniel Roberts" />
          <div>
            <h3>Daniel Roberts</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          Excellent platform for portfolio management
        </p>

        <p>
          What stands out most is the simplicity of the dashboard.
          Everything from deposits to monitoring performance is
          straightforward. Customer support has been responsive,
          and the overall experience has exceeded expectations.
        </p>

        <small>Reviewed on September 4, 2025</small>
      </div>

       {/* CONFERENCE */}
      <div className="conference-slide">
        <img src={conference5} alt="Investor Leadership Forum" />
      </div>



      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile1} alt="Jennifer Cole" />
          <div>
            <h3>Jennifer Cole</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          Perfect for new investors
        </p>

        <p>
          I started with a modest investment and gradually built
          confidence through the educational resources available.
          The platform helped me understand portfolio diversification
          and long-term investing.
        </p>

        <small>Reviewed on October 19, 2025</small>
      </div>

      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile2} alt="Michael Adams" />
          <div>
            <h3>Michael Adams</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          Professional support team
        </p>

        <p>
          The customer service team deserves recognition.
          Every question I've had has been answered promptly.
          Combined with the investment tools available,
          the experience has been excellent from day one.
        </p>

        <small>Reviewed on November 7, 2025</small>
      </div>

      {/* CONFERENCE */}
      <div className="conference-slide">
        <img src={conference2} alt="Annual Investment Summit" />
        <div className="conference-overlay">
          <h3>Annual Investment Summit</h3>
          <p>Future Trends & Wealth Building</p>
        </div>
      </div>

      {/* REVIEW */}
      <div className="trust-card">
        <div className="trust-header">
          <img src={profile3} alt="Sarah Mitchell" />
          <div>
            <h3>Larry Quintero</h3>
            <span>✔ Verified Investor</span>
          </div>
        </div>

        <div className="stars">★★★★★</div>

        <p className="review-title">
          A platform I confidently recommend
        </p>

        <p>
          I've been investing for several years and TXLA Investment
          has become one of my preferred platforms. The user
          experience, account security, and portfolio tools make
          it easy to manage investments efficiently.
        </p>

        <small>Reviewed on December 3, 2025</small>
      </div>

      {/* CONFERENCE */}
      <div className="conference-slide">
        <img src={conference1} alt="Global Wealth Conference" />
        <div className="conference-overlay">
          <h3>Global Wealth Conference</h3>
          <p>Building the Future of Investing</p>
        </div>
      </div>

      <div className="conference-slide">
        <img src={conference3} alt="TXLA Global Investment Summit" />
        <div className="conference-overlay">
          <h3>TXLA Global Investment Summit</h3>
          <p>Dubai • Investor Networking Event</p>
        </div>
      </div> 
           {/* CONFERENCE */}
      <div className="conference-slide">
        <img src={conference4} alt="London Investors Conference" />
        <div className="conference-overlay">
          <h3>London Investors Conference</h3>
          <p>Investment Strategies & Market Insights</p>
        </div>
      </div>




    </div>
    

  </div>
</section>

<div className ="InvestTrading" id="FAQ">
            <div className="InvestTrad">
                <h1>Investing and Trading in Stocks</h1>
                <p>Stock trading has been a popular financial pursuit since stocks were first introduced by the Dutch East India Company in the 17th century. This is both an efficient and effective type of investment for both families and individuals.</p>
            </div>

            <div className="InvestTrad1">
                <ul >
                    <li> <button
          onClick={() => toggleFAQ(0)}
          aria-expanded={openFAQ === 0}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          What Are Stocks
        </button>
                    {openFAQ === 0 && (
                        <motion.ul className="dropdown open"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <li >
                                <p>Stocks, also commonly referred to as equities or shares, are issued by a public corporation and put up for sale. Companies originally used stocks as a way of raising additional capital, and as a way to boost their business growth. When the company first puts these stocks up for sale, this is called the Initial Public Offering. Once this stage is complete, the shares themselves are then sold on the stock market, which is where any stock trading will occur.

                            People occasionally confuse buying shares with physically owning a portion of that company as if this somehow gives them the right to walk into the company offices and begin exerting their ownership rights over computers or furniture. The law treats this type of corporation in a unique way; as it is treated as a legal person, the corporation, therefore, owns its own assets. 
                            This is referred to as the separation of ownership and control.
                            The separation of these things is beneficial to both the shareholders and the corporation because it limits the liability for each party. For example, if a major shareholder were to go bankrupt, they cannot then sell assets belonging to the corporation to cover their debts and pay their creditors. This is the same in reverse; if a corporation you own shares in goes bankrupt and the judge orders them to sell all their assets, none of your own personal assets are at risk.
                            One thing lies at the core of a stock’s value: it entitles shareholders to a portion of the company profits.</p>  

    
                            </li>

                        </motion.ul>
                    )}

                    </li>
                </ul>
                <ul >
                    <li>  <button
          onClick={() => toggleFAQ(1)}
          aria-expanded={openFAQ === 1}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          How Do I Trade Stocks
        </button>
                    {openFAQ === 1 && (
                        <ul className="dropdown open">
                            <li>
                                <p>A stock market is where stocks are traded: where sellers and buyers come to agree on a price. Historically, stock exchanges existed in a physical location, and all transactions took place on the trading floor. One of the world’s most famous stock markets is the London Stock Exchange (LSE).
                                Yet as technology progresses, so does the stock market. Now we are seeing the rise of virtual stock exchanges that are made up of large computer networks will all trades performed electronically.
                                A company’s shares can be traded on the stock market only following its IPO, making this a secondary market. The large businesses listed on global stock exchanges do not trade stocks on a frequent basis. Stocks can only be purchased from an existing shareholder, not directly from the company. This rule also applies in reverse, so when selling your shares, they go to another investor, not back to the corporation.
                                The reason traders choose to invest in stock is because the perceived value of a company can vary greatly over time. Money can be made or lost; it depends on whether the trader’s perceptions of the stock value are in line with the market. 
                                Trying to predict the price movements of stocks in the short term is nearly impossible. Generally, stocks do tend to appreciate in value in the long term, so many investors choose to have a diverse portfolio of stocks that they intend to keep for a long time. Bigger companies pay dividends to their shareholders, which is a portion of the company’s profits. The value of the share itself will not impact the dividend.
                                In order to trade stocks, there must be a seller and a buyer; as not all traders have the same agenda, stocks are bought and sold at different times and for different reasons. Someone may sell their stock for profit, others sell it in order to cut losses, and some because they believe the value of the stock is about to change either way.</p>

                            </li>

                        </ul>
                    )}
                    </li>
                </ul>

                <ul >
                    <li>  <button
          onClick={() => toggleFAQ(2)}
          aria-expanded={openFAQ === 2}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Stock Trading Risk Assessment
        </button>
                    {openFAQ === 2 && (
                        <ul className="dropdown open">
                            <li >
                                <p>All forms of financial investment carry a level of risk, and stock trading is no different. Even traders with decades of experience cannot predict the correct price movements every single time. 
                                "People use various strategies, but it is important to note that there is no such thing as a failsafe strategy. It is also advisable to limit the amount of money you invest in a single trade, as part of your own risk management".</p>
                            </li>
                        </ul>
                       )}
                    </li>
                </ul>
              </div>
        </div>
      <footer className="footer">
      <div className="footer-container">
        {/* Logo & About */}
        <div className="footer-brand">
           <img src={tesla} alt="Tesla Logo" className="tesla-logo1" />
          <p>
            Invest and grow your financial assets with our TXLA Investment.
          </p>
        </div>

        {/* Links */}
        <div className="footer-links">
          {/* Company */}
          <div className="footer-column">
            <h3 onClick={() => toggleDropdown(1)}>
              Company <span>{openDropdown === 1 ? "−" : "+"}</span>
            </h3>
            <ul className={openDropdown === 1 ? "show" : ""}>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer-column">
            <h3 onClick={() => toggleDropdown(2)}>
              Account <span>{openDropdown === 2 ? "−" : "+"}</span>
            </h3>
            <ul className={openDropdown === 2 ? "show" : ""}>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-column">
            <h3 onClick={() => toggleDropdown(3)}>
              Legal <span>{openDropdown === 3 ? "−" : "+"}</span>
            </h3>
            <ul className={openDropdown === 3 ? "show" : ""}>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-social">
        <p style={{ marginTop: "5px", fontSize: "0.8rem" }}>
  Admin? <span 
    style={{ color: "#ff3d33", cursor: "pointer", textDecoration: "underline" }} 
    onClick={() => navigate('/admin/login')}
  >
    Login here
  </span>
</p>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaTwitter />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <FaLinkedinIn />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} · TXLA Investment. All Rights Reserved.</p>
      </div>
    </footer>
    </Wrapper>
  
  );
};

export default CompanyInfo;
