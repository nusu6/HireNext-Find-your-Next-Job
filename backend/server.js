const express = require("express");
const cors = require("cors");
require("dotenv").config();

const jobRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const settingsRoutes = require("./routes/settings");
const profileRoutes = require("./routes/profile");
const notificationRoutes = require("./routes/notification");
const aiRoutes = require("./routes/ai");
const applicantsRoutes = require("./routes/applicants");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", 
    /\.vercel\.app$/ // This safely allows ANY deployment URL coming from Vercel
  ], 
  credentials: true
})); // Allows your React frontend (port 3000) to communicate here
app.use(express.json()); // Parses incoming JSON payloads

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/applicants", applicantsRoutes);

// Base Route
app.get("/", (req, res) => {
  res.send("HireNext Backend API is running smoothly!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is successfully running on port ${PORT}`);
});