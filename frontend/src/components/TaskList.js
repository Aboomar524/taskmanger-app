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

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, []);

    // Fetch tasks from the backend
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(API_URL);
            setTasks(res.data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setError(`Error fetching tasks: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Add a new task
    const addTask = async () => {
        if (!newTask.trim()) return;
        try {
            setError(null);
            const response = await axios.post(API_URL, { title: newTask });
            setTasks([...tasks, response.data]); // Add the new task to the local state
            setNewTask(""); // Clear the input field
        } catch (err) {
            console.error("Error adding task:", err);
            setError(`Error adding task: ${err.message}`);
        }
    };

    // Delete a task
    const deleteTask = async (id) => {
        if (!id) {
            setError("Cannot delete: Missing task ID");
            return;
        }
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                setError(null);
                console.log("Deleting task with ID:", id); // Debugging log
                await axios.delete(`${API_URL}/${id}`);
                console.log("Task deleted:", id); // Debugging log
                const updatedTasks = tasks.filter((task) => task._id !== id);
                console.log("Updated tasks:", updatedTasks); // Debugging log
                setTasks(updatedTasks); // Update local state
            } catch (err) {
                console.error("Error deleting task:", err);
                setError(`Error deleting task: ${err.message}`);
            }
        }
    };

    // Start editing a task
    const startEditTask = (task) => {
        setEditTaskId(task._id);
        setEditTaskTitle(task.title);
    };

    // Save the edited task
    const saveEditTask = async () => {
        if (!editTaskTitle.trim()) return;
        if (!editTaskId) {
            setError("Cannot save edit: Missing task ID");
            return;
        }
        try {
            setError(null);
            const response = await axios.put(`${API_URL}/${editTaskId}`, { title: editTaskTitle });
            setTasks(tasks.map((task) => (task._id === editTaskId ? { ...task, title: editTaskTitle } : task))); // Update the task in the local state
            setEditTaskId(null); // Clear edit mode
            setEditTaskTitle(""); // Clear the edit input field
        } catch (err) {
            console.error("Error saving task:", err);
            setError(`Error saving task: ${err.message}`);
        }
    };

    // Cancel editing a task
    const cancelEdit = () => {
        setEditTaskId(null);
        setEditTaskTitle("");
    };

    return (
        <div className="task-manager" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Task Manager</h2>

            {/* Error message */}
            {error && (
                <div style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '10px'
                }}>
                    {error}
                </div>
            )}

            {/* Add task input */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="New Task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    style={{
                        padding: '8px',
                        width: '70%',
                        marginRight: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
                <button
                    onClick={addTask}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add
                </button>
            </div>

            {/* Edit task input (shown when editing) */}
            {editTaskId && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                }}>
                    <input
                        type="text"
                        value={editTaskTitle}
                        onChange={(e) => setEditTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditTask()}
                        style={{
                            padding: '8px',
                            width: '70%',
                            marginRight: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <button
                        onClick={saveEditTask}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            marginRight: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEdit}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Task list */}
            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <ul style={{
                    listStyleType: 'none',
                    padding: 0
                }}>
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <li key={task._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                borderBottom: '1px solid #eee',
                                backgroundColor: editTaskId === task._id ? '#e3f2fd' : 'transparent'
                            }}>
                                <span>{task.title}</span>
                                <div>
                                    <button
                                        onClick={() => startEditTask(task)}
                                        style={{
                                            marginRight: '5px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                                                deleteTask(task._id);
                                            }
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li style={{
                            padding: '15px',
                            textAlign: 'center',
                            color: '#757575'
                        }}>
                            No tasks available
                        </li>
                    )}
                </ul>
            )}

            {/* Debug and refresh buttons */}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={() => console.log("Current tasks:", tasks)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#9e9e9e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Debug: Log Tasks
                </button>
                <button
                    onClick={fetchTasks}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#fbc02d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh Tasks
                </button>
            </div>
        </div>
    );
};

export default TaskList;