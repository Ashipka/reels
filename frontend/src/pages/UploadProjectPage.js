import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/UploadProject.css";

const UploadProjectPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [fileLinks, setFileLinks] = useState("");
  const [isNewProject, setIsNewProject] = useState(null); // Start as null to differentiate loading state
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProject = async () => {
      const BASE_URL = process.env.REACT_APP_BASE_URL;

      try {
        const response = await fetch(`${BASE_URL}/projects/${proposalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setDescription(data.project.description || "");
          setFileLinks((data.project.file_links || []).join(", "));
          setIsNewProject(false); // Existing project found
        } else if (response.status === 404) {
          setIsNewProject(true); // No existing project
        } else {
          throw new Error("Failed to fetch project");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setIsNewProject(true); // Fallback to new project mode on error
      }
    };

    fetchProject();
  }, [proposalId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const BASE_URL = process.env.REACT_APP_BASE_URL;

      const endpoint = isNewProject
        ? `${BASE_URL}/projects`
        : `${BASE_URL}/projects/${proposalId}`;
      const method = isNewProject ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
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

      alert(
        isNewProject
          ? "Project created successfully!"
          : "Project updated successfully!"
      );
      navigate("/my-proposals");
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Failed to save project");
    }
  };

  if (isNewProject === null) {
    // Show a loading indicator while determining project type
    return <div>Loading...</div>;
  }

  return (
    <div className="upload-project-container">
      <h2>{isNewProject ? "Upload Project Files" : "Edit Project Files"}</h2>
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
        <button type="submit" className="upload-button">
          {isNewProject ? "Upload" : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default UploadProjectPage;
