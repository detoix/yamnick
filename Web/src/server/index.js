const express = require('express')
const http = require("http")
const socketIo = require("socket.io")
const socketioJwt = require('socketio-jwt')
const { start, configurePersistence, dispatch, spawnStateless } = require('nact')
const PostgresDocumentDBEngine = require('./persistence')
const { routerBehavior}  = require('./behaviors')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const sockets = new Set()
const system = start(configurePersistence(new PostgresDocumentDBEngine(process.env.HEROKU_POSTGRESQL_ONYX_URL)))

const openConnectionBetween = (socket, router) => {
  console.log("New client connected as", socket.decoded_token.sub)
  sockets.add(socket)
  
  socket.on("REQUEST_ISSUED", (data) => {
      dispatch(router, { type: "REQUEST", payload: JSON.parse(data) })
  })

  socket.on("disconnect", () => 
  {
      sockets.delete(socket)
      console.log("Client disconnected")
  })
  
  socket.emit("SERVER_READY")
  console.log("Listening for queries...")
}

const router = spawnStateless(system, (msg, ctx) => routerBehavior(sockets, msg, ctx))

// if (process.env.DEV) { //TODO: use when user can create account
if (true) {
    io.on('connection', socket => {
        socket.decoded_token = {
            sub: "dupa1"
        }
        openConnectionBetween(socket, router)
    })
} else {
    io.on('connection', socketioJwt.authorize({
        secret: process.env.AUTH0_CLIENT_SECRET,
        timeout: 5000 // 5 seconds to send the authentication message
    }))
    io.on("authenticated", socket => openConnectionBetween(socket, channel))
}

const port = process.env.PORT || 8080
app.use(express.static('dist'))
server.listen(port, () => console.log(`Listening on port ${port}`))