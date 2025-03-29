
# Task Manager App (MERN Stack Project)

This is a full-stack **Task Manager** web application built with the **MERN Stack** (MongoDB, Express, React, Node.js).

## 🎯 Project Description

Task Manager allows users to:
- Create, update, and delete tasks.
- Assign tasks to multiple users (Many-to-Many relationship).
- Register and log in securely (JWT Authentication).

This project is part of a class assignment to demonstrate:
✅ Authentication  
✅ Data Persistence  
✅ Many-to-Many Relationship  
✅ Hosting & Deployment

---

## 🔥 Live Links

- 🌐 **Backend (API)**: [https://taskmanger-app-1.onrender.com/](https://taskmanger-app-1.onrender.com/)
- 🌐 **Frontend**: *(You can add your frontend link here when deployed)*
- 🟢 **GitHub Repository**: *(Add your GitHub repo link here)*

---

## 🗂️ Features

- JWT Authentication (Signup / Login / Logout)
- Many-to-Many Relationship:  
  One Task can have multiple assigned users.
- REST API built with Node.js & Express.
- MongoDB Database (MongoDB Atlas).
- Sample Seed Data provided.

---

## 📄 Data Model

### User
```js
{
  name: String,
  email: String,
  password: String,
  ownedTasks: [taskIDs],
  assignedTasks: [taskIDs]
}
```

### Task
```js
{
  title: String,
  description: String,
  owner: userID,
  assignedUsers: [userIDs]
}
```

---

## 🚀 How to run locally

1. Clone the repository
2. Install dependencies:
```bash
cd backend
npm install
```
3. Add `.env` file:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
4. Run the server:
```bash
npm start
```
5. (Optional) Insert sample data:
```bash
node seed.js
```

---

## 📌 Assignment Notes

✅ **Many-to-Many Relationship** implemented in `task.js` model  
✅ **Authentication System** using JWT  
✅ **Primitive Route `/`** added as required  
✅ **Sample Data in `seed.js`**  
✅ **Project hosted on Render (Backend)**

---

## 👇 For Instructor Access

You can access the primitive homepage:
[https://taskmanger-app-1.onrender.com/](https://taskmanger-app-1.onrender.com/)

**Navigation links in GitHub Pages footer/header will point to this app.**
