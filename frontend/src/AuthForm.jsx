import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import bg1 from './assets/world.jpg';
import bg3 from './pages/asset/freepik.jpeg';
import { AuthContext } from './context/Authcontext';

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

// ----- Form Styling -----
const FormWrapper = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 350px;
  max-width: 90%;   /* ✅ Shrinks on small screens */
  text-align: center;

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 10px;
    width: 90%;     /* ✅ make it fit smaller screens */
  }
`;

const Title = styled.h2`
  color: white;
  font-size: 24px;

  @media (max-width: 480px) {
    font-size: 20px;  /* ✅ slightly smaller on mobile */
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

// ----- Stock Ticker Animation -----
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
  background: rgba(0, 0, 0, 0.4);  /* 🔹 transparent background */
  padding: 6px 0;
`;

const TickerContent = styled.div`
  display: inline-block;
  padding-left: 100%;
  animation: ${moveLeft} 30s linear infinite;
  font-size: 16px;
  color: #00ff7f; /* neon green */
  font-weight: bold;
  letter-spacing: 1px;
`;


// ----- Reusable AuthForm Component -----
const AuthForm = ({ type }) => {
  const isLogin = type === "login";
  const [currentBg, setCurrentBg] = useState(images[0]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockPrice, setStockPrice] = useState(1000); // Mock stock price
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const API_BASE = import.meta.env.VITE_API_URL;
  // ----- Stock Ticker -----
const [markets, setMarkets] = useState([
  { symbol: "AAPL", price: 150.32 },
  { symbol: "TSLA", price: 720.12 },
  { symbol: "AMZN", price: 3400.45 },
  { symbol: "GOOG", price: 2800.11 },
  { symbol: "MSFT", price: 299.80 },
  { symbol: "BTC/USD", price: 68000.25 },
  { symbol: "ETH/USD", price: 3200.75 },
  { symbol: "EUR/USD", price: 1.085 },
  { symbol: "GBP/USD", price: 1.265 },
  
]);

// Mock price updates every second
useEffect(() => {
  const interval = setInterval(() => {
    setMarkets((prev) =>
      prev.map((m) => {
        const change = Math.random() * 10 - 5;
        let newPrice = m.price + change;

        // format: if <10 treat as forex (small decimals), if >100 crypto/stocks
        if (newPrice < 10) {
          newPrice = Number(newPrice.toFixed(4));
        } else {
          newPrice = Number(newPrice.toFixed(2));
        }

        return { ...m, price: newPrice };
      })
    );
  }, 1000);
  return () => clearInterval(interval);
}, []);


  // ----- Background slideshow -----
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => {
        const nextIndex = (images.indexOf(prev) + 1) % images.length;
        return images[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  // ----- Validation -----
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

  // ----- Submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = isLogin ? "auth/login" : "auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      let res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: await res.text() };
      }

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Server error" });
        setLoading(false);
        return;
      }

      if (isLogin) {
        login(data.token, data.user);
        localStorage.setItem("userId", data.user._id);
        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage({ type: "success", text: "Registered! Redirecting to login..." });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error(err);
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
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <Link to={isLogin ? "/register" : "/login"}>
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
