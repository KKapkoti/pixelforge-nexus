import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProjects(res.data);
    } catch (err) {
      setError("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchProjects();
    }
  }, [user]);

  const handleCreate = async () => {
    const title = prompt("Enter project title");
    if (!title) return;
    try {
      await API.post(
        "/projects",
        { title },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchProjects();
    } catch {
      alert("Failed to create project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await API.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchProjects();
    } catch {
      alert("Failed to delete project");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">Dashboard ({user.role})</h1>
      {error && <p className="text-red-400">{error}</p>}

      {user.role === "admin" && (
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mb-4"
        >
          + New Project
        </button>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-gray-800 p-4 rounded shadow hover:bg-gray-700 cursor-pointer"
            onClick={() => navigate(`/project/${project._id}`)}
          >
            <h3 className="text-xl font-bold">{project.title}</h3>
            <p>Status: {project.completed ? "Completed" : " In Progress"}</p>
            {user.role === "admin" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project._id);
                }}
                className="mt-2 text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
