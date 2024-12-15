import React, { useState, useEffect } from "react";

const AddPortfolioForm = ({ onSaved, editingItem }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description);
      setTags(editingItem.tags?.join(", ") || "");
      setInstagramLink(editingItem.instagram_link);
    } else {
      setTitle("");
      setDescription("");
      setTags("");
      setInstagramLink("");
    }
  }, [editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const method = editingItem ? "PUT" : "POST";
      const endpoint = editingItem
        ? `http://localhost:5000/portfolio/${editingItem.id}`
        : "http://localhost:5000/portfolio";
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(",").map((tag) => tag.trim()), // Convert tags to an array
          instagram_link: instagramLink,
        }),
      });
  
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
  
      const updatedItem = await response.json();
      console.log("Updated portfolio item:", updatedItem); // Log the response
      onSaved(); // Call the parent callback to switch back to the portfolio view
    } catch (err) {
      console.error("Error saving portfolio item:", err);
      setError(err.message);
    }
  };
  

  return (
    <div className="add-portfolio-form">
      <h3>{editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}</h3>
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
        />
        <input
          type="url"
          placeholder="Instagram Link"
          value={instagramLink}
          onChange={(e) => setInstagramLink(e.target.value)}
          required
        />
        <button type="submit">{editingItem ? "Save Changes" : "Add Item"}</button>
      </form>
    </div>
  );
};

export default AddPortfolioForm;
