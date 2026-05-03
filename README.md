# Team Task Manager

A full-stack team task management web app built with React, Express, MongoDB, and JWT authentication.

## Features

- Signup and secure login
- Create projects
- Add and remove project members
- Project-level Admin and Member roles
- Create, assign, update, and delete tasks
- Task status tracking: To Do, In Progress, Done
- Dashboard with total tasks, status counts, tasks per user, and overdue tasks
- Production setup where Express serves the React build

## Tech Stack

- Frontend: React, Vite, Axios, React Router
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- Database: MongoDB

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create `backend/.env` from `backend/.env.example`.

3. Start MongoDB locally.

4. Build the frontend:

```bash
npm run build
```

5. Start the web app:

```bash
npm start
```

Open `http://localhost:5000`.

## Development

Run backend:

```bash
npm run dev:backend
```

Run frontend:

```bash
npm run dev:frontend
```

The frontend dev server runs on Vite and calls the backend API at `http://localhost:5000/api`.
