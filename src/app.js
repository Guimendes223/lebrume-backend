require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models"); // Imports models/index.js

// Import routes here later
const authRoutes = require("./routes/authRoutes");
const adminRoutes=require('./routes/adminRoutes');
// const userRoutes = require("./routes/userRoutes");
const companionProfileRoutes = require("./routes/companionProfileRoutes");
const storyRoutes = require("./routes/storyRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Lebrume.com.au API." });
});

// API Routes (to be added)
app.use("/api/auth", authRoutes);
app.use('/api',adminRoutes)
// app.use("/api/users", userRoutes);
app.use("/api/companions", companionProfileRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ratings", ratingRoutes);

// Global Error Handler (simple example, can be expanded)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something broke!", details: err.message });
});

const PORT = process.env.PORT || 8080;

// Sync database and start server
// Use { force: true } only in development to drop and re-create tables
// In production, use migrations
db.sequelize.sync({ force: false }) // Set to true for initial dev to create tables, then false
  .then(() => {
    console.log("Database synced successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

module.exports = app; // For potential testing
