import React from "react";
import TaskList from "./components/TaskList";
import Signup from "./components/Signup";  // تأكد من أن المسار صحيح
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Task Manager App</h1>
      {/* إظهار صفحة التسجيل هنا */}
      <Signup />
      <TaskList />
    </div>
  );
}

export default App;
