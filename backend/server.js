require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// إعداد CORS كما هو مطلوب
const corsOptions = {
    origin: [
        "http://localhost:3000",
        "https://taskmanger-app-1.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// الاتصال بقاعدة البيانات (كما هو موجود مع منطق المحاولة)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// مخطط المهمة (بدون مفتاح المستخدم)
const Task = mongoose.model('Task', new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
}));

// نقاط نهاية المهام بدون مصادقة

// الحصول على المهام
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// إضافة مهمة
app.post('/api/tasks', async (req, res) => {
    try {
        const { title } = req.body;
        const newTask = new Task({ title });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Error creating task" });
    }
});

// تعديل مهمة
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            id,
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

// حذف مهمة
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Error deleting task" });
    }
});

// صفحة البداية
app.get("/", (req, res) => {
    res.send("<h1>Welcome to Task Manager App</h1>");
});

// خدمة الملفات الثابتة إن وُجدت
const publicPath = path.resolve(__dirname, "public");
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
} else {
    console.warn("⚠️ Public folder not found. Static files will not be served.");
}

// بدء الخادم والاستماع للطلبات
const server = app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
