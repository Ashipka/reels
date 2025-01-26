import React from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleCreateOrderClick = () => {
    navigate("/create-order"); // Navigate to the Create Order page
  };

  const handleViewOrdersClick = () => {
    navigate("/view-orders");
  };

  const handleExploreCreatorsClick = () => {
    navigate("/explore-creators");
  };

  return (
    <div className="dashboard">
      <h2>Welcome to Your Dashboard</h2>
      <p>Here you can manage your orders, view proposals, and more.</p>
      <div className="dashboard-actions">
        <button onClick={handleCreateOrderClick}>Create New Order</button>
        <button onClick={handleViewOrdersClick}>View Your Orders</button>
        <button onClick={handleExploreCreatorsClick}>Explore Creators</button>
      </div>
    </div>
  );
};

export default UserDashboard;
