require("dotenv").config(); // This should be the FIRST line

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON requests

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
const taskRoutes = require("./routes/taskRoutes");
app.use("/api", taskRoutes); // Apply task routes under /api
app.get("/", (req, res) => {
    res.send("Welcome to the Task Manager API!");
});

// Serve static files (if needed)
app.use(express.static("public"));

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
