import React, { useState, useContext } from "react";
import { UserContext } from "../App";
import Portfolio from "../components/Portfolio";
import PortfolioForm from "../components/PortfolioForm";
import "../styles/PortfolioManagement.css";

const PortfolioManagement = () => {
  const { user } = useContext(UserContext); // Access logged-in user
  const [editingItem, setEditingItem] = useState(null); // Track item being edited

  // Ensure user.id (creatorId) is available
  if (!user || !user.id) {
    return (
      <div className="portfolio-management">
        <h2>Portfolio Management</h2>
        <p style={{ color: "red" }}>Error: User not logged in or missing creator ID.</p>
      </div>
    );
  }

  const handleEditPortfolio = (item) => {
    setEditingItem(item); // Set the current item for editing
  };

  const handleSavePortfolio = () => {
    setEditingItem(null); // Reset editing after saving
  };

  return (
    <div className="portfolio-management">
      <h2>Portfolio Management</h2>
      {/* Toggle between Edit Mode (PortfolioForm) and Portfolio Viewer */}
      {editingItem ? (
        <PortfolioForm
          onSave={handleSavePortfolio}
          editingItem={editingItem}
        />
      ) : (
        <>
          <button
            className="add-portfolio-button"
            onClick={() => setEditingItem({})} // Add a new portfolio item
          >
            Add New Portfolio Item
          </button>
          <Portfolio creatorId={user.id} onEdit={handleEditPortfolio} />
        </>
      )}
    </div>
  );
};

export default PortfolioManagement;
