import React, { useState, useContext } from "react";
import { UserContext } from "../App";
import Portfolio from "../components/Portfolio";
import PortfolioForm from "../components/PortfolioForm";

const PortfolioManagement = () => {
  const { user } = useContext(UserContext); // Access logged-in user
  const [editingItem, setEditingItem] = useState(null); // Track item being edited

  const handleEditPortfolio = (item) => {
    setEditingItem(item); // Set the current item for editing
  };

  const handleSavePortfolio = () => {
    setEditingItem(null); // Reset editing after saving
  };

  return (
    <div className="portfolio-management">
      <h2>Portfolio Management</h2>
      {editingItem ? (
        <PortfolioForm
          onSave={handleSavePortfolio}
          editingItem={editingItem}
        />
      ) : (
        <Portfolio creatorId={user?.id} onEdit={handleEditPortfolio} />
      )}
    </div>
  );
};

export default PortfolioManagement;
