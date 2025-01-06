import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ProposalForm.css";

const ProposalForm = ({ onSave }) => {
  const [order, setOrder] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [error, setError] = useState("");
  const [onboardingMessage, setOnboardingMessage] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch order and proposal details based on query params
  useEffect(() => {
    const fetchOrderAndProposalDetails = async () => {
      const queryParams = new URLSearchParams(location.search);
      const orderId = queryParams.get("orderId");
      const proposalId = queryParams.get("proposalId");

      if (!orderId) {
        setError("Order ID is missing in the URL.");
        return;
      }

      try {
        const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
        const response = await fetch(
          `${BASE_URL}/orders/${orderId}${proposalId ? `?proposalId=${proposalId}` : ""}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message || "Failed to fetch order and proposal details.");
        }

        const data = await response.json();
        setOrder(data.order);
        setProposal(data.proposal || null);

        if (data.proposal) {
          setMessage(data.proposal.message);
          setPrice(data.proposal.proposed_price);
          setDeliveryDays(data.proposal.delivery_days);
        }
      } catch (err) {
        console.error("Error fetching order and proposal details:", err.message);
        setError(err.message);
      }
    };

    fetchOrderAndProposalDetails();
  }, [location]);

  // Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const BASE_URL = process.env.REACT_APP_BASE_URL;
        const response = await fetch(
          `${BASE_URL}/api/stripe/check-onboarding-status?userId=${userId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const data = await response.json();
        if (data.onboarded) {
          setCanSubmit(true);
          setOnboardingMessage("");
        } else {
          setCanSubmit(false);
          setOnboardingMessage(
            "You need to complete your Stripe onboarding before submitting a proposal. " +
              "Click the button below to complete onboarding:"
          );
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err.message);
        setCanSubmit(false);
        setOnboardingMessage("Failed to check onboarding status. Please try again later.");
      }
    };

    if (userId) {
      checkOnboardingStatus();
    }
  }, [userId]);

  const startOnboarding = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const response = await fetch(
        `${BASE_URL}/api/stripe/start-onboarding?userId=${userId}&orderId=${order?.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const data = await response.json();
      if (response.ok && data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        setOnboardingMessage("Failed to start onboarding. Please try again.");
      }
    } catch (err) {
      console.error("Error starting onboarding:", err);
      setOnboardingMessage("Failed to start onboarding. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message || !price || !deliveryDays) {
      setError("All fields are required!");
      return;
    }

    const updatedProposal = {
      order_id: order?.id,
      proposal_message: message,
      proposed_price: price,
      delivery_days: deliveryDays,
    };

    if (proposal?.id) {
      updatedProposal.id = proposal.id;
    }

    onSave(updatedProposal, navigate);
  };

  const handleCancel = () => {
    navigate("/opportunities"); // Redirect to the ExploreOpportunities page
  };

  if (!order) {
    return <p>{error || "Loading order details..."}</p>;
  }

  return (
    <div className="proposal-container">
      <h2>{proposal ? "Edit Your Proposal" : "Submit a Proposal"}</h2>

      {onboardingMessage && (
        <div className="onboarding-message">
          <p>{onboardingMessage}</p>
          {!canSubmit && (
            <button onClick={startOnboarding} className="onboarding-btn">
              Start Onboarding
            </button>
          )}
        </div>
      )}

      <div className="order-details">
        <h3>Order Details</h3>
        <p>
          <strong>Title:</strong> {order?.title}
        </p>
        <p>
          <strong>Description:</strong> {order?.description}
        </p>
        <p>
          <strong>Budget:</strong> ${order?.budget}
        </p>
      </div>

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
          <button
            type="submit"
            className={`submit-btn ${!canSubmit ? "disabled" : ""}`}
            disabled={!canSubmit}
          >
            {proposal ? "Update Proposal" : "Send Proposal"}
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;
