const http = require('http')
const app = require('./app')
const { Server } = require('socket.io')
const connectDB = require('./config/db')

const server = http.createServer(app)
const io = new Server(server, { 
  cors: { 
    origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
    methods: ['GET', 'POST']
  } 
})

// Connect to the database
connectDB().then(() => {
  console.log('✅ Database connected successfully')
}).catch((error) => {
  console.error('❌ Database connection failed:', error.message)
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Make io available to the app
app.set('io', io)

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})