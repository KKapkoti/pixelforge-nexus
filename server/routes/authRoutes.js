//.server/routes/authRoutes.js

const express = require("express");
const { login, register, sendOtp, verifyOtp, adminExists, registerAdmin } = require("../controllers/authController");
const router = express.Router();

router.post("/login", login);
router.post("/register", register); // Admin-only on frontend
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// New for admin setup
router.get("/admin-exists", adminExists);
router.post("/register-admin", registerAdmin);

module.exports = router;
