import React, { useContext,useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import bg1 from './pages/asset/17455.jpg';
import bg2 from './pages/asset/5557528.jpg';
import bg3 from './pages/asset/freepik.jpeg';
import { Link } from 'react-router-dom';

import { email } from 'react-admin';
import { color } from 'framer-motion';
import { AuthContext } from './context/Authcontext';


const images =[bg1,bg2,bg3];

const RegisterContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: url(${(props) => props.$bgImage}) no-repeat center center/cover;
    transition: background-image 1s ease-in-out;
    height:100vh;
    width:100vw;
    overflow:hidden;
    position:relative;
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


const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(null);
  const [currentBg, setCurrentBg] = useState(images[0]);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => {
        const nextIndex = (images.indexOf(prev) + 1) % images.length;
        return images[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.email || !form.password) {
      setMessage({ type: 'error', text: 'Both fields are required.' });
      return;
    }

    try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Login failed:", errorText);
      setMessage({ type: 'error', text: 'Login failed. Check credentials.' });
      return;
    }

    const data = await res.json(); // ✅ fetch response early

    if (!data.token) {
      return setMessage({ type: 'error', text: 'No token received' });
    }

    // ✅ Proceed if everything is okay
    login(data.token, data.user);
    localStorage.setItem('userId', data.user._id); // Important for deposit logic
    setMessage({ type: 'success', text: 'Login successful! Redirecting...' });

    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);

  } catch (error) {
    console.error("Login Error:", error);
    setMessage({ type: 'error', text: 'Server error. Please try again later.' });
  }
};

  return (
    <RegisterContainer $bgImage={currentBg}>
      <FormWrapper>
        <Title>Login</Title>
        {message && (
          <p style={{ color: message.type === 'error' ? 'red' : 'green' }}>{message.text}</p>
        )}

        <p> Don't have an account? <Link to="/register">Register here</Link></p>
        <form onSubmit={handleSubmit}>
            

          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <Button type="submit">Login</Button>
        </form>
      </FormWrapper>
    </RegisterContainer>
  );
};

export default Login;
