// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      const { requiresOtp, tempToken, token, user } = res.data;

      if (requiresOtp) {
        setToken(tempToken);
        await API.post("/auth/send-otp", { token: tempToken });
        setOtpSent(true);
      } else {
        setAuthData({ token, user });
        navigate("/register");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/verify-otp", { token, otp });
      setAuthData({ token: res.data.token, user: res.data.user });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-semibold mb-6">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!otpSent ? (
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Login
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="w-full max-w-sm space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded"
          >
            Verify OTP
          </button>
        </form>
      )}
    </div>
  );
}
