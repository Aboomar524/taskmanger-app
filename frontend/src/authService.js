// src/authService.js
export const login = async (username, password) => {
  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    
    if (response.ok) {
      // حفظ التوكن في localStorage
      localStorage.setItem("token", data.token);
      console.log("Token saved successfully");
    } else {
      console.log("Invalid credentials");
    }
  } catch (error) {
    console.error("Login error", error);
  }
};

export const logout = () => {
  localStorage.removeItem("token");  // إزالة التوكن عند تسجيل الخروج
  console.log("Logged out successfully");
};
