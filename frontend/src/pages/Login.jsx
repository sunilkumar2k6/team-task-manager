import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API, { getApiError } from "../api/api"
import { storeSession } from "../utils/auth"

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await API.post("/auth/login", form)
      storeSession(res.data)
      navigate("/dashboard")
    } catch (err) {
      setError(getApiError(err, "Login failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-panel" onSubmit={handleLogin}>
        <div>
          <p className="eyebrow">Team Task Manager</p>
          <h1>Login</h1>
        </div>

        {error && <p className="alert">{error}</p>}

        <label>
          Email
          <input
            autoComplete="email"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            placeholder="Enter password"
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
          />
        </label>

        <button className="primary-btn" disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  )
}
