const Project = require("../models/Project")

const idsEqual = (left, right) => left?.toString() === right?.toString()

const getMembership = (project, userId) =>
  project.members.find((member) => idsEqual(member.user?._id || member.user, userId))

const isProjectAdmin = (project, userId) => {
  const membership = getMembership(project, userId)
  return Boolean(membership && membership.role === "Admin")
}

const isProjectMember = (project, userId) => Boolean(getMembership(project, userId))

const loadProjectForUser = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    "members.user": userId,
  })

  return project
}

module.exports = {
  getMembership,
  idsEqual,
  isProjectAdmin,
  isProjectMember,
  loadProjectForUser,
}
