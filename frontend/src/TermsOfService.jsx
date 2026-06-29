import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { PiUserCircleDashedThin } from "react-icons/pi";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import tesla from "./assets/tesla.png"; // adjust path

const TermsOfService = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <>
      {/* Header */}
      <header className="header1 fixed-header">
        <img src={tesla} alt="Tesla Logo" className="tesla-logo1" loading="lazy"/>
        

        <nav className={menuOpen ? "open" : ""}>
          <ul className="header-title">
            <li onClick={() => navigate("/")}>HOME</li>
            <li onClick={() => navigate("/about")}>ABOUT US</li>
            <li
              onClick={() => {
                navigate("/");
                setTimeout(() => {
                  document
                    .getElementById("FAQ")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 300);
              }}
            >
              FAQ
            </li>
            <li onClick={() => navigate("/contact")}>CONTACT</li>
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

          {/* Mobile Sidebar */}
          {menuOpen && (
            <nav className="mobile-sidebar">
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
              <a
                onClick={() => {
                  navigate("/");
                  setMenuOpen(false);
                  setTimeout(() => {
                    document
                      .getElementById("FAQ")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 300);
                }}
              >
                FAQ
              </a>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </nav>
          )}
        </div>
      </header>

      {/* Page Content */}
      <div className="legal-page">
        <h1>Txla Advisory – Terms & Conditions</h1>
        <p><strong>Effective Date:</strong> 01-20-2025</p>
        <p>
          Welcome to Txla Advisory! By using our services, investing with us, or learning 
          through our programs, you agree to the Terms and Conditions below. 
          Please read them carefully.
        </p>

        <section>
          <h2>💼 What We Do</h2>
          <ul>
            <li>Investment Plans – Example: Invest $500 with a target return of $550 in 5 days.</li>
            <li>Trading & Consulting – Insights into forex, stocks, crypto, metals, and energy markets.</li>
            <li>Education – Training, mentorship, and financial literacy support.</li>
          </ul>
        </section>

        <section>
          <h2>📈 Targeted Returns</h2>
          <p>
            Our investment plans are designed to deliver targeted returns.
            Results may vary depending on market conditions.
            While we aim to meet these targets, profits are not guaranteed.
          </p>
        </section>

        <section>
          <h2>⚠ Risk Reminder</h2>
          <p>
            All investments involve some level of risk.
            You may earn less than expected or, in rare cases, lose part or all of your capital.
            By investing with us, you confirm that you understand and accept these risks.
          </p>
        </section>

        <section>
          <h2>💵 Payments & Payouts</h2>
          <ul>
            <li>Minimum investment: $500 (unless otherwise agreed).</li>
            <li>Payouts are made at the end of the agreed cycle.</li>
            <li>Refunds are not available once a cycle has started, except at our discretion.</li>
          </ul>
        </section>

        <section>
          <h2>👤 Your Responsibilities</h2>
          <p>When working with Txla Advisory, you agree to:</p>
          <ul>
            <li>Provide accurate information when registering.</li>
            <li>Use our services lawfully and responsibly.</li>
            <li>Acknowledge that results depend on real market performance.</li>
          </ul>
        </section>

        <section>
          <h2>📚 Our Materials</h2>
          <p>
            All learning resources, strategies, and trading content are the property 
            of Txla Advisory. Please do not copy, share, or resell them without our permission.
          </p>
        </section>

        <section>
          <h2>🛡 Limitation of Liability</h2>
          <p>
            Txla Advisory is not responsible for market losses, banking delays, or 
            third-party issues beyond our control.
            We are committed to transparency and fairness, but investment outcomes 
            may differ from expectations.
          </p>
        </section>

        <section>
          <h2>🔄 Updates</h2>
          <p>
            We may update these Terms from time to time. If we do, we’ll inform you, 
            and by continuing to use our services, you agree to the latest version.
          </p>
        </section>

        <section>
          <h2>📞 Contact Us</h2>
          <p>If you have questions, reach out to us anytime:</p>
          <p>
            <strong>Txla Advisory</strong><br />
            📧 Email: support@txladvisory.com <br />
            📞 Phone: +1 (317) 618-2969<br />
            {/* 🏢 Address: [Insert Address] */}
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          {/* Logo & About */}
          <div className="footer-brand">
            <img src={tesla} alt="Tesla Logo" className="tesla-logo1" loading="lazy" />
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

        {/* Social Media */}
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} · TXLA Investment. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default TermsOfService;
