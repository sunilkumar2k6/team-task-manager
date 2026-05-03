const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const connectDB = require("./config/db")

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/projects", require("./routes/projectRoutes"))
app.use("/api/tasks", require("./routes/taskRoutes"))
app.use("/api/dashboard", require("./routes/dashboardRoutes"))

const frontendDist = path.join(__dirname, "..", "frontend", "dist")
const frontendIndex = path.join(frontendDist, "index.html")

if (fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist))
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(frontendIndex)
  })
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: "Server error" })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
