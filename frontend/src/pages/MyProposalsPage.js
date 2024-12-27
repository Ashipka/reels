import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/my-proposals.css";

const MyProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState("");
  const [updateCount, setUpdateCount] = useState(0); // Force re-render
  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(`${BASE_URL}/proposals`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch proposals.");
        }

        const data = await response.json();
        setProposals(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load proposals.");
      }
    };

    if (token) {
      fetchProposals();
    } else {
      setError("You are not authenticated.");
    }
  }, [BASE_URL, token, updateCount]);

  const handleChangeStatus = async (proposalId) => {
    try {
      const response = await fetch(`${BASE_URL}/proposals/${proposalId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Waiting for Payment" }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const updatedProposal = await response.json();
      console.log("Updated Proposal:", updatedProposal);

      setProposals((prevProposals) =>
        prevProposals.map((proposal) =>
          proposal.id === updatedProposal.id
            ? { ...proposal, status: updatedProposal.status }
            : proposal
        )
      );

      setUpdateCount((count) => count + 1); // Force re-render
    } catch (err) {
      console.error(err);
      setError("Failed to update proposal status.");
    }
  };

  return (
    <div className="my-proposals">
      <h2>My Proposals</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {proposals.length === 0 ? (
        <p className="no-proposals">You have not submitted any proposals yet.</p>
      ) : (
        <ul className="proposals-list">
          {proposals.map((proposal) => (
            <li key={proposal.id} className="proposal-item">
              <h3>Order: {proposal.order_title}</h3>
              <p><strong>Message:</strong> {proposal.message}</p>
              <p><strong>Price:</strong> ${proposal.proposed_price}</p>
              <p><strong>Delivery Days:</strong> {proposal.delivery_days}</p>
              <p className={`proposal-status ${proposal.status.toLowerCase().replace(/\s+/g, "-")}`}>
                <strong>Status:</strong> {proposal.status}
              </p>
              {proposal.status === "Accepted" && (
                <button
                  className="action-button"
                  onClick={() => handleChangeStatus(proposal.id)}
                >
                  Mark as Waiting for Payment
                </button>
              )}
              {proposal.status === "Payed" && (
                <button className="action-button" onClick={() => navigate(`/upload-project/${proposal.id}`)}>
                  Upload Project
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <button className="action-button secondary" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
};

export default MyProposalsPage;
