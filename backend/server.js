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
const corsOptions = {
    origin: [
        'http://localhost:3000',  // For local development
        'https://taskmanger-app-1.onrender.com'  // For your deployed frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Add explicit preflight handling
app.options('*', cors(corsOptions));

// Additional CORS header fallback
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

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

// Task model - Added for completeness
const Task = mongoose.model('Task', new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    user: { type: String, required: true }
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

// API test endpoint to verify connectivity
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

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
app.post("/api/signup", async (req, res) => {
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

// Make the signup route available at both endpoints for compatibility
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

// Direct task routes
app.get('/api/tasks', authenticate, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.username });
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

app.post('/api/tasks', authenticate, async (req, res) => {
    try {
        const { title } = req.body;
        const newTask = new Task({
            title,
            user: req.user.username
        });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Error creating task" });
    }
});

app.put('/api/tasks/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user: req.user.username },
            { title, completed },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Error updating task" });
    }
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findOneAndDelete({
            _id: id,
            user: req.user.username
        });
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Error deleting task" });
    }
});

// Root route
app.get("/", (req, res) => {
    res.send("<h1>Welcome to Task Manager App</h1>");
});

// Serve static files (if any)
const publicPath = path.resolve(__dirname, "public");
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
} else {
    console.warn("⚠️ Public folder not found. Static files will not be served.");
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
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