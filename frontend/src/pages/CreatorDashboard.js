import React from "react";
import { Link } from "react-router-dom";

const CreatorDashboard = () => {
  return (
    <div className="dashboard">
      <h2>Welcome to Your Creator Dashboard</h2>
      <p>Here you can manage your portfolio, browse orders, and more.</p>
      <div className="dashboard-actions">
        <Link to="/orders">
          <button>View Orders</button>
        </Link>
        <Link to="/portfolio">
          <button>Manage Portfolio</button>
        </Link>
        <Link to="/opportunities">
          <button>Explore Opportunities</button>
        </Link>
      </div>
    </div>
  );
};

export default CreatorDashboard;