import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/proposals-page.css";

const ProposalsPage = () => {
  const { orderId } = useParams();
  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]); // List of proposals
  const [status, setOrderStatus] = useState(""); // Order status
  const [error, setError] = useState("");
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [readOnly, setReadOnly] = useState(false); // Add readOnly state

  useEffect(() => {
    const fetchProposalsAndStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/proposals/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch proposals and order status");
        }
  
        const { proposals = [], status } = await response.json();
        setProposals(proposals);
        setOrderStatus(status);
  
        if (status === "In Progress") {
          setReadOnly(true);
          const acceptedProposal = proposals.find((p) => p.status === "Accepted");
          if (acceptedProposal) {
            setSelectedProposalId(acceptedProposal.id);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load proposals and order status");
      }
    };
  
    if (token) {
      fetchProposalsAndStatus();
    } else {
      setError("You are not authenticated.");
    }
  }, [orderId, token, BASE_URL]);  

  const handleUpdateProposalStatus = async (status) => {
    if (!selectedProposalId) {
      setError("No proposal selected");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/proposals/${selectedProposalId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const message =
        status === "Accepted"
          ? "Proposal accepted successfully!"
          : "Proposal marked as Waiting for Payment!";
      setSuccessMessage(message);

      // Refetch proposals and update status
      setTimeout(() => {
        navigate("/view-orders"); // Redirect to view-orders
      }, 2000); // Delay for showing success message
    } catch (err) {
      console.error(err);
      setError("Failed to update proposal status. Please try again.");
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
                  {status === "Open" && (
                    <input
                      type="radio"
                      name="selectedProposal"
                      value={proposal.id}
                      checked={selectedProposalId === proposal.id}
                      onChange={() => setSelectedProposalId(proposal.id)}
                    />
                  )}
                  <div className="proposal-details">
                    <div>
                      <strong>Proposal #{proposal.id}:</strong> {proposal.message}
                    </div>
                    <div>
                      <strong>Proposed Price:</strong> ${Number(proposal.proposed_price).toFixed(2)}
                    </div>
                    <div>
                      <strong>Delivery Days:</strong> {proposal.delivery_days}
                    </div>
                    <div>
                      <strong>Status:</strong> {proposal.status}
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          <div className="proposals-actions">
            {status === "Open" && (
              <button
                type="button"
                className="action-button"
                onClick={() => handleUpdateProposalStatus("Accepted")}
              >
                Accept Selected Proposal
              </button>
            )}
            <button
              type="button"
              className="action-button secondary"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProposalsPage;
