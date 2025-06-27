const { server } = require('./app')
const connectDB = require('./config/db')

// Connect to the database
connectDB().then(() => {
  console.log('✅ Database connected successfully')
}).catch((error) => {
  console.error('❌ Database connection failed:', error.message)
})

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