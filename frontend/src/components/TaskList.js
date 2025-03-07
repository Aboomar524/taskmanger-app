import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [error, setError] = useState(null);
    const [taskDetails, setTaskDetails] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setError(null);
            const res = await axios.get("http://localhost:5000/api/tasks");
            setTasks(res.data);

            // Log task structure to help diagnose the issue
            if (res.data && res.data.length > 0) {
                const sampleTask = res.data[0];
                console.log("Sample task structure:", sampleTask);
                setTaskDetails(`Task structure: ID type: ${typeof sampleTask._id}, ID value: ${sampleTask._id}`);
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setError(`Error fetching tasks: ${err.message}`);
        }
    };

    const addTask = async () => {
        if (!newTask.trim()) return;
        try {
            setError(null);
            const response = await axios.post("http://localhost:5000/api/tasks", { title: newTask });
            await fetchTasks();  // Refresh task list after adding
            setNewTask("");  // Clear input after adding task
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

        try {
            setError(null);
            console.log(`Attempting to delete task with ID: ${id}`);

            const response = await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
                validateStatus: function (status) {
                    return true;  // Prevent Axios from throwing an error
                }
            });

            console.log("Delete response:", response);

            if (response.status === 500) {
                setError("Server error (500) when deleting. Check if ID format is correct.");
            } else if (response.status >= 400) {
                setError(`Error (${response.status}) when deleting: ${response.data.message || 'Unknown error'}`);
            } else {
                await fetchTasks();  // Refresh task list after deletion
            }
        } catch (err) {
            console.error("Error deleting task:", err);
            setError(`Error deleting task: ${err.message}`);
        }
    };

    const startEditTask = (task) => {
        const taskId = task._id || task.id;
        if (!taskId) {
            setError("Cannot edit: Task ID not found");
            return;
        }

        setEditTaskId(taskId);
        setEditTaskTitle(task.title || "");
    };

    const saveEditTask = async () => {
        if (!editTaskTitle.trim()) return;
        if (!editTaskId) {
            setError("Cannot save edit: Missing task ID");
            return;
        }

        try {
            setError(null);
            console.log(`Updating task with ID: ${editTaskId}`);

            const response = await axios.put(`http://localhost:5000/api/tasks/${editTaskId}`, {
                title: editTaskTitle
            });

            console.log("Update response:", response);

            if (response.status === 500) {
                setError("Server error (500) when updating.");
            } else if (response.status >= 400) {
                setError(`Error (${response.status}) when updating: ${response.data.message || 'Unknown error'}`);
            } else {
                await fetchTasks();  // Refresh task list after update
                setEditTaskId(null);  // Clear edit task state
                setEditTaskTitle("");  // Clear edit task input
            }
        } catch (err) {
            console.error("Error saving task:", err);
            setError(`Error saving task: ${err.message}`);
        }
    };

    const cancelEdit = () => {
        setEditTaskId(null);
        setEditTaskTitle("");
    };

    const inspectTask = (task) => {
        alert(`Task ID: ${task._id || task.id}\nTitle: ${task.title}\nFull object: ${JSON.stringify(task)}`);
    };

    return (
        <div className="task-manager" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Task Manager</h2>

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

            {taskDetails && (
                <div style={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '12px'
                }}>
                    {taskDetails}
                </div>
            )}

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

            <ul style={{
                listStyleType: 'none',
                padding: 0
            }}>
                {tasks.length > 0 ? (
                    tasks.map((task) => {
                        const taskId = task._id || task.id;
                        return (
                            <li key={taskId} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                borderBottom: '1px solid #eee',
                                backgroundColor: editTaskId === taskId ? '#e3f2fd' : 'transparent'
                            }}>
                                <span>{task.title}</span>
                                <div>
                                    <button
                                        onClick={() => inspectTask(task)}
                                        style={{
                                            marginRight: '5px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                        title="Inspect task details"
                                    >
                                        🔍
                                    </button>
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
                                                deleteTask(taskId);
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
                        );
                    })
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
                    onClick={() => fetchTasks()}
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
