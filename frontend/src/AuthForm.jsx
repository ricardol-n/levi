import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import bg1 from "./assets/world.jpg";
import bg3 from "./pages/asset/freepik.jpeg";
import { AuthContext } from "./context/AuthContext";

const images = [bg1, bg3];

// ----- Background Slideshow -----
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url(${(props) => props.$bgImage}) no-repeat center center/cover;
  transition: background-image 1s ease-in-out;
  width: 100vw;
  overflow: hidden;
  position: relative;
`;

const FormWrapper = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 350px;
  max-width: 90%;
  text-align: center;

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 10px;
    width: 90%;
  }
`;

const Title = styled.h2`
  color: white;
  font-size: 24px;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;

  ::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(45deg, #ff8c00, #ff0080);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Message = styled.p`
  color: ${(props) => (props.type === "error" ? "red" : "lightgreen")};
  font-size: 14px;
`;

// ----- Stock Ticker -----
const moveLeft = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const StockTicker = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  z-index: 5;
  background: rgba(0, 0, 0, 0.4);
  padding: 6px 0;
`;

const TickerContent = styled.div`
  display: inline-block;
  padding-left: 100%;
  animation: ${moveLeft} 30s linear infinite;
  font-size: 16px;
  color: #00ff7f;
  font-weight: bold;
  letter-spacing: 1px;
`;
// ✅ API Base: Use full URL in production (VITE_API_URL) or fallback to proxy (/api)
const API_BASE = import.meta.env.VITE_API_URL || "/api";


const AuthForm = ({ type }) => {
  const isLogin = type === "login" || type === "adminLogin";
  const isAdmin = type === "adminLogin" || type === "adminRegister";

  const [currentBg, setCurrentBg] = useState(images[0]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useContext(AuthContext);

  const [markets, setMarkets] = useState([
    { symbol: "AAPL", price: 150.32 },
    { symbol: "TSLA", price: 720.12 },
    { symbol: "AMZN", price: 3400.45 },
    { symbol: "GOOG", price: 2800.11 },
    { symbol: "MSFT", price: 299.8 },
    { symbol: "BTC/USD", price: 68000.25 },
    { symbol: "ETH/USD", price: 3200.75 },
    { symbol: "EUR/USD", price: 1.085 },
    { symbol: "GBP/USD", price: 1.265 },
  ]);

  // Mock ticker updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const change = Math.random() * 10 - 5;
          let newPrice = m.price + change;
          newPrice = newPrice < 10 ? Number(newPrice.toFixed(4)) : Number(newPrice.toFixed(2));
          return { ...m, price: newPrice };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Background slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => {
        const nextIndex = (images.indexOf(prev) + 1) % images.length;
        return images[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    if (!validateForm()) return;

    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await login(formData.email, formData.password, isAdmin);
      } else {
        res = await register(formData, isAdmin);
      }

      if (res.success) {
        setMessage({ type: "success", text: res.message || (isLogin ? "Login successful!" : "Registered successfully!") });
        navigate(res.user.role === "admin" ? "/admin" : "/dashboard");
      } else {
        setMessage({ type: "error", text: res.message || "Authentication failed" });
      }
    } catch (err) {
      console.error("❌ Auth error:", err);
      setMessage({ type: "error", text: "Server error. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer $bgImage={currentBg}>
      <StockTicker>
        <TickerContent>
          {markets.map((m, i) => (
            <span key={i} style={{ marginRight: "50px" }}>
              {m.symbol}: ${m.price}
            </span>
          ))}
        </TickerContent>
      </StockTicker>

      <FormWrapper>
        <Title>{isLogin ? "Login" : "Register"}</Title>
        {message && <Message type={message.type}>{message.text}</Message>}
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link to={isLogin ? (isAdmin ? "/admin/register" : "/register") : (isAdmin ? "/admin/login" : "/login")}>
            {isLogin ? "Register here" : "Login here"}
          </Link>
        </p>
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
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Button type="submit" disabled={loading}>
            {loading ? (isLogin ? "Logging in..." : "Registering...") : isLogin ? "Login" : "Register"}
          </Button>
        </form>
      </FormWrapper>
    </RegisterContainer>
  );
};

export default AuthForm;
