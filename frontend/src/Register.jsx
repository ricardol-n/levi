import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import bg1 from './pages/asset/17455.jpg';
import bg2 from './pages/asset/5557528.jpg';
import bg3 from './pages/asset/freepik.jpeg';

const images = [bg1, bg2, bg3];

// Styled components
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url(${(props) => props.$bgImage}) no-repeat center center/cover;
  transition: background-image 1s ease-in-out;
  width: 100vw;
  overflow: hidden;
`;

const FormWrapper = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 350px;
  text-align: center;
`;

const Title = styled.h2`
  color: white;
  font-size: 24px;
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
`;

const ErrorText = styled.p`
  color: red;
  font-size: 14px;
`;

const Register = () => {
  const navigate = useNavigate();
  const [currentBg, setCurrentBg] = useState(images[0]);
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState(null);

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
    if (!formData.username || !formData.email || !formData.phone || !formData.password) {
      setMessage({ type: "error", text: "All fields are required." });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;

    const API_BASE = import.meta.env.VITE_API_URL; 
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Registration failed." });
        return;
      }

      setMessage({ type: "success", text: "✅ Registered! Redirecting to login..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration Error:", err);
      setMessage({ type: "error", text: "❌ Server error. Try again later." });
    }
  };

  return (
    <RegisterContainer $bgImage={currentBg}>
      <FormWrapper>
        <Title>Register</Title>
        {message && <p style={{ color: message.type === "error" ? "red" : "lightgreen" }}>{message.text}</p>}
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Button type="submit">Register</Button>
        </form>
      </FormWrapper>
    </RegisterContainer>
  );
};

export default Register;
