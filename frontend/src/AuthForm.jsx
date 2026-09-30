import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { FiArrowLeft } from "react-icons/fi";
import bg1 from "./assets/world.jpg";
import logo from "./assets/tesla.png";
import { AuthContext } from "./context/AuthContext";
import MarketBackground from "./MarketBackground";

/* =========================================================
   PAGE
========================================================= */

const RegisterContainer = styled.div`
  position: relative;

  min-height: 100vh;
  width: 100%;

  overflow-x: hidden;
  overflow-y: auto;

  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(460px, 500px);

  background:
    radial-gradient(
      1200px 600px at 10% 10%,
      rgba(34, 197, 94, 0.08),
      transparent 60%
    ),
    radial-gradient(
      900px 500px at 90% 20%,
      rgba(59, 130, 246, 0.08),
      transparent 60%
    ),
    linear-gradient(
      135deg,
      #020617,
      #0f172a,
      #111827
    );

  @media (max-width: 1024px) {
    display: block;
    min-height: 100vh;
  }
`;

/* =========================================================
   DESKTOP MARKET BACKGROUND
========================================================= */

const DesktopMarketBackground = styled.div`
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  z-index: 0;

  pointer-events: none;

  overflow: hidden;
  opacity: 1;
  display: block;

  @media (max-width: 1024px) {
    display: none;
  }
`;

/* =========================================================
   LEFT / HERO
========================================================= */

const LeftPanel = styled.div`
  position: relative;

  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;

  min-width: 0;

  padding: 60px;

  @media (max-width: 1200px) {
    padding: 40px;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  height: 420px;

  object-fit: cover;

  border-radius: 24px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4);
`;

const HeroContent = styled.div`
  margin-top: 40px;
`;

const Brand = styled.div`
  text-align: center;

  color: #22c55e;

  font-size: 14px;
  font-weight: 700;

  letter-spacing: 2px;

  text-transform: uppercase;

  margin-bottom: 16px;
`;

const HeroTitle = styled.h1`
  color: white;

  font-size: clamp(36px, 4vw, 48px);

  line-height: 1.1;

  margin: 16px 0;
`;

const HeroText = styled.p`
  color: #94a3b8;

  font-size: 18px;

  line-height: 1.7;

  max-width: 600px;
`;

const FeatureGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 15px;

  margin-top: 30px;
`;

const FeatureCard = styled.div`
  background: rgba(15, 23, 42, 0.7);

  border: 1px solid rgba(255, 255, 255, 0.06);

  padding: 18px;

  border-radius: 16px;

  color: #e2e8f0;

  font-weight: 500;
`;

/* =========================================================
   RIGHT PANEL
========================================================= */

const RightPanel = styled.div`
  position: relative;

  z-index: 2;

  display: flex;

  justify-content: center;
  align-items: center;

  width: 100%;
  min-width: 0;

  box-sizing: border-box;

  padding: 40px;

  @media (max-width: 1024px) {
    min-height: 100vh;

    align-items: flex-start;

    padding: 76px 20px 30px;
  }

  @media (max-width: 600px) {
    padding: 68px 14px 24px;
  }

  @media (max-width: 425px) {
    padding: 64px 10px 20px;
  }

  @media (max-width: 375px) {
    padding: 60px 8px 18px;
  }

  @media (max-width: 320px) {
    padding: 56px 6px 16px;
  }
`;

/* =========================================================
   FORM
========================================================= */

const FormWrapper = styled.div`
  position: relative;

  width: 100%;

  max-width: 460px;

  box-sizing: border-box;

  background: rgba(15, 23, 42, 0.92);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border: 1px solid rgba(201, 162, 39, 0.35);

  border-radius: 24px;

  padding: 40px;

  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.35),
    0 0 40px rgba(201, 162, 39, 0.04);

  overflow: hidden;

  @media (max-width: 600px) {
    max-width: 500px;

    padding: 28px 22px;

    border-radius: 20px;
  }

  @media (max-width: 425px) {
    padding: 24px 18px;

    border-radius: 18px;
  }

  @media (max-width: 375px) {
    padding: 22px 15px;

    border-radius: 16px;
  }

  @media (max-width: 320px) {
    padding: 20px 12px;

    border-radius: 14px;
  }
`;

/* =========================================================
   MOBILE MARKET SECTION
========================================================= */

const MobileMarketSection = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: block;

    position: relative;

    width: 100%;

    height: 150px;

    margin-bottom: 24px;

    overflow: hidden;

    border-radius: 16px;

    border: 1px solid rgba(201, 162, 39, 0.28);

    background:
      linear-gradient(
        135deg,
        rgba(15, 23, 42, 0.92),
        rgba(2, 6, 23, 0.96)
      );

    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 12px 30px rgba(0, 0, 0, 0.22);
  }

  @media (max-width: 600px) {
    height: 138px;

    margin-bottom: 22px;

    border-radius: 14px;
  }

  @media (max-width: 425px) {
    height: 128px;

    margin-bottom: 20px;

    border-radius: 13px;
  }

  @media (max-width: 375px) {
    height: 120px;

    margin-bottom: 18px;
  }

  @media (max-width: 320px) {
    height: 112px;

    margin-bottom: 16px;
  }
`;

const MobileMarketChart = styled.div`
  position: absolute;

  inset: 0;

  z-index: 0;

  opacity: 0.85;
`;

const MobileMarketShade = styled.div`
  position: absolute;

  inset: 0;

  z-index: 1;

  pointer-events: none;

  background:
    linear-gradient(
      90deg,
      rgba(2, 6, 23, 0.82) 0%,
      rgba(2, 6, 23, 0.3) 45%,
      rgba(2, 6, 23, 0.45) 100%
    );
`;

const MarketHeader = styled.div`
  position: absolute;

  top: 12px;
  left: 14px;
  right: 14px;

  z-index: 3;

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  pointer-events: none;
`;

const MarketInfo = styled.div`
  display: flex;

  flex-direction: column;

  gap: 2px;
`;

const MarketSymbol = styled.div`
  color: #ef4444;

  font-size: 16px;

  font-weight: 800;

  letter-spacing: 0.8px;

  text-shadow: 0 0 10px rgba(239, 68, 68, 0.25);
`;

const MarketName = styled.div`
  color: rgba(148, 163, 184, 0.9);

  font-size: 10px;

  letter-spacing: 0.5px;
`;

const LiveIndicator = styled.div`
  display: inline-flex;

  align-items: center;

  gap: 6px;

  padding: 5px 8px;

  border-radius: 999px;

  background: rgba(34, 197, 94, 0.1);

  border: 1px solid rgba(34, 197, 94, 0.25);

  color: #86efac;

  font-size: 9px;

  font-weight: 800;

  letter-spacing: 0.8px;
`;

const LiveDot = styled.span`
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 8px rgba(34, 197, 94, 0.8);

  animation: livePulse 1.6s ease-in-out infinite;

  @keyframes livePulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }

    50% {
      opacity: 0.45;
      transform: scale(0.75);
    }
  }
`;

const MarketFooter = styled.div`
  position: absolute;

  bottom: 9px;
  left: 14px;
  right: 14px;

  z-index: 3;

  display: flex;

  justify-content: space-between;

  pointer-events: none;

  color: rgba(148, 163, 184, 0.65);

  font-size: 9px;

  letter-spacing: 0.3px;
`;

/* =========================================================
   TITLES
========================================================= */

const Title = styled.h2`
  color: white;

  font-size: 32px;

  font-weight: 700;

  text-align: center;

  margin: 0 0 10px;

  line-height: 1.15;

  @media (max-width: 425px) {
    font-size: 27px;
  }

  @media (max-width: 375px) {
    font-size: 25px;
  }

  @media (max-width: 320px) {
    font-size: 23px;
  }
`;

const Subtitle = styled.p`
  color: #94a3b8;

  text-align: center;

  font-size: 15px;

  line-height: 1.7;

  margin: 0 auto 28px;

  max-width: 360px;

  @media (max-width: 425px) {
    font-size: 13px;

    line-height: 1.6;

    margin-bottom: 22px;
  }

  @media (max-width: 320px) {
    font-size: 12px;

    margin-bottom: 18px;
  }
`;

/* =========================================================
   INPUTS
========================================================= */

const Input = styled.input`
  display: block;

  width: 100%;

  height: 54px;

  box-sizing: border-box;

  border-radius: 12px;

  border: 1px solid #334155;

  background: #111827;

  color: #fff;

  padding: 0 16px;

  font-size: 15px;

  margin-bottom: 16px;

  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;

  &:focus {
    outline: none;

    border-color: #2563eb;

    background: #0f172a;

    box-shadow:
      0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  &::placeholder {
    color: #64748b;
  }

  @media (max-width: 425px) {
    height: 51px;

    font-size: 14px;

    padding: 0 13px;

    border-radius: 10px;

    margin-bottom: 13px;
  }

  @media (max-width: 375px) {
    height: 49px;

    font-size: 13px;

    padding: 0 12px;
  }

  @media (max-width: 320px) {
    height: 47px;

    font-size: 12px;

    padding: 0 10px;
  }
`;

/* =========================================================
   BUTTON
========================================================= */

const Button = styled.button`
  display: block;

  width: 100%;

  height: 54px;

  box-sizing: border-box;

  border: none;

  border-radius: 12px;

  background: #0860289e;

  color: #c9a227;

  font-size: 15px;

  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.25s ease,
    transform 0.2s ease,
    box-shadow 0.25s ease;

  &:hover {
    background: #22c55eaa;

    box-shadow:
      0 8px 24px rgba(34, 197, 94, 0.12);
  }

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.7;

    cursor: not-allowed;
  }

  @media (max-width: 425px) {
    height: 51px;

    font-size: 14px;

    border-radius: 10px;
  }

  @media (max-width: 320px) {
    height: 48px;

    font-size: 13px;
  }
`;

/* =========================================================
   MESSAGE
========================================================= */

const Message = styled.div`
  padding: 13px 14px;

  border-radius: 10px;

  margin-bottom: 18px;

  font-size: 13px;

  line-height: 1.5;

  text-align: center;

  background: ${(props) =>
    props.type === "error"
      ? "rgba(239,68,68,.10)"
      : "rgba(34,197,94,.10)"};

  color: ${(props) =>
    props.type === "error"
      ? "#fca5a5"
      : "#86efac"};

  border: 1px solid
    ${(props) =>
      props.type === "error"
        ? "rgba(239,68,68,.20)"
        : "rgba(34,197,94,.20)"};
`;

/* =========================================================
   SECURITY
========================================================= */

const SecurityBar = styled.div`
  display: flex;

  gap: 7px;

  justify-content: center;

  margin-bottom: 22px;

  flex-wrap: wrap;
`;

const SecurityItem = styled.div`
  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.08);

  color: #cbd5e1;

  padding: 7px 10px;

  border-radius: 999px;

  font-size: 10px;

  white-space: nowrap;

  @media (max-width: 425px) {
    font-size: 9px;

    padding: 6px 8px;
  }
`;

/* =========================================================
   LOGO
========================================================= */

const LogoSection = styled.div`
  text-align: center;

  margin-bottom: 24px;

  @media (max-width: 425px) {
    margin-bottom: 20px;
  }
`;

const Logo = styled.img`
  width: 60px;

  height: 60px;

  object-fit: contain;

  margin-bottom: 12px;

  @media (max-width: 425px) {
    width: 50px;

    height: 50px;

    margin-bottom: 9px;
  }
`;

const CompanyName = styled.div`
  color: white;

  font-size: 24px;

  font-weight: 700;

  letter-spacing: 0.5px;

  @media (max-width: 425px) {
    font-size: 21px;
  }
`;

const CompanyTagline = styled.div`
  color: #64748b;

  font-size: 13px;

  margin-top: 4px;

  @media (max-width: 425px) {
    font-size: 11px;
  }
`;

/* =========================================================
   BACK BUTTON
========================================================= */

const BackButton = styled.button`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;

  width: 35px;
  height: 25px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(201, 162, 39, 0.35);
  border-radius: 14px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.02)
    ),
    rgba(15, 23, 42, 0.72);

  color: #c9a227;

  cursor: pointer;

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);

  transition: all 0.25s ease;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 1.8;
  }

  &:hover {
    color: #f5d76e;
    border-color: rgba(201, 162, 39, 0.7);

    background:
      linear-gradient(
        145deg,
        rgba(201, 162, 39, 0.16),
        rgba(255, 255, 255, 0.04)
      ),
      rgba(15, 23, 42, 0.88);

    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.35),
      0 0 18px rgba(201, 162, 39, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);

    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0) scale(0.96);
  }

  @media (max-width: 425px) {
    top: 12px;
    left: 12px;
    width: 35px;
    height: 25px;
    border-radius: 12px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 320px) {
    top: 8px;
    left: 8px;
    width: 35px;
    height: 25px;
    border-radius: 10px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

/* =========================================================
   FORGOT PASSWORD
========================================================= */

const ForgotPasswordButton = styled.button`
  border: none;

  background: none;

  color: #c9a227;

  font-size: 11px;

  font-weight: 600;

  cursor: pointer;

  padding: 0;

  transition: color 0.2s ease;

  &:hover {
    color: #f5d76e;
  }
`;

const ForgotPasswordRow = styled.div`
  display: flex;

  justify-content: flex-end;

  margin-top: -5px;

  margin-bottom: 16px;
`;

/* =========================================================
   API
========================================================= */

const API_BASE =
  import.meta.env.VITE_API_URL || "/api";

/* =========================================================
   AUTH FORM
========================================================= */

const AuthForm = ({ type }) => {
  const isLogin =
    type === "login" ||
    type === "adminLogin";

  const isAdmin =
    type === "adminLogin" ||
    type === "adminRegister";

  const queryParams =
    new URLSearchParams(window.location.search);

  const referralCode =
    queryParams.get("ref");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState(null);

  const [showOTP, setShowOTP] =
    useState(false);

  const [otp, setOtp] =
    useState("");

  const [pendingUserId, setPendingUserId] =
    useState(null);

  const navigate = useNavigate();

  const {
    login,
    register,
    verify2FALogin,
  } = useContext(AuthContext);

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      (
        !isLogin &&
        (
          !formData.username ||
          !formData.phone
        )
      )
    ) {
      setMessage({
        type: "error",
        text: "All fields are required.",
      });

      return false;
    }

    if (
      !isLogin &&
      formData.password.length < 6
    ) {
      setMessage({
        type: "error",
        text:
          "Password must be at least 6 characters.",
      });

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage(null);

    if (
      !showOTP &&
      !validateForm()
    ) {
      return;
    }

    setLoading(true);

    try {
      /* =====================================================
         LOGIN
      ===================================================== */

      if (isLogin) {
        /* 2FA STEP */

        if (showOTP) {
          const res =
            await verify2FALogin(
              pendingUserId,
              otp
            );

          if (res.success) {
            navigate(res.redirectTo);
          } else {
            setMessage({
              type: "error",
              text: res.message,
            });
          }

          return;
        }

        /* LOGIN STEP */

        const res =
          await login(
            formData.email,
            formData.password,
            isAdmin
          );

        if (res.requires2FA) {
          setPendingUserId(
            res.userId
          );

          setShowOTP(true);

          setMessage({
            type: "success",
            text:
              "Enter the code from Google Authenticator.",
          });

          return;
        }

        if (res.success) {
          navigate(res.redirectTo);
        } else {
          setMessage({
            type: "error",
            text: res.message,
          });
        }

        return;
      }

      /* =====================================================
         REGISTRATION
      ===================================================== */

      const payload = referralCode
        ? {
            ...formData,
            referralCode,
          }
        : formData;

      const res =
        await register(
          payload,
          isAdmin
        );

      if (res.success) {
        setMessage({
          type: "success",
          text:
            res.message ||
            "Registered successfully!",
        });

        navigate(res.redirectTo);
      } else {
        setMessage({
          type: "error",
          text:
            res.message ||
            "Registration failed",
        });
      }
    } catch (err) {
      console.error(err);

      setMessage({
        type: "error",
        text: "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>

      {/* ===================================================
          DESKTOP LIVE TSLA BACKGROUND
      =================================================== */}

      <DesktopMarketBackground>
        <MarketBackground />
      </DesktopMarketBackground>

      {/* ===================================================
          HERO
      =================================================== */}

      <LeftPanel>

        <HeroImage
          src={bg1}
          alt="Investment Platform"
        />

        <HeroContent>

          <Brand>
            TXLA Advisory
          </Brand>

          <HeroTitle>
            Institutional-Grade
            <br />
            Investing Infrastructure
          </HeroTitle>

          <HeroText>
            Build, manage and grow your wealth
            through a secure investment platform
            designed for long-term capital growth,
            portfolio diversification and global
            market exposure.
          </HeroText>

          <FeatureGrid>

            <FeatureCard>
              Bank-Level Security
            </FeatureCard>

            <FeatureCard>
              Multi-Factor Authentication
            </FeatureCard>

            <FeatureCard>
              Portfolio Management
            </FeatureCard>

            <FeatureCard>
              Global Market Access
            </FeatureCard>

          </FeatureGrid>

        </HeroContent>

      </LeftPanel>

      {/* ===================================================
          FORM SIDE
      =================================================== */}

      <RightPanel>

        <BackButton
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
           <FiArrowLeft />
        </BackButton>

        <FormWrapper>

          {/* =================================================
              MOBILE LIVE TSLA CHART
          ================================================= */}

          <MobileMarketSection>

            <MobileMarketChart>
              <MarketBackground />
            </MobileMarketChart>

            <MobileMarketShade />

            <MarketHeader>

              <MarketInfo>

                <MarketSymbol>
                  TSLA
                </MarketSymbol>

                <MarketName>
                  Tesla Inc. • 1 Minute
                </MarketName>

              </MarketInfo>

              <LiveIndicator>

                <LiveDot />

                LIVE

              </LiveIndicator>

            </MarketHeader>

            <MarketFooter>

              <span>
                Live market activity
              </span>

              <span>
                Real-time
              </span>

            </MarketFooter>

          </MobileMarketSection>

          {/* =================================================
              LOGO
          ================================================= */}

          <LogoSection>


            <CompanyName>
              TXLA Advisory
            </CompanyName>

            <CompanyTagline>
              Secure Investing • Wealth Management
            </CompanyTagline>

          </LogoSection>

          {/* =================================================
              TITLE
          ================================================= */}

          <Title>

            {showOTP
              ? "Secure Verification"
              : isLogin
              ? "Welcome Back"
              : "Create Account"}

          </Title>

          <Subtitle>

            {showOTP
              ? "Enter the verification code from Google Authenticator to complete your secure login."
              : isLogin
              ? "Access your investment portfolio, monitor performance and manage your assets through our secure platform."
              : "Start building long-term wealth with diversified investment opportunities and advanced account security."}

          </Subtitle>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <Message
              type={message.type}
            >
              {message.text}
            </Message>
          )}

          {/* =================================================
              ACCOUNT SWITCH
          ================================================= */}

          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#94a3b8",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >

            {isLogin ? (
              <>
                New to TXLA Advisory?{" "}

                <Link
                  to="/register"
                  style={{
                    color: "#c9a227",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Create Account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}

                <Link
                  to={
                    isAdmin
                      ? "/admin/login"
                      : "/login"
                  }
                  style={{
                    color: "#c9a227",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Link>
              </>
            )}

          </div>

          {/* =================================================
              SECURITY BADGES
          ================================================= */}

          <SecurityBar>

            <SecurityItem>
              Secure Login
            </SecurityItem>

            <SecurityItem>
              2FA Enabled
            </SecurityItem>

            <SecurityItem>
              Encrypted
            </SecurityItem>

          </SecurityBar>

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>

            {/* REGISTRATION FIELDS */}

            {!isLogin && (
              <>
                <Input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username:
                        e.target.value,
                    })
                  }
                />

                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone:
                        e.target.value,
                    })
                  }
                />
              </>
            )}

            {/* =================================================
                NORMAL LOGIN / REGISTER
            ================================================= */}

            {!showOTP ? (
              <>
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email:
                        e.target.value,
                    })
                  }
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password:
                        e.target.value,
                    })
                  }
                />

                {isLogin && (
                  <ForgotPasswordRow>

                    <ForgotPasswordButton
                      type="button"
                      onClick={() =>
                        navigate(
                          "/forgot-password"
                        )
                      }
                    >
                      Forgot Password?
                    </ForgotPasswordButton>

                  </ForgotPasswordRow>
                )}
              </>
            ) : (
              <>
                <Title
                  style={{
                    fontSize: "20px",
                    marginTop: "4px",
                  }}
                >
                  Two-Factor Authentication
                </Title>

                <Subtitle>
                  Enter the verification code
                  from Google Authenticator.
                </Subtitle>

                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  maxLength={6}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />
              </>
            )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? showOTP
                  ? "Verifying..."
                  : isLogin
                  ? "Logging in..."
                  : "Registering..."
                : showOTP
                ? "Verify Code"
                : isLogin
                ? "Login"
                : "Register"}
            </Button>

            {/* =================================================
                CANCEL 2FA
            ================================================= */}

            {showOTP && (
              <Button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp("");
                  setPendingUserId(null);
                  setMessage(null);
                }}
                style={{
                  marginTop: "10px",
                  background:
                    "linear-gradient(45deg,#666,#444)",
                }}
              >
                Cancel
              </Button>
            )}

          </form>

        </FormWrapper>

      </RightPanel>

    </RegisterContainer>
  );
};

export default AuthForm;