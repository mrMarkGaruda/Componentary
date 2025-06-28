// Load environment variables first
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const http = require('http')
const socketIo = require('socket.io')
const jwt = require('jsonwebtoken')
const connectDB = require('./config/db')
let redisClient = require('./config/redis')
const Chat = require('./models/Chat')
// Don't load neo4j here - it will be loaded after env vars are verified
const errorHandler = require('./middleware/error')

const app = express()
const server = http.createServer(app)

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:5000', 'http://localhost:5000', 'http://client:5000'],
    credentials: true
  }
})

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const User = require('./models/User')
    const user = await User.findById(decoded.id)
    
    if (!user) {
      return next(new Error('Authentication error'))
    }
    
    socket.userId = user._id.toString()
    socket.user = user
    next()
  } catch (error) {
    next(new Error('Authentication error'))
  }
})

// Socket.IO connection handling
const activeConnections = new Map(); // Track active connections per user

io.on('connection', (socket) => {
  console.log(`User ${socket.user.name} connected`);
  
  // Track active connections to prevent multiple connections per user
  const existingConnection = activeConnections.get(socket.userId);
  if (existingConnection) {
    existingConnection.disconnect();
  }
  activeConnections.set(socket.userId, socket);
  
  // Join user to their own room
  socket.join(socket.userId);
  
  socket.on('join-chat', ({ userId, sellerId }) => {
    const chatRoom = [userId, sellerId].sort().join('-')
    socket.join(chatRoom)
    console.log(`User joined chat room: ${chatRoom}`)
  })
  
  socket.on('send-message', async ({ recipientId, content }) => {
    try {
      // Validate input
      if (!recipientId || !content || content.trim() === '') {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      let chat = await Chat.findOne({
        participants: { $all: [socket.userId, recipientId] }
      });
      
      if (!chat) {
        chat = new Chat({
          participants: [socket.userId, recipientId],
          messages: []
        });
      }
      
      const newMessage = {
        sender: socket.userId,
        content: content.trim(),
        timestamp: new Date(),
        read: false
      };
      
      chat.messages.push(newMessage);
      chat.lastMessage = new Date();
      
      await chat.save();
      await chat.populate('messages.sender', 'name email');
      
      const savedMessage = chat.messages[chat.messages.length - 1];
      
      // Send to both users in the chat room
      const chatRoom = [socket.userId, recipientId].sort().join('-');
      io.to(chatRoom).emit('new-message', savedMessage);
      
      console.log(`Message saved and sent to room ${chatRoom}`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.name} disconnected`);
    activeConnections.delete(socket.userId);
  });
})

// Environment variables are already loaded at the top
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  NEO4J_URI: process.env.NEO4J_URI,
  NEO4J_USER: process.env.NEO4J_USER,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN
})

// Now load Neo4j after environment variables are confirmed
let neo4jDriver = null
try {
  neo4jDriver = require('./config/neo4j')
  console.log('✅ Neo4j driver loaded successfully')
} catch (error) {
  console.error('❌ Failed to load Neo4j driver:', error.message)
}

// Connect to databases
connectDB()

// Middleware
app.use(cors({
  origin: [process.env.CORS_ORIGIN || 'http://localhost:5000', 'http://localhost:5000', 'http://client:5000'],
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
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: 'connected',
      neo4j: neo4jDriver ? 'connected' : 'disconnected',
      redis: 'checking...'
    }
  }
  
  // Check Redis connection
  try {
    await req.redisClient.ping?.() || 'OK'
    health.services.redis = 'connected'
  } catch (error) {
    health.services.redis = 'disconnected (mock mode)'
  }
  
  res.json(health)
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
app.use('/api/admin', require('./routes/admin'))
app.use('/api/seller', require('./routes/seller'))
app.use('/api/user', require('./routes/user'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/website-helper', require('./routes/websiteHelper'))

// 404 handler - Use '*' string instead of regex to avoid path-to-regexp error
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' })
})

// Error handler
app.use(errorHandler)

// Make io available to routes
app.set('io', io)

module.exports = app

// Export both app and server for server.js
module.exports.server = server