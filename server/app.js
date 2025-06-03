require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const redisClient = require('./config/redis')
const neo4jDriver = require('./config/neo4j')
const errorHandler = require('./middleware/error')

const app = express()

// Connect to databases
connectDB()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(cookieParser())

// Add database clients to request object
app.use((req, res, next) => {
  req.redisClient = redisClient
  req.neo4jDriver = neo4jDriver
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Utility to warn if a full URL is used as a route path
function warnIfFullUrl(path) {
  if (typeof path === 'string' && path.match(/^https?:\/\//)) {
    console.warn(`⚠️  Warning: Attempted to use a full URL as a route path: ${path}`)
  }
}

// Wrap app.use to warn if a full URL is used as a route path
const originalAppUse = app.use.bind(app)
app.use = function(path, ...handlers) {
  warnIfFullUrl(path)
  return originalAppUse(path, ...handlers)
}

// API Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/cart', require('./routes/cart'))
app.use('/api/recommendations', require('./routes/recommendations'))

// 404 handler - Fixed for Express 5.x
// Use a regex pattern instead of '*' wildcard
app.use(/./, (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' })
})

// Error handler
app.use(errorHandler)

module.exports = app