// LoadingSpinner.jsx
import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ text = "Loading...", size = "md" }) => (
  <div className="spinner-wrapper">
    <div className={`spinner spinner-${size}`} />
    {text && <p className="spinner-text">{text}</p>}
  </div>
);

export default LoadingSpinner;