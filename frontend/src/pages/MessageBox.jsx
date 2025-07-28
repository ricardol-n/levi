// components/MessageBox.js
import React from "react";

const MessageBox = ({ show, message, onClose }) => {
  if (!show) return null;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  };

  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: 1001,
  };

  const buttonStyle = {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <div>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <p>{message}</p>
        <button style={buttonStyle} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageBox;
