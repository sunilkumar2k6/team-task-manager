import { useEffect, useState } from "react"
import API, { getApiError } from "../api/api"
import Navbar from "../components/Navbar"
import {
  getId,
  getStoredUser,
  isProjectAdmin,
  updateStoredUser,
} from "../utils/auth"

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ name: "", description: "" })
  const [memberForms, setMemberForms] = useState({})
  const [user, setUser] = useState(getStoredUser())
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ignore = false

    const loadProjects = async () => {
      try {
        const res = await API.get("/projects")
        if (ignore) return
        setProjects(res.data.projects || [])
        setError("")
      } catch (err) {
        if (!ignore) setError(getApiError(err, "Could not load projects"))
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadProjects()

    return () => {
      ignore = true
    }
  }, [])

  const updateProject = (project) => {
    setProjects((current) =>
      current.map((item) => (item._id === project._id ? project : item)),
    )
  }

  const createProject = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError("Project name is required")
      return
    }

    setSaving(true)

    try {
      const res = await API.post("/projects", form)
      setProjects((current) => [res.data.project, ...current])
      setForm({ name: "", description: "" })
      if (res.data.currentUserRole) {
        setUser(updateStoredUser({ role: res.data.currentUserRole }))
      }
      setError("")
    } catch (err) {
      setError(getApiError(err, "Could not create project"))
    } finally {
      setSaving(false)
    }
  }

  const updateMemberForm = (projectId, field, value) => {
    setMemberForms((current) => ({
      ...current,
      [projectId]: {
        email: "",
        role: "Member",
        ...current[projectId],
        [field]: value,
      },
    }))
  }

  const addMember = async (event, projectId) => {
    event.preventDefault()
    const memberForm = memberForms[projectId] || { email: "", role: "Member" }

    try {
      const res = await API.post(`/projects/${projectId}/members`, memberForm)
      updateProject(res.data.project)
      setMemberForms((current) => ({
        ...current,
        [projectId]: { email: "", role: "Member" },
      }))
      setError("")
    } catch (err) {
      setError(getApiError(err, "Could not add member"))
    }
  }

  const removeMember = async (projectId, memberId) => {
    try {
      const res = await API.delete(`/projects/${projectId}/members/${memberId}`)
      updateProject(res.data.project)
      setError("")
    } catch (err) {
      setError(getApiError(err, "Could not remove member"))
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="page-title">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Projects</h1>
          </div>
        </div>

        {error && <p className="alert">{error}</p>}

        <form className="panel form-grid" onSubmit={createProject}>
          <label>
            Project name
            <input
              placeholder="Website launch"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Description
            <input
              placeholder="Optional"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <button className="primary-btn" disabled={saving} type="submit">
            {saving ? "Creating..." : "Create project"}
          </button>
        </form>

        {loading ? (
          <p className="muted">Loading projects...</p>
        ) : projects.length ? (
          <section className="project-grid">
            {projects.map((project) => {
              const admin = isProjectAdmin(project, user?.id)
              const memberForm = memberForms[project._id] || {
                email: "",
                role: "Member",
              }
              const creatorId = getId(project.createdBy)

              return (
                <article className="project-card" key={project._id}>
                  <div className="project-card-head">
                    <div>
                      <h2>{project.name}</h2>
                      {project.description && (
                        <p className="muted">{project.description}</p>
                      )}
                    </div>
                    <span className="count-pill">{project.members.length} members</span>
                  </div>

                  <div className="member-list">
                    {project.members.map((member) => {
                      const memberUser = member.user
                      const memberId = getId(memberUser)
                      const canRemove =
                        admin && memberId !== creatorId && memberId !== user?.id

                      return (
                        <div className="list-row" key={memberId}>
                          <div>
                            <strong>{memberUser.name}</strong>
                            <p className="muted">
                              {memberUser.email} - {member.role}
                            </p>
                          </div>
                          {canRemove && (
                            <button
                              className="danger-btn"
                              onClick={() => removeMember(project._id, memberId)}
                              type="button"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {admin && (
                    <form className="member-form" onSubmit={(e) => addMember(e, project._id)}>
                      <input
                        placeholder="member@example.com"
                        type="email"
                        value={memberForm.email}
                        onChange={(e) =>
                          updateMemberForm(project._id, "email", e.target.value)
                        }
                      />
                      <select
                        value={memberForm.role}
                        onChange={(e) =>
                          updateMemberForm(project._id, "role", e.target.value)
                        }
                      >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <button className="secondary-btn" type="submit">
                        Add member
                      </button>
                    </form>
                  )}
                </article>
              )
            })}
          </section>
        ) : (
          <p className="muted">No projects yet.</p>
        )}
      </main>
    </div>
  )
}
