import React from "react";
import { useNavigate } from "react-router-dom";
import CreateOrderForm from "../components/CreateOrderForm";

const CreateOrderPage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/view-orders"); // Redirect to the orders list
  };

  return (
    <div className="create-order-page">
      <h2>Create a New Order</h2>
      <CreateOrderForm onCancel={handleCancel} /> {/* Pass cancel handler */}
    </div>
  );
};

export default CreateOrderPage;
