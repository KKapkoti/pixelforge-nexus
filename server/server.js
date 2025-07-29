//server
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { initEmailTransporter } = require('./utils/email.js');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const errorHandler = require("./middleware/errorHandler");


dotenv.config();

const app = express();

app.use(express.json());

// With this:
app.use(cors({
  origin: "http://localhost:5173", //frontend origin
  credentials: true, //using cookies or auth headers
}));

app.get("/", (req, res) => {
  res.send("Welcome to PixelForge Nexus");
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use(errorHandler);


// Start server after initializing transporter and DB
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await initEmailTransporter();
    console.log("Email transporter initialized");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1); // Exit the process on failure
  }
};

startServer(); 
