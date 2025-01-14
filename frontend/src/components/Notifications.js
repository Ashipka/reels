import React, { useEffect, useState } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNotifications(data);
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <h4>Notifications</h4>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((notif) => (
            <li key={notif.id}>{notif.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
