import { useEffect, useState } from "react"
import API, { getApiError } from "../api/api"
import Navbar from "../components/Navbar"

const emptyDashboard = {
  total: 0,
  byStatus: {
    "To Do": 0,
    "In Progress": 0,
    Done: 0,
  },
  tasksPerUser: [],
  overdue: 0,
  completed: 0,
  pending: 0,
  productivity: 0,
  projectCount: 0,
}

export default function Dashboard() {
  const [data, setData] = useState(emptyDashboard)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await API.get("/dashboard")
        setData({ ...emptyDashboard, ...res.data })
      } catch (err) {
        setError(getApiError(err, "Could not load dashboard"))
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="page-title">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Dashboard</h1>
          </div>
        </div>

        {error && <p className="alert">{error}</p>}
        {loading ? (
          <p className="muted">Loading dashboard...</p>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <span>Total tasks</span>
                <strong>{data.total}</strong>
              </div>
              <div className="stat-card">
                <span>To Do</span>
                <strong>{data.byStatus?.["To Do"] || 0}</strong>
              </div>
              <div className="stat-card">
                <span>In Progress</span>
                <strong>{data.byStatus?.["In Progress"] || 0}</strong>
              </div>
              <div className="stat-card">
                <span>Done</span>
                <strong>{data.byStatus?.Done || 0}</strong>
              </div>
              <div className="stat-card">
                <span>Overdue</span>
                <strong>{data.overdue}</strong>
              </div>
              <div className="stat-card">
                <span>Projects</span>
                <strong>{data.projectCount}</strong>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <h2>Progress</h2>
                <div className="progress-track">
                  <span style={{ width: `${data.productivity}%` }} />
                </div>
                <p className="muted">
                  {data.completed} complete, {data.pending} pending
                </p>
              </div>

              <div className="panel">
                <h2>Tasks per user</h2>
                {data.tasksPerUser.length ? (
                  <div className="list">
                    {data.tasksPerUser.map((item) => (
                      <div className="list-row" key={item.userId}>
                        <div>
                          <strong>{item.name}</strong>
                          <p className="muted">{item.email}</p>
                        </div>
                        <span className="count-pill">{item.total}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No tasks yet.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
