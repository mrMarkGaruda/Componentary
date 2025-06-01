const jwt = require('jsonwebtoken')
const User = require('../models/User')
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    next()
  } catch {
    res.status(401).json({ message: 'Unauthorized' })
  }
}