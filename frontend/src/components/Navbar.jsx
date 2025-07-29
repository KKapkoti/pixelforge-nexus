// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { auth, logout } = useAuth();

  if (!auth.token) return null;

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div>
        <Link to="/dashboard" className="mr-4 font-bold text-xl">PixelForge Nexus</Link>
      </div>
      <div className="flex gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/settings">Account</Link>
        <button onClick={logout} className="text-red-300 hover:text-red-500">Logout</button>
      </div>
    </nav>
  );
}
