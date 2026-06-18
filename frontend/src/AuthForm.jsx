import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import bg1 from "./assets/world.jpg";
import logo from "./assets/tesla.png";
import { AuthContext } from "./context/AuthContext";




// ----- Background Slideshow -----
const RegisterContainer = styled.div`
  min-height: 100vh;
  display:grid;
  grid-template-columns: 1.2fr 500px;

 background:
    radial-gradient(
      1200px 600px at 10% 10%,
      rgba(34,197,94,.08),
      transparent 60%
    ),
    radial-gradient(
      900px 500px at 90% 20%,
      rgba(59,130,246,.08),
      transparent 60%
    ),
    linear-gradient(
      135deg,
      #020617,
      #0f172a,
      #111827
    );

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 460px;

  background:
    rgba(15,23,42,.88);

  backdrop-filter:
    blur(14px);

  border:
    1px solid rgba(
      255,
      255,
      255,
      0.08
    );

  border-radius: 24px;

  padding: 40px;

  box-shadow:
    0 20px 60px
    rgba(0,0,0,.35);
`;

const Title = styled.h2`
  color: white;

  font-size: 32px;

  font-weight: 700;

  text-align: center;

  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  text-align: center;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 32px;
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
`;

const Input = styled.input`
  width: 100%;
  height: 54px;
  border-radius: 12px;
  border: 1px solid #334155;
  background: #111827;
  color: #fff;
  padding: 0 16px;
  font-size: 15px;
  margin-bottom: 16px;
  transition: all .25s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,.15);
  }

  &::placeholder {
    color: #64748b;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 12px;
  background: #22c55e;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all .25s ease;

  &:hover {
    background: #22c55eaa;
  }

  &:disabled {
    opacity: .7;
    cursor: not-allowed;
  }
`;
const Message = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
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

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 60px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  height: 420px;
  object-fit: cover;

  border-radius: 24px;

  border:
    1px solid rgba(
      255,
      255,
      255,
      0.08
    );

  box-shadow:
    0 20px 60px
    rgba(0,0,0,.4);
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

  font-size: 48px;

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

  grid-template-columns:
    repeat(2,1fr);

  gap: 15px;

  margin-top: 30px;
`;
const FeatureCard = styled.div`
  background:
    rgba(15,23,42,.7);

  border:
    1px solid rgba(
      255,
      255,
      255,
      0.06
    );

  padding: 18px;

  border-radius: 16px;

  color: #e2e8f0;

  font-weight: 500;
`;
const RightPanel = styled.div`
  display: flex;

  justify-content: center;

  align-items: center;

  padding: 40px;
`;
const SecurityBar = styled.div`
  display: flex;

  gap: 10px;

  justify-content: center;

  margin-bottom: 25px;

  flex-wrap: wrap;
`;

const SecurityItem = styled.div`
  background:
    rgba(255,255,255,.04);

  border:
    1px solid rgba(
      255,
      255,
      255,
      .08
    );

  color: #cbd5e1;

  padding: 8px 12px;

  border-radius: 999px;

  font-size: 12px;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 28px;
`;

const Logo = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 14px;
`;

const CompanyName = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: .5px;
`;

const CompanyTagline = styled.div`
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
`;

// ✅ API Base: Use full URL in production (VITE_API_URL) or fallback to proxy (/api)
const API_BASE = import.meta.env.VITE_API_URL || "/api";


const AuthForm = ({ type }) => {
  const isLogin = type === "login" || type === "adminLogin";
  const isAdmin = type === "adminLogin" || type === "adminRegister";
  const queryParams = new URLSearchParams(window.location.search);
  const referralCode = queryParams.get("ref");

  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const { login, register,verify2FALogin } = useContext(AuthContext);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);


  const validateForm = () => {
    if (!formData.email || !formData.password || (!isLogin && (!formData.username || !formData.phone))) {
      setMessage({ type: "error", text: "All fields are required." });
      return false;
    }
    if (!isLogin && formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return false;
    }
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage(null);

  if (!showOTP && !validateForm()) return;

  setLoading(true);

  try {
    // ==========================
    // LOGIN FLOW
    // ==========================
    if (isLogin) {

      // STEP 2 (OTP Verification)
      if (showOTP) {

        const res = await verify2FALogin(
          pendingUserId,
          otp
        );

        if (res.success) {
          navigate(res.redirectTo);
        } else {
          setMessage({
            type: "error",
            text: res.message
          });
        }

        return;
      }

      // STEP 1 (Email + Password)
      const res = await login(
        formData.email,
        formData.password,
        isAdmin
      );

      // Requires Google Authenticator
      if (res.requires2FA) {

        setPendingUserId(res.userId);

        setShowOTP(true);

        setMessage({
          type: "success",
          text:
            "Enter the code from Google Authenticator."
        });

        return;
      }

      if (res.success) {
        navigate(res.redirectTo);
      } else {
        setMessage({
          type: "error",
          text: res.message
        });
      }

      return;
    }

    // ==========================
    // REGISTRATION FLOW
    // ==========================

    const payload = referralCode
      ? {
          ...formData,
          referralCode
        }
      : formData;

    const res = await register(
      payload,
      isAdmin
    );

    if (res.success) {

      setMessage({
        type: "success",
        text:
          res.message ||
          "Registered successfully!"
      });

      navigate(res.redirectTo);

    } else {

      setMessage({
        type: "error",
        text:
          res.message ||
          "Registration failed"
      });

    }

  } catch (err) {

    console.error(err);

    setMessage({
      type: "error",
      text: "Server error"
    });

  } finally {

    setLoading(false);

  }
};

  return (
    <RegisterContainer>


  <LeftPanel>
    <HeroImage src={bg1} alt="Investment Platform" />

    <HeroContent>
      <Brand>
  TXLA Advisory
</Brand>

      <HeroTitle>
        Institutional-Grade
        Investing Infrastructure
      </HeroTitle>

      <HeroText>
        Build, manage and grow your wealth through a secure investment platform designed for long-term capital growth, portfolio diversification and global market exposure.
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

  <RightPanel> 

      <FormWrapper>

      <LogoSection>
        <Logo
          src={logo}
          alt="TXLA Advisory"
        />

        <CompanyName>
          TXLA Advisory
        </CompanyName>

        <CompanyTagline>
          Secure Investing • Wealth Management
        </CompanyTagline>
      </LogoSection>

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

{message && (
  <Message type={message.type}>
    {message.text}
  </Message>
)}

<div
  style={{
    textAlign: "center",
    marginBottom: "25px",
    color: "#94a3b8",
    fontSize: "14px"
  }}
>
  {isLogin
    ? (
      <>
        New to TXLA Advisory?{" "}
        <Link to="/register">
          Create Account
        </Link>
      </>
    )
    : (
      <>
        Already have an account?{" "}
        <Link to={isLogin ? (isAdmin ? "/admin/register" : "/register") : (isAdmin ? "/admin/login" : "/login")}>
           {isLogin ? "Create Account" : "Sign In"}
        </Link>
      </>
    )}
</div>

       

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

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </>
          )}
          {!showOTP ? (
  <>
    <Input
      type="email"
      placeholder="Email"
      value={formData.email}
      onChange={(e) =>
        setFormData({
          ...formData,
          email: e.target.value
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
          password: e.target.value
        })
      }
    />
  </>
) : (
  <>
    <Title>Two-Factor Authentication</Title>

    <Subtitle>
      Enter the verification code from
      Google Authenticator
    </Subtitle>

    <Input
      type="text"
      placeholder="Enter 6-digit code"
      value={otp}
      maxLength={6}
      onChange={(e) =>
        setOtp(
          e.target.value.replace(/\D/g, "")
        )
      }
    />
  </>
)}

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
          {showOTP && (
            <Button
              type="button"
              onClick={() => {
                setShowOTP(false);
                setOtp("");
                setPendingUserId(null);
              }}
              style={{
                marginTop: "10px",
                background:
                  "linear-gradient(45deg,#666,#444)"
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
