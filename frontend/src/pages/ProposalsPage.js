import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import "../styles/proposals-page.css";

const ProposalsPage = () => {
  const { orderId } = useParams();
  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [status, setOrderStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [readOnly, setReadOnly] = useState(false);

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

      setTimeout(() => {
        navigate("/view-orders");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to update proposal status. Please try again.");
    }
  };

  const handleStripePayment = async (proposal) => {
    try {
      const response = await fetch(`${BASE_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: proposal.proposed_price,
          orderId: proposal.order_id,
          proposalId: proposal.id,
        }),
      });

      const data = await response.json();
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (error) {
        console.error("Stripe checkout error:", error.message);
      }
    } catch (err) {
      console.error("Error initiating Stripe payment:", err.message);
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
                    <div>
                      <strong>Creator:</strong>{" "}
                      <span
                        className="portfolio-link"
                        onClick={() => navigate(`/portfolio/${proposal.creator_id}`)}
                      >
                        {proposal.creator_name || "View Portfolio"}
                      </span>
                    </div>
                  </div>
                </label>
                {proposal.status.trim().toLowerCase() === "waiting for payment" && (
                  <button
                    className="action-button"
                    onClick={() => handleStripePayment(proposal)}
                  >
                    Pay with Stripe
                  </button>
                )}
                {proposal.status === "Project Ready for Confirmation" && (
                  <button
                    className="action-button"
                    onClick={() => navigate(`/discussion/${proposal.id}`)}
                  >
                    View project
                  </button>
                )}
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
