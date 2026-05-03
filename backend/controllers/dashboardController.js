const Task = require("../models/Task")
const { buildTaskScope } = require("../utils/taskScope")

const statusTemplate = {
  "To Do": 0,
  "In Progress": 0,
  Done: 0,
}

exports.getDashboard = async (req, res) => {
  const { scope, projects } = await buildTaskScope(req.user.id)

  const tasks = await Task.find(scope)
    .populate({ path: "assignedTo", select: "name email" })
    .populate({ path: "project", select: "name" })

  const byStatus = { ...statusTemplate }
  const tasksPerUserMap = new Map()
  const now = new Date()

  tasks.forEach((task) => {
    byStatus[task.status] = (byStatus[task.status] || 0) + 1

    const assigneeId = task.assignedTo?._id?.toString() || "unassigned"
    const current = tasksPerUserMap.get(assigneeId) || {
      userId: assigneeId,
      name: task.assignedTo?.name || "Unassigned",
      email: task.assignedTo?.email || "",
      total: 0,
    }

    current.total += 1
    tasksPerUserMap.set(assigneeId, current)
  })

  const overdue = tasks.filter(
    (task) => task.dueDate && task.dueDate < now && task.status !== "Done",
  ).length

  const completed = byStatus.Done
  const total = tasks.length

  return res.json({
    total,
    byStatus,
    tasksPerUser: Array.from(tasksPerUserMap.values()).sort((a, b) => b.total - a.total),
    overdue,
    completed,
    pending: total - completed,
    productivity: total ? Number(((completed / total) * 100).toFixed(1)) : 0,
    projectCount: projects.length,
  })
}
