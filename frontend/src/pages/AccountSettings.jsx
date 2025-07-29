import React, { useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const AccountSettings = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(user.mfaEnabled);

  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword) return alert("All fields required!");
    try {
      await API.post(
        "/auth/verify-otp",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
    } catch {
      alert("Failed to update password");
    }
  };

  const sendOtp = async () => {
    try {
      await API.post(
        "/auth/send-otp",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOtpSent(true);
    } catch {
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      await API.post(
        "/auth/verify-otp",
        { otp },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("MFA enabled!");
      setMfaEnabled(true);
      setOtp("");
    } catch {
      alert("OTP verification failed");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="mb-6">
        <h2 className="text-xl mb-2">Change Password</h2>
        <input
          type="password"
          placeholder="Old Password"
          className="w-full p-2 rounded mb-2 text-black"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 rounded mb-2 text-black"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          onClick={handlePasswordUpdate}
        >
          Update Password
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl mb-2">Multi-Factor Authentication (MFA)</h2>
        {mfaEnabled ? (
          <p className="text-green-400">MFA is enabled on your account.</p>
        ) : otpSent ? (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-2 rounded mb-2 text-black"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              Verify OTP
            </button>
          </>
        ) : (
          <button
            onClick={sendOtp}
            className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700"
          >
            Enable MFA
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
