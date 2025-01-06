import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProposalForm from "../components/ProposalForm";
import { useLocation } from "react-router-dom";

const ExploreOpportunities = () => {
  const [orders, setOrders] = useState([]);
  const [userProposals, setUserProposals] = useState([]);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null); // The proposal to edit
  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation();


  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state) {
      if (location.state.message) {
        setSuccessMessage(location.state.message);
      }
      if (location.state.error) {
        setError(location.state.error);
      }
    }
  }, [location.state]);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/orders/open", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch open orders");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  useEffect(() => {
    const fetchUserProposals = async () => {
      try {
        const response = await fetch("http://localhost:5000/proposals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user proposals");
        }
        const data = await response.json();
        setUserProposals(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    if (token) {
      fetchUserProposals();
    }
  }, [token]);

  const handleProposalSubmit = async (proposal) => {
    try {
      const method = proposal.id ? "PUT" : "POST";
      const url = proposal.id
        ? `http://localhost:5000/proposals/${proposal.id}`
        : "http://localhost:5000/proposals";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(proposal),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      console.log("Proposal submitted successfully!");
      setSuccessMessage("Proposal submitted successfully!");
      setSelectedOrder(null);
      setSelectedProposal(null);

      const updatedRes = await fetch("http://localhost:5000/proposals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      setUserProposals(updatedData);
    } catch (err) {
      console.error("Error submitting proposal:", err.message);
      setError("Failed to submit proposal. Please try again.");
    }
  };

  const handleCancel = () => {
    setSelectedOrder(null);
    setSelectedProposal(null);
  };

  const startEditingProposal = (order) => {
    const userProposal = userProposals.find((p) => p.order_id === order.id);
    navigate(`/proposal-form?orderId=${order.id}&proposalId=${userProposal?.id || ""}`);
  };

  const navigateToProposalForm = (order) => {
    navigate(`/proposal-form?orderId=${order.id}`);
  };

  return (
    <div className="explore-opportunities">
      <h2>Explore Opportunities</h2>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {selectedOrder ? (
        <ProposalForm
          order={selectedOrder}
          proposal={selectedProposal} // Pass the existing proposal here
          onSave={handleProposalSubmit}
          onCancel={handleCancel}
        />
      ) : orders.length === 0 ? (
        <p>No open orders available.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => {
            const userProposal = userProposals.find((p) => p.order_id === order.id);

            return (
              <li key={order.id} className="order-item">
                <div className="order-info">
                  <h3>{order.title}</h3>
                  <p>{order.description}</p>
                  <p>
                    <strong>Budget:</strong> ${order.budget}
                  </p>
                </div>

                {userProposal ? (
                  <>
                    <hr />
                    <div className="proposal-info">
                      <p>
                        <strong>Offer:</strong> {userProposal.message}
                      </p>
                      <p>
                        <strong>Proposed Amount:</strong> ${userProposal.proposed_price}
                      </p>
                      <p>
                        <strong>Delivery Days:</strong> {userProposal.delivery_days}
                      </p>
                      <button onClick={() => startEditingProposal(order)}>
                        Edit Proposal
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => navigateToProposalForm(order)}>
                    Make a Proposal
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ExploreOpportunities;
