const mongoose = require("mongoose")
const Project = require("../models/Project")
const { isProjectAdmin } = require("./projectPermissions")

const emptyScope = { _id: { $exists: false } }

const buildTaskScope = async (userId, projectId) => {
  const projects = await Project.find({ "members.user": userId }).select("_id members name")

  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return { scope: emptyScope, projects, notFound: true }
    }

    const project = projects.find((item) => item._id.toString() === projectId.toString())
    if (!project) return { scope: emptyScope, projects, notFound: true }

    if (isProjectAdmin(project, userId)) {
      return { scope: { project: project._id }, projects: [project], selectedProject: project }
    }

    return {
      scope: { project: project._id, assignedTo: userId },
      projects: [project],
      selectedProject: project,
    }
  }

  const adminProjectIds = projects
    .filter((project) => isProjectAdmin(project, userId))
    .map((project) => project._id)

  const memberProjectIds = projects
    .filter((project) => !isProjectAdmin(project, userId))
    .map((project) => project._id)

  const conditions = []
  if (adminProjectIds.length) conditions.push({ project: { $in: adminProjectIds } })
  if (memberProjectIds.length) {
    conditions.push({ project: { $in: memberProjectIds }, assignedTo: userId })
  }

  return {
    scope: conditions.length ? { $or: conditions } : emptyScope,
    projects,
  }
}

module.exports = { buildTaskScope }
