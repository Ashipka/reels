import React, { useState, useEffect } from "react";
import "../styles/PortfolioForm.css";

const PortfolioForm = ({ onSave, editingItem }) => {
  const [title, setTitle] = useState(editingItem?.title || "");
  const [description, setDescription] = useState(editingItem?.description || "");
  const [instagramLink, setInstagramLink] = useState(editingItem?.instagram_link || "");
  const [categoryId, setCategoryId] = useState(editingItem?.category_id || ""); // <-- Храним выбранную категорию

  const [categories, setCategories] = useState([]); // <-- Список всех категорий из БД
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  // Загрузка списка категорий
  const fetchCategories = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const response = await fetch(`${BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const method = editingItem && editingItem.id ? "PUT" : "POST";
    const endpoint =
      editingItem && editingItem.id
        ? `${BASE_URL}/portfolio/${editingItem.id}`
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
          instagram_link: instagramLink,
          category_id: categoryId, // <-- Отправляем выбранную категорию
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Failed to save portfolio item");
      }

      const savedItem = await response.json();
      onSave(savedItem); // Сообщаем родительскому компоненту о сохранённом элементе
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

        {/* Выпадающий список для выбора категории */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="url"
          placeholder="Instagram Link"
          value={instagramLink}
          onChange={(e) => setInstagramLink(e.target.value)}
        />

        <button type="submit">
          {editingItem ? "Save Changes" : "Add Portfolio"}
        </button>
      </form>
    </div>
  );
};

export default PortfolioForm;
