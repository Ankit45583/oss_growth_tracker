import React from "react";
import "./StatCard.css";

const StatCard = ({ icon, label, value, color = "blue", subtitle }) => {
  // Safe value formatting
  let displayValue = "—";

  if (value !== undefined && value !== null && value !== "") {
    if (typeof value === "number") {
      displayValue = value.toLocaleString();
    } else {
      displayValue = String(value);
    }
  }

  return (
    <div className={`stat-card stat-card-${color} anim-slide`}>
      <div className={`stat-card-icon-wrap stat-icon-${color}`}>
        <span className="stat-card-icon">{icon || "📊"}</span>
      </div>
      <p className="stat-card-value">{displayValue}</p>
      <p className="stat-card-label">{label || "Stat"}</p>
      {subtitle && <p className="stat-card-sub">{subtitle}</p>}
    </div>
  );
};

export default StatCard;