import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API, { getApiError } from "../api/api"
import { storeSession } from "../utils/auth"

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    setError("")

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email and password are required")
      return
    }

    setLoading(true)

    try {
      const res = await API.post("/auth/signup", form)
      storeSession(res.data)
      navigate("/dashboard")
    } catch (err) {
      setError(getApiError(err, "Signup failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-panel" onSubmit={handleSignup}>
        <div>
          <p className="eyebrow">Team Task Manager</p>
          <h1>Signup</h1>
        </div>

        {error && <p className="alert">{error}</p>}

        <label>
          Name
          <input
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </label>

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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
          />
        </label>

        <button className="primary-btn" disabled={loading} type="submit">
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="auth-switch">
          Already registered? <Link to="/">Login</Link>
        </p>
      </form>
    </main>
  )
}
