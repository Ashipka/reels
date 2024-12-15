import React, { useState, useContext } from "react";
import { UserContext } from "../App";

const CreateOrderForm = ({ onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please log in to create an order.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, description, budget }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const newOrder = await response.json();
      console.log("Order created:", newOrder);
      if (onCancel) onCancel(); // Redirect after successful creation
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="create-order">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Order Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Order Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />
        <div className="form-actions">
          <button type="submit" className="create-button">
            Create Order
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CreateOrderForm;
