// src/pages/AdminRegister.jsx
import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const sendOtp = async () => {
    try {
      await API.post("/auth/send-otp", { email: formData.email });
      setOtpSent(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleRegister = async () => {
    try {
      await API.post("/auth/register-admin", { ...formData, otp });
      alert("Admin registered successfully. Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      await sendOtp();
    } else {
      await handleRegister();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full p-2 rounded bg-gray-700"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-700"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-gray-700"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {otpSent && (
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 rounded bg-gray-700"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        )}

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          {otpSent ? "Verify & Register" : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default AdminRegister;
