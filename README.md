# Team Task Manager

A full-stack team task management web app built with React, Express, MongoDB, and JWT authentication.

## 🌐 Live Application

👉 https://team-task-manager-rouge-nine.vercel.app/

---

## 🚀 Features

* Signup and secure login (JWT authentication)
* Create and manage projects
* Add and remove project members
* Role-based access (Admin / Member)
* Create, assign, update, and delete tasks
* Task status tracking:

  * To Do
  * In Progress
  * Done
* Dashboard with:

  * Total tasks
  * Tasks by status
  * Tasks per user
  * Overdue tasks
* Secure API with protected routes

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs

### Database

* MongoDB Atlas

---

## ⚙️ Setup (Local Development)

### 1. Install dependencies

```bash
npm run install:all
```

---

### 2. Setup environment variables

Create a file:

```bash
backend/.env
```

Add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### 3. Run the app

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend runs on Vite, backend on `http://localhost:5000`

---

## 🏗 Production Build

```bash
npm run build
npm start
```

Open:

```
http://localhost:5000
```

---

## 🌍 Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* Database hosted on MongoDB Atlas

---

## 📌 Notes

* First registered user becomes **Admin**
* Admin can:

  * Create projects
  * Add members
  * Manage tasks
* Members can:

  * View assigned tasks
  * Update task status

---

## 👨‍💻 Author

Sunil Kumar
