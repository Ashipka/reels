import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/view-orders.css"; // We'll add this stylesheet

const ViewOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/orders`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message);
        }

        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err.message);
        setError("Failed to fetch orders. Please try again.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, BASE_URL]);

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/cancel/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const { message, order } = await response.json();
      console.log(message);

      // Update the order status in the state
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === order.id ? { ...o, status: order.status } : o
        )
      );
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError("Failed to cancel the order.");
    }
  };

  const handleCreateNewOrder = () => {
    navigate("/create-order");
  };

  const handleViewProposals = (orderId) => {
    // Navigate to separate route for proposals
    navigate(`/orders/${orderId}/proposals`);
  };

  if (loading) return <p>Loading your orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="view-orders">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <h3>{order.title}</h3>
              <p>{order.description}</p>
              <p><strong>Budget:</strong> ${Number(order.budget).toFixed(2)}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <div className="order-actions">
                <button className="action-button" onClick={() => handleViewProposals(order.id)}>
                  View Proposals
                </button>
                {order.status === "Open" && (
                  <button className="action-button secondary" onClick={() => handleCancelOrder(order.id)}>
                    Cancel Order
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleCreateNewOrder} className="create-new-order-button">
        Create New Order
      </button>
    </div>
  );
};

export default ViewOrdersPage;
