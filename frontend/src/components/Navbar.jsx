import { NavLink, useNavigate } from "react-router-dom"
import { clearSession, getStoredUser } from "../utils/auth"

export default function Navbar() {
  const navigate = useNavigate()
  const user = getStoredUser()

  const logout = () => {
    clearSession()
    navigate("/")
  }

  return (
    <header className="topbar">
      <div>
        <p className="brand">Team Task Manager</p>
        {user && (
          <p className="muted">
            {user.name} - {user.role}
          </p>
        )}
      </div>

      <nav className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
      </nav>

      <button className="ghost-btn" onClick={logout} type="button">
        Logout
      </button>
    </header>
  )
}
