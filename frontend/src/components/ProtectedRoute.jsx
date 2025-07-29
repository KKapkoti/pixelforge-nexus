// src/components/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles = [] }) {
  const { auth } = useAuth();

  if (!auth.token) return <Navigate to="/login" />;

  if (roles.length && !roles.includes(auth.user.role)) {
    return <div className="text-red-500 p-4">Unauthorized: Access Denied</div>;
  }

  return children;
}
