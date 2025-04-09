import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup"; // تأكد من أن المسار صحيح
import Login from "./components/Login"; // تأكد من أن المسار صحيح
import TaskList from "./components/TaskList"; // تأكد من أن المسار صحيح
import "./App.css"; // تأكد من أن ملف CSS مضاف بشكل صحيح

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Task Manager App</h1>
        <Routes>
          <Route path="/signup" element={<Signup />} /> {/* صفحة التسجيل */}
          <Route path="/login" element={<Login />} /> {/* صفحة تسجيل الدخول */}
          <Route path="/tasks" element={<TaskList />} /> {/* صفحة المهام */}
          <Route path="/" element={<Signup />} /> {/* إعادة التوجيه لصفحة التسجيل */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
