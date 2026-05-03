import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Projects from "./pages/Projects"
import Signup from "./pages/Signup"
import Tasks from "./pages/Tasks"
import { getToken } from "./utils/auth"

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/" replace />
}

function PublicRoute({ children }) {
  return getToken() ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
