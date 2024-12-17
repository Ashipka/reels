import React, { useEffect, useState } from "react";

const ViewProposals = ({ orderId }) => {
  const [proposals, setProposals] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/proposals/order/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch proposals");

        const data = await response.json();
        setProposals(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchProposals();
  }, [orderId]);

  return (
    <div>
      <h3>Proposals for Order {orderId}</h3>
      <ul>
        {proposals.map((proposal) => (
          <li key={proposal.id}>
            <p>Creator: {proposal.creator_name}</p>
            <p>Message: {proposal.message}</p>
            <p>Price: ${proposal.price}</p>
            <p>Status: {proposal.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewProposals;
