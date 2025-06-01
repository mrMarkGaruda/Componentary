const http = require('http')
const app = require('./app')
const { Server } = require('socket.io')
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })
io.on('connection', socket => {})
app.set('io', io)
const PORT = process.env.PORT || 5000
server.listen(PORT)