import React, { useState } from "react";
import "../styles/ProposalForm.css";

const ProposalForm = ({ order, onSave = () => {}, onCancel = () => {} }) => {
    const [message, setMessage] = useState("");
    const [price, setPrice] = useState("");
    const [error, setError] = useState("");
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
      
        const payload = {
          order_id: order.id,
          proposal_message: message,
          proposed_price: price,
        };
      
        console.log("Submitting payload:", payload); // Debug the payload being sent
      
        try {
          const response = await fetch("http://localhost:5000/proposals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) {
            const { message } = await response.json();
            throw new Error(message);
          }
      
          const savedProposal = await response.json();
          console.log("Saved Proposal:", savedProposal); // Log the backend response
          onSave(savedProposal);
        } catch (err) {
          setError("Failed to submit proposal. Please try again.");
        }
      };
  
    return (
      <div className="proposal-container">
        <h2>Submit a Proposal</h2>
        <div className="order-details">
          <h3>Order Details</h3>
          <p><strong>Title:</strong> {order.title}</p>
          <p><strong>Description:</strong> {order.description}</p>
          <p><strong>Budget:</strong> ${order.budget}</p>
        </div>
  
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
          <div className="button-container">
            <button type="submit" className="submit-btn">Send Proposal</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };
  
  export default ProposalForm;
