import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

function Contact() {
  const navigate = useNavigate();

  return (
    <ContactSection>
      <BackButton onClick={() => navigate("/")}>⬅ Back to Home</BackButton>

      <h1>Contact Us</h1>
      <p>We’d love to hear from you! Reach out using the details below:</p>

      <div className="contact-info">
        <p>
          <strong>Email:</strong> support@txlainvestment.com
        </p>
        <p>
          <strong>Phone:</strong> +234 801 234 5678
        </p>
        <p>
          <strong>Office:</strong> No. 15 Investment Street, Lagos, Nigeria
        </p>
      </div>

      <form>
        <label>Your Name</label>
        <input type="text" placeholder="Enter your name" />

        <label>Your Email</label>
        <input type="email" placeholder="Enter your email" />

        <label>Message</label>
        <textarea placeholder="Write your message..." rows="4" />

        <button type="submit">Send Message</button>
      </form>
    </ContactSection>
  );
}

export default Contact;

//
// ✅ Styled Components
//
const ContactSection = styled.section`
  min-height: 100vh;
  padding: 3rem;
  color: #fff;
  background: #141e30;

  h1 {
    margin-bottom: 1rem;
  }

  .contact-info {
    margin-top: 1.5rem;
    line-height: 1.8;
  }

  form {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    max-width: 400px;

    input,
    textarea {
      padding: 10px;
      margin-bottom: 1rem;
      border-radius: 5px;
      border: none;
    }

    button {
      padding: 10px;
      background: #4caf50;
      border: none;
      color: #fff;
      cursor: pointer;
      border-radius: 5px;
      transition: background 0.3s ease;

      &:hover {
        background: #45a049;
      }
    }
  }
`;

const BackButton = styled.button`
  background: #222;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: #4caf50;
  }
`;
