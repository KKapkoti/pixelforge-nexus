//.server/controllers/authControllers

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require('../utils/email');


// GET /admin-exists
exports.adminExists = async (req, res, next) => {
  try {
    const admin = await User.findOne({ role: "Admin" });
    return res.json({ exists: !!admin });
  } catch (error) {
    console.error("Error checking admin:", error);
    next(error);
  }
};

// POST /register-admin
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await User.findOne({ role: "Admin" });
    if (existingAdmin) {
      return res.status(403).json({ message: "Admin already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "Admin",
    });

    await newAdmin.save();

    return res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Admin registration error:", err);
    next(err);
  }
};


exports.register = async (req, res,next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ msg: "User created", user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
};


// ---------- Send OTP ----------
// exports.sendOtp = async (req, res, next) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const hashedOtp = await bcrypt.hash(otp, 10);

//     user.otp = hashedOtp;
//     user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//     await user.save();

//     await sendEmail(email, 'Your OTP for PixelForge Nexus', `Your OTP is: ${otp}`);

//     res.status(200).json({ msg: "OTP sent to your email" });
//   } catch (err) {
//     next(err);
//   }
// };

exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // If user exists, update OTP — else create a temp user or store OTP elsewhere
    let user = await User.findOne({ email });

    // During admin registration, user won't exist
    if (!user) {
      // Create a temp user-like document in memory
      user = new User({ email, name: "temp", password: "temp", role: "admin" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save it only if real user — optional for dummy
    if (user._id) {
      await user.save();
    }

    await sendEmail(email, 'Your OTP for PixelForge Nexus', `Your OTP is: ${otp}`);
    res.status(200).json({ msg: "OTP sent to your email" });

  } catch (err) {
    next(err);
  }
};



// ---------- Verify OTP ----------
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.otp) return res.status(400).json({ msg: "Invalid request" });

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch || user.otpExpiry < new Date())
      return res.status(400).json({ msg: "Invalid or expired OTP" });

    //Clear OTP after verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};