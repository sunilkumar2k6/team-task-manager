const router = require("express").Router()
const auth = require("../middleware/authMiddleware")

const {
  addMember,
  createProject,
  getProjects,
  getProject,
  removeMember,
} = require("../controllers/projectController")

router.post("/", auth, createProject)
router.get("/", auth, getProjects)
router.get("/:id", auth, getProject)
router.post("/:id/members", auth, addMember)
router.delete("/:id/members/:userId", auth, removeMember)

module.exports = router
