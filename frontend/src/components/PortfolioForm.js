import React, { useState, useEffect } from "react";

const PortfolioForm = ({ onSave, editingItem }) => {
  const [title, setTitle] = useState(editingItem?.title || "");
  const [description, setDescription] = useState(editingItem?.description || "");
  const [tags, setTags] = useState(editingItem?.tags?.join(", ") || ""); // Convert array to comma-separated string
  const [instagramLink, setInstagramLink] = useState(editingItem?.instagram_link || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const method = editingItem ? "PUT" : "POST";
    const endpoint = editingItem
      ? `${BASE_URL}/portfolio/${editingItem.id}` // Ensure editingItem.id is defined
      : `${BASE_URL}/portfolio`;
  
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(",").map((tag) => tag.trim()),
          instagram_link: instagramLink,
        }),
      });
  
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
  
      const savedItem = await response.json();
      onSave(savedItem); // Notify parent component
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="portfolio-form">
      <h2>{editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          required
        />
        <input
          type="url"
          placeholder="Instagram Link"
          value={instagramLink}
          onChange={(e) => setInstagramLink(e.target.value)}
        />
        <button type="submit">{editingItem ? "Save Changes" : "Add Portfolio"}</button>
      </form>
    </div>
  );
};

export default PortfolioForm;
