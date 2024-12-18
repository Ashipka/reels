import React, { useState, useEffect } from "react";
import "../styles/ProposalForm.css";

const ProposalForm = ({ order, proposal, onSave, onCancel }) => {
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (proposal) {
      // If editing, pre-fill fields
      setMessage(proposal.message || "");
      setPrice(proposal.proposed_price || "");
      setDeliveryDays(proposal.delivery_days || "");
    } else {
      // If creating a new proposal, clear fields
      setMessage("");
      setPrice("");
      setDeliveryDays("");
    }
  }, [proposal]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message || !price || !deliveryDays) {
      setError("All fields are required!");
      return;
    }

    const updatedProposal = {
      order_id: order.id,
      proposal_message: message,
      proposed_price: price,
      delivery_days: deliveryDays,
    };

    // If editing an existing proposal, include its id
    if (proposal && proposal.id) {
      updatedProposal.id = proposal.id;
    }

    onSave(updatedProposal);
  };

  return (
    <div className="proposal-container">
      <h2>{proposal ? "Edit Your Proposal" : "Submit a Proposal"}</h2>

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
        />

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
            {proposal ? "Update Proposal" : "Send Proposal"}
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
