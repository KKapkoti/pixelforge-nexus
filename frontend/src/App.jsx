import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from './context/AuthContext';

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";
import Dashboard from "./pages/Dashboard";
import AccountSettings from "./pages/AccountSettings";
import ProjectDetails from "./pages/ProjectDetails";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [adminExists, setAdminExists] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/admin-exists");
        setAdminExists(res.data.exists);
      } catch (error) {
        console.error("Failed to check admin existence", error);
        setAdminExists(true); // assume admin exists on error
      }
    };
    checkAdmin();
  }, []);

  if (adminExists === null) return <div>Loading...</div>; // Wait for check

  return (
    <Routes>
      {/*Smart Route Based on Admin */}
      <Route
        path="/"
        element={<Navigate to={adminExists ? "/login" : "/register-admin"} />}
      />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-admin" element={<AdminRegister />} />

      {/* Protected App Routes */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
