import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_URL}/tasks`);
            setTasks(res.data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setError(`Error fetching tasks: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        if (!newTask.trim()) return;
        try {
            setError(null);
            const response = await axios.post(`${API_URL}/tasks`, { title: newTask });
            setTasks([...tasks, response.data]);
            setNewTask("");
        } catch (err) {
            console.error("Error adding task:", err);
            setError(`Error adding task: ${err.message}`);
        }
    };

    const deleteTask = async (id) => {
        if (!id) {
            setError("Cannot delete: Missing task ID");
            return;
        }
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                setError(null);
                await axios.delete(`${API_URL}/tasks/${id}`);
                setTasks(tasks.filter((task) => task._id !== id));
            } catch (err) {
                console.error("Error deleting task:", err);
                setError(`Error deleting task: ${err.message}`);
            }
        }
    };

    const startEditTask = (task) => {
        setEditTaskId(task._id);
        setEditTaskTitle(task.title);
    };

    const saveEditTask = async () => {
        if (!editTaskTitle.trim()) return;
        if (!editTaskId) {
            setError("Cannot save edit: Missing task ID");
            return;
        }
        try {
            setError(null);
            await axios.put(`${API_URL}/tasks/${editTaskId}`, { title: editTaskTitle });
            setTasks(tasks.map((task) => (task._id === editTaskId ? { ...task, title: editTaskTitle } : task)));
            setEditTaskId(null);
            setEditTaskTitle("");
        } catch (err) {
            console.error("Error saving task:", err);
            setError(`Error saving task: ${err.message}`);
        }
    };

    const cancelEdit = () => {
        setEditTaskId(null);
        setEditTaskTitle("");
    };

    return (
        <div className="task-manager" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Task Manager</h2>
            {error && (
                <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>{error}</div>
            )}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="New Task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    style={{ padding: '8px', width: '70%', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                    onClick={addTask}
                    style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Add
                </button>
            </div>
            {editTaskId && (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <input
                        type="text"
                        value={editTaskTitle}
                        onChange={(e) => setEditTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditTask()}
                        style={{ padding: '8px', width: '70%', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                        onClick={saveEditTask}
                        style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEdit}
                        style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </div>
            )}
            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <li key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee', backgroundColor: editTaskId === task._id ? '#e3f2fd' : 'transparent' }}>
                                <span>{task.title}</span>
                                <div>
                                    <button
                                        onClick={() => startEditTask(task)}
                                        style={{ marginRight: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                    >✏️</button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                                                deleteTask(task._id);
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                    >❌</button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li style={{ padding: '15px', textAlign: 'center', color: '#757575' }}>No tasks available</li>
                    )}
                </ul>
            )}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={() => console.log("Current tasks:", tasks)}
                    style={{ padding: '8px 16px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                >
                    Debug: Log Tasks
                </button>
                <button
                    onClick={fetchTasks}
                    style={{ padding: '8px 16px', backgroundColor: '#fbc02d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Refresh Tasks
                </button>
            </div>
        </div>
    );
};

export default TaskList;
