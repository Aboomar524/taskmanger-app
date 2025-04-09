require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'https://taskmanger-app-1.onrender.com'],  // Ensure this includes the frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Enable CORS with options
app.use(cors(corsOptions));

// Middleware
app.use(express.json());  // Middleware to parse JSON data
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with retry logic
const MAX_RETRIES = 5;
let retryCount = 0;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🚀 MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(connectDB, 5000);
        } else {
            console.error("❌ Max retries reached. Exiting...");
            process.exit(1);
        }
    }
};
connectDB();

// User model
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}));

// JWT Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Extract token from header (remove "Bearer " if present)
    const token = authHeader.startsWith('Bearer ') ?
        authHeader.substring(7) : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);
        res.status(400).json({ message: "Invalid token" });
    }
};

// Login route
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // If credentials are correct, create the JWT token
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: "1h", // Token expires in 1 hour
    });

    res.json({ token });
});

// Protected route
app.get("/api/protected", authenticate, (req, res) => {
    res.json({
        message: "This is a protected route. You are authenticated!",
        user: req.user.username
    });
});

// Sign Up route
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already exists!" });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword });

    try {
        await user.save();
        res.status(200).json({ success: true, message: "Account created successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating account!" });
    }
});

// Start Server
const server = app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});
