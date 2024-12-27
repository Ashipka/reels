import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/PaymentSuccess.css";  // <-- Import the CSS file

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Assume proposalId is passed as a query parameter
  const proposalId = new URLSearchParams(location.search).get("proposalId");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  let hasUpdated = false;

  useEffect(() => {
    const updateProposalStatus = async () => {
      if (!proposalId || hasUpdated) {
        console.error("No proposalId found in query params or already updated");
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/proposals/${proposalId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "Payed" }),
        });

      if (!proposalId || hasUpdated) {
        console.error("No proposalId found in query params or already updated");
        return;
      }

        console.log("Proposal status updated to 'Payed'");
        hasUpdated = true; // Mark as updated
      } catch (err) {
        console.error("Error updating proposal status:", err.message);
      }
    };

    updateProposalStatus();
  }, [proposalId, BASE_URL]);

  return (
    <div className="payment-success-container">
      <h1>Payment Successful</h1>
      <p>Your payment was successful, and the proposal status has been updated.</p>
      <button onClick={() => navigate("/view-orders")} className="go-to-orders-button">
        Go to Orders
      </button>
    </div>
  );
};

export default PaymentSuccess;
