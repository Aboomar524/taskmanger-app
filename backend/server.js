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
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://taskmanger-app-1.onrender.com/', 'https://taskmanger-app-1.onrender.com'],
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

// Hardcoded user (in a real app, store in a database)
const users = [
    {
        username: "web215user",
        password: "$2b$10$xXRggQfWYTEH/rM4usPp6uvt81EsO6K1tfb1JMz6oPnpN42fO6wAq", // كلمة المرور المشفرة
    },
];

// JWT Authentication middleware - UPDATED to handle Bearer token
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

    const user = users.find((u) => u.username === username);

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

// Example protected route
app.get("/api/protected", authenticate, (req, res) => {
    res.json({
        message: "This is a protected route. You are authenticated!",
        user: req.user.username
    });
});

// Routes for tasks (example)
const taskRoutes = require("./routes/taskRoutes");
app.use("/api", taskRoutes);

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

// **مسار تسجيل مستخدم جديد**
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    // تحقق من وجود اسم المستخدم في قاعدة البيانات (أو المصفوفة هنا للتجربة)
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ success: false, message: "Username already exists!" });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إضافة المستخدم إلى "قاعدة البيانات" (هنا في المصفوفة فقط للتجربة)
    users.push({ username, password: hashedPassword });

    // إرسال استجابة ناجحة
    res.status(200).json({ success: true, message: "Account created successfully!" });
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