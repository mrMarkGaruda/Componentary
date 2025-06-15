const User = require('../models/User')
const jwt = require('jsonwebtoken')
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    const user = new User({ name, email, password, role })
    await user.save()
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ message: 'Email already registered.' })
    }
    res.status(500).json({ message: 'Registration failed.' })
  }
}
exports.login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' })
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET)
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
}