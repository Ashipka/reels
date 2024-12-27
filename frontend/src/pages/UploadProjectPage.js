// src/pages/UploadProjectPage.js
import React, { useState, useContext } from "react";
import { UserContext } from "../App"; // если нужно
import { useNavigate, useParams } from "react-router-dom";
// import { fetchWithAuth } from "../utils/fetchWithAuth"; // если нужен
import "../styles/UploadProject.css"; // <-- Import your CSS file


const UploadProjectPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [fileLinks, setFileLinks] = useState(""); // может быть строкой (CSV), или массивом

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const BASE_URL = process.env.REACT_APP_BASE_URL;

      const response = await fetch(`${BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proposal_id: proposalId,
          description,
          file_links: fileLinks.split(",").map((link) => link.trim()),
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      // Всё прошло успешно
      navigate("/my-proposals");
    } catch (err) {
      console.error("Error uploading project:", err);
      alert("Failed to upload project");
    }
  };

  return (
    <div className="upload-project-container">
      <h2>Upload Project Files</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Description:</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>File Links (comma-separated):</label>
          <input
            type="text"
            value={fileLinks}
            onChange={(e) => setFileLinks(e.target.value)}
          />
        </div>
        <button type="submit" className="upload-button">Upload</button>
      </form>
    </div>
  );
};

export default UploadProjectPage;
