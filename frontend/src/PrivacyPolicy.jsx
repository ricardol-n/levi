import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { PiUserCircleDashedThin } from "react-icons/pi";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import tesla from "./assets/tesla.png"; // adjust path

const PrivacyPolicy = () => {
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
        <h1>Txla Advisory – Privacy Policy</h1>
        <p><strong>Effective Date:</strong> 01-20-2025</p>
        <p>
          At Txla Advisory, we respect your privacy and are committed to
          protecting your personal data. This policy explains how we collect,
          use, and safeguard your information.
        </p>

        <section>
          <h2>📊 Information We Collect</h2>
          <ul>
            <li>Personal details such as name, email, phone number, and address.</li>
            <li>Financial information required for investments and payouts.</li>
            <li>Usage data, including how you interact with our website and services.</li>
          </ul>
        </section>

        <section>
          <h2>🔍 How We Use Your Information</h2>
          <ul>
            <li>To provide investment and educational services.</li>
            <li>To communicate updates, offers, and support.</li>
            <li>To comply with legal and regulatory requirements.</li>
          </ul>
        </section>

        <section>
          <h2>🛡 Data Protection</h2>
          <p>
            We use industry-standard security practices, including encryption and 
            secure servers, to safeguard your personal data from unauthorized access.
          </p>
        </section>

        <section>
          <h2>🤝 Sharing of Information</h2>
          <p>
            Txla Advisory does not sell or rent your personal information. We may
            share it with trusted third parties (e.g., payment processors or regulators) 
            strictly for service delivery and compliance purposes.
          </p>
        </section>

        <section>
          <h2>🔄 Your Rights</h2>
          <ul>
            <li>Access, correct, or delete your personal data.</li>
            <li>Withdraw consent for marketing communications.</li>
            <li>Request details of how your information is used.</li>
          </ul>
        </section>

        <section>
          <h2>📞 Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, reach out anytime:
          </p>
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

export default PrivacyPolicy;
