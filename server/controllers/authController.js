const User = require('../models/User')
const jwt = require('jsonwebtoken')
exports.signup = async (req, res) => {
  const { name, email, password } = req.body
  const user = new User({ name, email, password })
  await user.save()
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
}
exports.login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' })
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
}