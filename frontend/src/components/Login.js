import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // استخدم useNavigate للتوجيه

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // التحقق من صحة المدخلات
        if (!username || !password) {
            setMessage("Please fill out all fields!");
            return;
        }

        // إرسال بيانات تسجيل الدخول إلى الخادم
        try {
            const response = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.token) {
                // إذا تم تسجيل الدخول بنجاح، قم بتخزين التوكن في localStorage
                localStorage.setItem("authToken", data.token);
                navigate("/tasks"); // التوجيه إلى صفحة المهام
            } else {
                setMessage(data.message || "Login failed!");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("Something went wrong! Check the console for details.");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
