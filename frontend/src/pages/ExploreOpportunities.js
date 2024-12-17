import React, { useEffect, useState } from "react";
import ProposalForm from "../components/ProposalForm";

const ExploreOpportunities = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for the form
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

  const handleProposalSubmit = (proposal) => {
    console.log("Proposal submitted:", proposal);
    setSelectedOrder(null); // Close the form
  };

  const handleCancel = () => setSelectedOrder(null); // Close the form

  return (
    <div className="explore-opportunities">
      <h2>Explore Opportunities</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {selectedOrder ? (
        <ProposalForm
          order={selectedOrder}
          onSave={handleProposalSubmit} // Fixed: Changed from onSubmit to onSave
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
