const Project = require("../models/Project")
const Task = require("../models/Task")
const { buildTaskScope } = require("../utils/taskScope")
const { idsEqual, isProjectAdmin, isProjectMember } = require("../utils/projectPermissions")

const taskPopulate = [
  { path: "project", select: "name" },
  { path: "assignedTo", select: "name email role" },
  { path: "createdBy", select: "name email role" },
]

const allowedPriorities = ["Low", "Medium", "High"]
const allowedStatuses = ["To Do", "In Progress", "Done"]

const populateTask = (task) => task.populate(taskPopulate)

const validationMessage = (err) => {
  if (err.name === "ValidationError") {
    return Object.values(err.errors).map((error) => error.message).join(", ")
  }

  if (err.name === "CastError") return "Invalid id"

  return null
}

const loadProject = async (projectId) => Project.findById(projectId)

const validateAssignedMember = (project, assignedTo) => {
  if (!assignedTo) return "Assigned user is required"
  if (!isProjectMember(project, assignedTo)) {
    return "Assigned user must be a member of the project"
  }
  return null
}

exports.createTask = async (req, res) => {
  try {
    const {
      projectId,
      project: projectFromBody,
      title,
      description = "",
      dueDate,
      priority = "Medium",
      assignedTo,
      status = "To Do",
    } = req.body

    const project = await loadProject(projectId || projectFromBody)
    if (!project) return res.status(404).json({ message: "Project not found" })

    if (!isProjectAdmin(project, req.user.id)) {
      return res.status(403).json({ message: "Only project admins can create tasks" })
    }

    const assignedMemberError = validateAssignedMember(project, assignedTo)
    if (assignedMemberError) return res.status(400).json({ message: assignedMemberError })

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({ message: "Priority must be Low, Medium or High" })
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be To Do, In Progress or Done" })
    }

    const task = await Task.create({
      project: project._id,
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      status,
      createdBy: req.user.id,
    })

    await populateTask(task)

    return res.status(201).json({ task })
  } catch (err) {
    const message = validationMessage(err)
    if (message) return res.status(400).json({ message })
    return res.status(500).json({ message: "Could not create task" })
  }
}

exports.getTasks = async (req, res) => {
  const { scope, notFound } = await buildTaskScope(req.user.id, req.query.projectId)
  if (notFound) return res.status(404).json({ message: "Project not found" })

  const tasks = await Task.find(scope)
    .populate(taskPopulate)
    .sort({ dueDate: 1, createdAt: -1 })

  return res.json({ tasks })
}

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: "Task not found" })

    const project = await Project.findOne({
      _id: task.project,
      "members.user": req.user.id,
    })

    if (!project) return res.status(404).json({ message: "Task not found" })

    const admin = isProjectAdmin(project, req.user.id)
    const assignedToCurrentUser = idsEqual(task.assignedTo, req.user.id)

    if (!admin && !assignedToCurrentUser) {
      return res.status(403).json({ message: "You can only update tasks assigned to you" })
    }

    if (!admin) {
      const extraFields = Object.keys(req.body).filter((field) => field !== "status")
      if (extraFields.length) {
        return res.status(403).json({ message: "Members can only update task status" })
      }
    }

    const updates = admin
      ? ["title", "description", "dueDate", "priority", "status", "assignedTo"]
      : ["status"]

    if (req.body.priority && !allowedPriorities.includes(req.body.priority)) {
      return res.status(400).json({ message: "Priority must be Low, Medium or High" })
    }

    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Status must be To Do, In Progress or Done" })
    }

    if (req.body.assignedTo) {
      const assignedMemberError = validateAssignedMember(project, req.body.assignedTo)
      if (assignedMemberError) return res.status(400).json({ message: assignedMemberError })
    }

    updates.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field]
    })

    await task.save()
    await populateTask(task)

    return res.json({ task })
  } catch (err) {
    const message = validationMessage(err)
    if (message) return res.status(400).json({ message })
    return res.status(500).json({ message: "Could not update task" })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: "Task not found" })

    const project = await Project.findOne({
      _id: task.project,
      "members.user": req.user.id,
    })

    if (!project) return res.status(404).json({ message: "Task not found" })
    if (!isProjectAdmin(project, req.user.id)) {
      return res.status(403).json({ message: "Only project admins can delete tasks" })
    }

    await task.deleteOne()

    return res.json({ message: "Task deleted" })
  } catch (err) {
    const message = validationMessage(err)
    if (message) return res.status(400).json({ message })
    return res.status(500).json({ message: "Could not delete task" })
  }
}
