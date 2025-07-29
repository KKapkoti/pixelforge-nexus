import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [developerInput, setDeveloperInput] = useState("");
  const [file, setFile] = useState(null);

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProject(res.data);
    } catch {
      alert("Failed to fetch project");
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await API.get(`/projects/${id}/documents`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDocuments(res.data);
    } catch {
      console.log("No documents or unauthorized");
    }
  };

  useEffect(() => {
    fetchProject();
    fetchDocuments();
  }, [id]);

  const handleMarkComplete = async () => {
    try {
      await API.patch(
        `/projects/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchProject();
    } catch {
      alert("Failed to mark as complete");
    }
  };

  const handleAssign = async () => {
    if (!developerInput) return;
    try {
      await API.patch(
        `/projects/${id}/assign`,
        { developers: developerInput.split(",") },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchProject();
    } catch {
      alert("Failed to assign developers");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await API.post(`/projects/${id}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchDocuments();
      setFile(null);
    } catch {
      alert("Upload failed");
    }
  };

  if (!project) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
      <p>Status: {project.completed ? "Completed" : "In Progress"}</p>

      {user.role === "admin" && !project.completed && (
        <button
          onClick={handleMarkComplete}
          className="bg-blue-600 px-3 py-2 mt-4 rounded hover:bg-blue-700"
        >
          Mark as Complete
        </button>
      )}

      {user.role === "lead" && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Developer emails (comma-separated)"
            value={developerInput}
            onChange={(e) => setDeveloperInput(e.target.value)}
            className="text-black px-2 py-1 rounded mr-2"
          />
          <button
            onClick={handleAssign}
            className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700"
          >
            Assign Developers
          </button>
        </div>
      )}

      {(user.role === "admin" || user.role === "lead") && (
        <div className="mt-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-2"
          />
          <button
            onClick={handleUpload}
            className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
          >
            Upload Document
          </button>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Team</h2>
        <ul className="list-disc ml-6">
          {project.assignedTo?.map((dev) => (
            <li key={dev}>{dev}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Documents</h2>
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <ul className="list-disc ml-6">
            {documents.map((doc, i) => (
              <li key={i}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {doc.filename}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
