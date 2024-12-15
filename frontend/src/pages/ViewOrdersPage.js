import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ViewOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
        const token = localStorage.getItem("token");
      
        try {
          const BASE_URL = process.env.REACT_APP_BASE_URL;
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
          console.log("Fetched orders:", data);
      
          setOrders(data); // Update the orders state
          setLoading(false); // Stop the loading state
        } catch (err) {
          console.error("Error fetching orders:", err.message);
          setError("Failed to fetch orders. Please try again."); // Set error message
          setLoading(false); // Stop the loading state even if there's an error
        }
      };
      
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const response = await fetch(`${BASE_URL}/orders/cancel/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    }
  };

  const handleCreateNewOrder = () => {
    navigate("/create-order");
  };

  if (loading) return <p>Loading your orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="view-orders">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <h3>{order.title}</h3>
              <p>{order.description}</p>
              <p>
                <strong>Budget:</strong> ${order.budget}
              </p>
              <p>
                <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              {order.status === "Open" && (
                <button
                  className="cancel-button"
                  onClick={() => handleCancelOrder(order.id)}
                >
                  Cancel Order
                </button>
              )}
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
