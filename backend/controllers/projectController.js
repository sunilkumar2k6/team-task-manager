const Project = require("../models/Project")
const Task = require("../models/Task")
const User = require("../models/User")
const { idsEqual, isProjectAdmin } = require("../utils/projectPermissions")

const projectPopulate = [
  { path: "createdBy", select: "name email role" },
  { path: "members.user", select: "name email role" },
]

const populateProject = (project) => project.populate(projectPopulate)

const validationMessage = (err) => {
  if (err.name !== "ValidationError") return null
  return Object.values(err.errors).map((error) => error.message).join(", ")
}

exports.createProject = async (req, res) => {
  try {
    const { name, description = "" } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ message: "Project name is required" })
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: "Admin" }],
    })

    await User.findByIdAndUpdate(req.user.id, { role: "Admin" })
    await populateProject(project)

    return res.status(201).json({
      project,
      currentUserRole: "Admin",
    })
  } catch (err) {
    const message = validationMessage(err)
    if (message) return res.status(400).json({ message })
    return res.status(500).json({ message: "Could not create project" })
  }
}

exports.getProjects = async (req, res) => {
  const projects = await Project.find({ "members.user": req.user.id })
    .populate(projectPopulate)
    .sort({ updatedAt: -1 })

  return res.json({ projects })
}

exports.getProject = async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    "members.user": req.user.id,
  }).populate(projectPopulate)

  if (!project) return res.status(404).json({ message: "Project not found" })

  return res.json({ project })
}

exports.addMember = async (req, res) => {
  try {
    const { email, role = "Member" } = req.body

    if (!email?.trim()) {
      return res.status(400).json({ message: "Member email is required" })
    }

    const project = await Project.findOne({
      _id: req.params.id,
      "members.user": req.user.id,
    })

    if (!project) return res.status(404).json({ message: "Project not found" })
    if (!isProjectAdmin(project, req.user.id)) {
      return res.status(403).json({ message: "Only project admins can add members" })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) return res.status(404).json({ message: "No user found with that email" })

    const alreadyMember = project.members.some((member) => idsEqual(member.user, user._id))
    if (alreadyMember) {
      return res.status(409).json({ message: "User is already a project member" })
    }

    const memberRole = role === "Admin" ? "Admin" : "Member"
    project.members.push({ user: user._id, role: memberRole })
    await project.save()

    if (memberRole === "Admin") {
      await User.findByIdAndUpdate(user._id, { role: "Admin" })
    }

    await populateProject(project)

    return res.json({ project })
  } catch (err) {
    return res.status(500).json({ message: "Could not add member" })
  }
}

exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params

    const project = await Project.findOne({
      _id: id,
      "members.user": req.user.id,
    })

    if (!project) return res.status(404).json({ message: "Project not found" })
    if (!isProjectAdmin(project, req.user.id)) {
      return res.status(403).json({ message: "Only project admins can remove members" })
    }

    if (idsEqual(project.createdBy, userId)) {
      return res.status(400).json({ message: "Project creator cannot be removed" })
    }

    const memberIndex = project.members.findIndex((member) => idsEqual(member.user, userId))
    if (memberIndex === -1) {
      return res.status(404).json({ message: "Member not found in this project" })
    }

    const adminCount = project.members.filter((member) => member.role === "Admin").length
    const removingLastAdmin = project.members[memberIndex].role === "Admin" && adminCount === 1
    if (removingLastAdmin) {
      return res.status(400).json({ message: "A project must have at least one admin" })
    }

    const openAssignedTasks = await Task.countDocuments({
      project: id,
      assignedTo: userId,
      status: { $ne: "Done" },
    })

    if (openAssignedTasks > 0) {
      return res.status(400).json({
        message: "Reassign or complete this member's open tasks before removing them",
      })
    }

    project.members.splice(memberIndex, 1)
    await project.save()
    await populateProject(project)

    return res.json({ project })
  } catch (err) {
    return res.status(500).json({ message: "Could not remove member" })
  }
}
