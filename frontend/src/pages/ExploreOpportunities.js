import React, { useEffect, useState } from "react";
import ProposalForm from "../components/ProposalForm";

const ExploreOpportunities = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for the form
  const [successMessage, setSuccessMessage] = useState(""); // Success feedback
  const token = localStorage.getItem("token");

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

    fetchOrders();
  }, [token]);

  const handleProposalSubmit = async (proposal) => {
    try {
      const response = await fetch("http://localhost:5000/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(proposal), // Ensure the entire proposal object is sent
      });
  
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
  
      console.log("Proposal submitted successfully!");
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error submitting proposal:", err.message);
      setError("Failed to submit proposal. Please try again.");
    }
  };

  const handleCancel = () => setSelectedOrder(null); // Close the form

  return (
    <div className="explore-opportunities">
      <h2>Explore Opportunities</h2>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {selectedOrder ? (
        <ProposalForm
          order={selectedOrder}
          onSave={handleProposalSubmit} // Pass handleProposalSubmit
          onCancel={handleCancel}
        />
      ) : orders.length === 0 ? (
        <p>No open orders available.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <h3>{order.title}</h3>
              <p>{order.description}</p>
              <p><strong>Budget:</strong> ${order.budget}</p>
              <button onClick={() => setSelectedOrder(order)}>
                Make a Proposal
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExploreOpportunities;
