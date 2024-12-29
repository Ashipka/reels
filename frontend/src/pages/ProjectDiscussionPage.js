import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ProjectDiscussion.css";

const ProjectDiscussionPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [improvements, setImprovements] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("steps"); // "steps" or "comments"

  const token = localStorage.getItem("token");

  useEffect(() => {
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const fetchData = async () => {
      try {
        // 1) Fetch project
        const projRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!projRes.ok) {
          const { message } = await projRes.json();
          throw new Error(message);
        }
        const projData = await projRes.json();
        setProject(projData.project);

        // 2) Fetch improvements
        const impRes = await fetch(
          `${BASE_URL}/improvements/project/${projectId}`,
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

    if (projectId && token) {
      fetchData();
    }
  }, [projectId, token]);

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
          project_id: projectId,
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

  return (
    <div className="project-discussion-container">
      <h2>Project Discussion</h2>

      {project && (
        <div className="project-info">
          <p>
            <strong>Description:</strong> {project.description}
          </p>
          <p>
            <strong>File Links:</strong>{" "}
            {Array.isArray(project.file_links)
              ? project.file_links.join(", ")
              : project.file_links}
          </p>
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
                If you are happy with the delivered project, click <strong>Complete</strong>.
              </p>
              <button onClick={handleComplete} className="complete-button">
                Complete
              </button>
              <p>
                Otherwise, switch to the <strong>Improvements / Comments</strong> tab
                to request changes.
              </p>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="tab-comments">
              <h3>Improvements / Comments</h3>
              <ul className="improvements-list">
              {improvements.map((imp) => {
                // Example logic for left vs right
                // If you have project?.creator_id and order?.user_id, do:
                const isCreatorMessage = (imp.author_id === project?.creator_id);

                // Choose the class
                const bubbleClass = isCreatorMessage ? "right-bubble" : "left-bubble";

                return (
                  <li key={imp.id} className={`chat-message ${bubbleClass}`}>
                    <p className="author">
                      {imp.author_name || "Unknown"}:
                    </p>
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
                <button onClick={handleSubmitImprovement} className="send-button">
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
