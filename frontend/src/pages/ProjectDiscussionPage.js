import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ProjectDiscussion.css";

const ProjectDiscussionPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [improvements, setImprovements] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("steps"); // "steps" or "comments"

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  useEffect(() => {
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const fetchData = async () => {
      try {
        // Fetch project
        const projRes = await fetch(`${BASE_URL}/projects/${proposalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!projRes.ok) {
          const { message } = await projRes.json();
          throw new Error(message);
        }
        const projData = await projRes.json();
        setProject(projData.project);

        // Fetch improvements
        const impRes = await fetch(
          `${BASE_URL}/improvements/project/${projData.project.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!impRes.ok) {
          const { message } = await impRes.json();
          throw new Error(message);
        }
        const impData = await impRes.json();
        setImprovements(impData.improvements ?? []);
      } catch (err) {
        console.error("Error fetching project/improvements:", err);
      }
    };

    if (proposalId && token) {
      fetchData();
    }
  }, [proposalId, token]);

  const handleSubmitImprovement = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const res = await fetch(`${BASE_URL}/improvements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: project.id,
          message: newMessage,
        }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message);
      }
      const data = await res.json();
      setImprovements((prev) => [...prev, data.improvement]);
      setNewMessage("");
    } catch (err) {
      console.error("Error adding improvement:", err);
      alert(`Failed to add comment: ${err.message}`);
    }
  };

  const handleComplete = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const proposalId = project?.proposal_id;
      if (!proposalId) {
        alert("No proposal_id found for this project. Cannot complete.");
        return;
      }

      const response = await fetch(`${BASE_URL}/proposals/${proposalId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Complete" }),
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      alert("Project marked as complete!");
      navigate("/view-orders");
    } catch (err) {
      console.error("Error completing proposal/order:", err);
      alert(`Failed to complete the project: ${err.message}`);
    }
  };

  const handleEditProject = () => {
    navigate(`/upload-project/${proposalId}`);
  };

  return (
    <div className="project-discussion-container">
      <h2>Project Discussion</h2>

      {project && (
        <div className="project-info">
          <p>
            <strong>Description:</strong> {project.description}
          </p>
          <p>
            <strong>File Links:</strong>
            <br/>
            <br/>
            {Array.isArray(project.file_links) && project.file_links.length > 0 ? (
                project.file_links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: "10px", display: "inline-block" }}
                  >
                    {link}
                  </a>
                ))
              ) : (
                "No links available"
              )}
          </p>
          {userRole === "creator" &&
            (project.proposal_status.toLowerCase() === "need improvements" ||
              project.proposal_status.toLowerCase() === "project ready for confirmation") && (
              <button
                onClick={handleEditProject}
                className="edit-project-button"
              >
                Update Project
              </button>
            )}
        </div>
      )}

      {/* TABS WRAPPER */}
      <div className="tabs-container">
        {/* Tabs Navigation */}
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "steps" ? "active" : ""}`}
            onClick={() => setActiveTab("steps")}
          >
            Next Steps
          </button>
          <button
            className={`tab-button ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            Improvements / Comments
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "steps" && (
            <div className="tab-steps">
              <h3>Next Steps</h3>
              <p>
                If you are happy with the delivered project, click{" "}
                <strong>Complete</strong>.
              </p>
              <button onClick={handleComplete} className="complete-button">
                Complete
              </button>
              <p>
                Otherwise, switch to the{" "}
                <strong>Improvements / Comments</strong> tab to request changes.
              </p>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="tab-comments">
              <h3>Improvements / Comments</h3>
              <ul className="improvements-list">
                {improvements.map((imp) => {
                  const isCreatorMessage = imp.author_id === project?.creator_id;

                  return (
                    <li key={imp.id} className={`chat-message ${isCreatorMessage ? "right-bubble" : "left-bubble"}`}>
                      <p className="author">{imp.author_name || "Unknown"}:</p>
                      <p className="message-text">{imp.message}</p>
                      <small>Created: {imp.created_at}</small>
                    </li>
                  );
                })}
              </ul>

              <div className="improvements-input">
                <textarea
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write your improvement request or comment..."
                />
                <button
                  onClick={handleSubmitImprovement}
                  className="send-button"
                >
                  Send Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDiscussionPage;
