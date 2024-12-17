import React, { useState } from "react";
import "../styles/ProposalForm.css";

const ProposalForm = ({ order, onSave, onCancel }) => {
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message || !price || !deliveryDays) {
      setError("All fields are required!");
      return;
    }

    // Pass all fields to parent component
    onSave({
      order_id: order.id,
      proposal_message: message,
      proposed_price: price,
      delivery_days: deliveryDays,
    });
  };

  return (
    <div className="proposal-container">
      <h2>Submit a Proposal</h2>

      {/* Order Details */}
      <div className="order-details">
        <h3>Order Details</h3>
        <p>
          <strong>Title:</strong> {order.title}
        </p>
        <p>
          <strong>Description:</strong> {order.description}
        </p>
        <p>
          <strong>Budget:</strong> ${order.budget}
        </p>
      </div>

      {/* Proposal Form */}
      <form onSubmit={handleSubmit} className="proposal-form">
        {error && <p className="error-message">{error}</p>}

        <textarea
          placeholder="Proposal Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>

        <input
          type="number"
          placeholder="Your Proposed Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Number of Days to Deliver"
          value={deliveryDays}
          onChange={(e) => setDeliveryDays(e.target.value)}
          required
        />

        <div className="button-container">
          <button type="submit" className="submit-btn">
            Send Proposal
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;
