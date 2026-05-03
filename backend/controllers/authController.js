const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
})

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured")
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  )
}

const validationMessage = (err) => {
  if (err.name !== "ValidationError") return null
  return Object.values(err.errors).map((error) => error.message).join(", ")
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const exists = await User.findOne({ email: normalizedEmail })
    if (exists) return res.status(409).json({ message: "User already exists" })

    const hashed = await bcrypt.hash(password, 10)
    const adminExists = await User.exists({ role: "Admin" })

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: adminExists ? "Member" : "Admin",
    })

    const token = signToken(user)

    return res.status(201).json({
      message: "User created",
      token,
      user: publicUser(user),
    })
  } catch (err) {
    const message = validationMessage(err)
    if (message) return res.status(400).json({ message })
    return res.status(500).json({ message: "Signup failed" })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password")
    if (!user) return res.status(401).json({ message: "Invalid email or password" })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: "Invalid email or password" })

    const token = signToken(user)

    return res.json({
      token,
      user: publicUser(user),
    })
  } catch (err) {
    return res.status(500).json({ message: "Login failed" })
  }
}

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: "User not found" })

  return res.json({ user: publicUser(user) })
}
