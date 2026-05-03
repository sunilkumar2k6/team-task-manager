const statusOptions = ["To Do", "In Progress", "Done"]

const formatDate = (value) => {
  if (!value) return "No due date"
  return new Date(value).toLocaleDateString()
}

export default function TaskCard({
  canDelete,
  onDelete,
  onStatusChange,
  task,
}) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done"

  return (
    <article className={`task-card ${isOverdue ? "task-card-overdue" : ""}`}>
      <div className="task-card-head">
        <div>
          <p className="eyebrow">{task.project?.name || "Project"}</p>
          <h3>{task.title}</h3>
        </div>
        <span className={`priority priority-${task.priority?.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <dl className="task-meta">
        <div>
          <dt>Assignee</dt>
          <dd>{task.assignedTo?.name || "Unassigned"}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{formatDate(task.dueDate)}</dd>
        </div>
      </dl>

      <div className="task-actions">
        <label>
          Status
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task._id, event.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        {canDelete && (
          <button className="danger-btn" onClick={() => onDelete(task._id)} type="button">
            Delete
          </button>
        )}
      </div>
    </article>
  )
}
