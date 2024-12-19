import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "../styles/proposals-page.css"; // We'll add this stylesheet


const ProposalsPage = () => {
  const { orderId } = useParams();
  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState("");
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(`${BASE_URL}/proposals/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch proposals for this order");
        }
        const data = await response.json();
        setProposals(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load proposals");
      }
    };

    if (token) {
      fetchProposals();
    } else {
      setError("You are not authenticated.");
    }
  }, [orderId, token, BASE_URL]);

  const handleAcceptProposal = async () => {
    if (!selectedProposalId) {
      setError("No proposal selected");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/proposals/${selectedProposalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ state: "ACCEPTED_BY_CUSTOMER" }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      setSuccessMessage("Proposal accepted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to accept proposal. Please try again.");
    }
  };

  return (
    <div className="proposals-page">
    <h3>Proposals for Order #{orderId}</h3>
    {error && <p className="error-message">{error}</p>}
    {successMessage && <p className="success-message">{successMessage}</p>}
  
    {proposals.length === 0 ? (
      <p>No proposals found for this order.</p>
    ) : (
      <form onSubmit={(e) => e.preventDefault()} className="proposals-form">
        <ul className="proposals-list">
          {proposals.map((proposal) => (
            <li key={proposal.id} className="proposal-item">
            <label>
                <input
                type="radio"
                name="selectedProposal"
                value={proposal.id}
                checked={selectedProposalId === proposal.id}
                onChange={() => setSelectedProposalId(proposal.id)}
                />
                <div className="proposal-details">
                <div><strong>Proposal #{proposal.id}:</strong> {proposal.message}</div>
                <div><strong>Proposed Price:</strong> ${Number(proposal.proposed_price).toFixed(2)}</div>
                <div><strong>Delivery Days:</strong> {proposal.delivery_days}</div>
                </div>
            </label>
            </li>
          ))}
        </ul>
        <div className="proposals-actions">
          <button type="button" className="action-button" onClick={handleAcceptProposal}>Accept Selected Proposal</button>
          <button type="button" className="action-button secondary" onClick={() => navigate(-1)}>Back</button>
        </div>
      </form>
    )}
  </div>
  );
};

export default ProposalsPage;
