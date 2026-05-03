import { useEffect, useMemo, useState } from "react"
import API, { getApiError } from "../api/api"
import Navbar from "../components/Navbar"
import TaskCard from "../components/TaskCard"
import { getId, getStoredUser, isProjectAdmin } from "../utils/auth"

const defaultForm = {
  projectId: "",
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  assignedTo: "",
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const user = getStoredUser()

  const projectsById = useMemo(() => {
    const map = new Map()
    projects.forEach((project) => map.set(project._id, project))
    return map
  }, [projects])

  const selectedProject = projectsById.get(form.projectId)
  const canCreateTask = selectedProject && isProjectAdmin(selectedProject, user?.id)

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      try {
        const [projectRes, taskRes] = await Promise.all([
          API.get("/projects"),
          API.get("/tasks"),
        ])

        if (ignore) return

        const nextProjects = projectRes.data.projects || []
        const firstProject = nextProjects[0]
        setProjects(nextProjects)
        setTasks(taskRes.data.tasks || [])
        setForm((current) => {
          if (current.projectId || !firstProject) return current
          return {
            ...current,
            projectId: firstProject._id,
            assignedTo: getId(firstProject.members?.[0]?.user) || "",
          }
        })
        setError("")
      } catch (err) {
        if (!ignore) setError(getApiError(err, "Could not load tasks"))
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadData()

    return () => {
      ignore = true
    }
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateProjectField = (projectId) => {
    const project = projectsById.get(projectId)
    setForm((current) => ({
      ...current,
      projectId,
      assignedTo: getId(project?.members?.[0]?.user) || "",
    }))
  }

  const createTask = async (event) => {
    event.preventDefault()
    if (!form.projectId || !form.title.trim() || !form.dueDate || !form.assignedTo) {
      setError("Project, title, due date and assignee are required")
      return
    }

    setSaving(true)

    try {
      const res = await API.post("/tasks", form)
      setTasks((current) => [res.data.task, ...current])
      setForm((current) => ({
        ...defaultForm,
        projectId: current.projectId,
        assignedTo: current.assignedTo,
      }))
      setError("")
    } catch (err) {
      setError(getApiError(err, "Could not create task"))
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (taskId, status) => {
    try {
      const res = await API.patch(`/tasks/${taskId}/status`, { status })
      setTasks((current) =>
        current.map((task) => (task._id === taskId ? res.data.task : task)),
      )
      setError("")
    } catch (err) {
      setError(getApiError(err, "Could not update status"))
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`)
      setTasks((current) => current.filter((task) => task._id !== taskId))
      setError("")
    } catch (err) {
      setError(getApiError(err, "Could not delete task"))
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="page-title">
          <div>
            <p className="eyebrow">Work queue</p>
            <h1>Tasks</h1>
          </div>
        </div>

        {error && <p className="alert">{error}</p>}

        {projects.length > 0 && (
          <form className="panel task-form" onSubmit={createTask}>
            <label>
              Project
              <select
                value={form.projectId}
                onChange={(e) => updateProjectField(e.target.value)}
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Title
              <input
                disabled={!canCreateTask}
                placeholder="Prepare release checklist"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </label>

            <label className="wide-field">
              Description
              <textarea
                disabled={!canCreateTask}
                placeholder="Details"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </label>

            <label>
              Due date
              <input
                disabled={!canCreateTask}
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
              />
            </label>

            <label>
              Priority
              <select
                disabled={!canCreateTask}
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label>
              Assignee
              <select
                disabled={!canCreateTask}
                value={form.assignedTo}
                onChange={(e) => updateField("assignedTo", e.target.value)}
              >
                {selectedProject?.members?.map((member) => (
                  <option key={getId(member.user)} value={getId(member.user)}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-btn" disabled={!canCreateTask || saving} type="submit">
              {saving ? "Creating..." : "Create task"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="muted">Loading tasks...</p>
        ) : tasks.length ? (
          <section className="task-grid">
            {tasks.map((task) => {
              const taskProject = projectsById.get(getId(task.project))
              const canDelete = isProjectAdmin(taskProject, user?.id)

              return (
                <TaskCard
                  canDelete={canDelete}
                  key={task._id}
                  onDelete={deleteTask}
                  onStatusChange={updateStatus}
                  task={task}
                />
              )
            })}
          </section>
        ) : (
          <p className="muted">No tasks yet.</p>
        )}
      </main>
    </div>
  )
}
