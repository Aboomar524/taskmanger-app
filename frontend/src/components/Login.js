import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // لإعادة التوجيه بعد تسجيل الدخول

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();  // لتمكين التوجيه بعد تسجيل الدخول

    const handleSubmit = async (e) => {
        e.preventDefault();

        // التحقق من صحة النموذج
        if (!username || !password) {
            setMessage("Please fill out all fields!");
            return;
        }

        // إرسال بيانات تسجيل الدخول إلى الخادم باستخدام fetch
        try {
            const response = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.token) {
                // إذا كانت الاستجابة تحتوي على التوكن، نحتفظ به في التخزين المحلي
                localStorage.setItem("token", data.token);

                // إعادة التوجيه إلى صفحة التطبيق (صفحة المهام)
                navigate("/tasks");  // توجيه المستخدم إلى صفحة المهام
            } else {
                setMessage(data.message || "Invalid credentials!");
            }
        } catch (error) {
            console.error("Error details:", error);
            setMessage("Something went wrong! Check the console for details.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <br />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <br />
                <button type="submit">Login</button>
            </form>
            {message && <p className="error-message">{message}</p>}
        </div>
    );
};

export default Login;
