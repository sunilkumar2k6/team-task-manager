export const getToken = () => localStorage.getItem("token")

export const getStoredUser = () => {
  const value = localStorage.getItem("user")
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export const storeSession = ({ token, user }) => {
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))
  localStorage.setItem("role", user.role)
}

export const updateStoredUser = (updates) => {
  const user = getStoredUser()
  if (!user) return null

  const nextUser = { ...user, ...updates }
  localStorage.setItem("user", JSON.stringify(nextUser))
  localStorage.setItem("role", nextUser.role)
  return nextUser
}

export const clearSession = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("role")
}

export const getId = (value) => value?._id || value?.id || value

export const getProjectMembership = (project, userId) =>
  project?.members?.find((member) => getId(member.user) === userId)

export const isProjectAdmin = (project, userId) =>
  getProjectMembership(project, userId)?.role === "Admin"
