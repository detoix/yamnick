const express = require('express')
const http = require("http")
const socketIo = require("socket.io")
const socketioJwt = require('socketio-jwt')
const { start, configurePersistence, dispatch, spawnStateless, spawnPersistent } = require('nact')
const PostgresDocumentDBEngine = require('./persistence')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const sockets = new Set()
const system = start(configurePersistence(new PostgresDocumentDBEngine(process.env.DATABASE_URL)))

const diagramBehavior = async (state = {}, msg, ctx) => {
  console.log(`Diagram of id ${state.id} processing message of type ${msg.type}`)

  if (msg.type === "QUERY") {
    dispatch(msg.sender, { type: "DIAGRAM_PERSISTED", payload: state, sender: ctx.self })
  } else if (msg.type === "DIAGRAM") {

    if (!ctx.recovering) {
      await ctx.persist({ type: "DIAGRAM", payload: msg.payload })
      console.log(`Diagram of id ${msg.payload.id} persisted as ${msg.payload}`)
      dispatch(msg.sender, { type: "DIAGRAM_PERSISTED", payload: msg.payload, sender: ctx.self })  
    }

    return msg.payload
  }
}

const routerBehavior = (msg, ctx) => {
  console.log(`Gateway processing message of type ${msg.type}`)

  if (msg.type === "REQUEST") {
    if (msg.payload.queryForDiagram) {
      let diagram = spawnPersistent(
        router, diagramBehavior, `diagram:${msg.payload.queryForDiagram.id}`)
      dispatch(diagram, { type: "QUERY", payload: msg.payload.queryForDiagram, sender: ctx.self })
    } else if (msg.payload.diagram) {
      let diagram = spawnPersistent(
        router, diagramBehavior, `diagram:${msg.payload.diagram.id}`)
      dispatch(diagram, { type: "DIAGRAM", payload: msg.payload.diagram, sender: ctx.self })
    }
  } else if (msg.type === "DIAGRAM_PERSISTED") {

    for (let socket of sockets) {
      socket.emit("DIAGRAM_PERSISTED", msg.payload)
      console.log("Message emitted to client")
    }
  }
}

const openConnectionBetween = (socket, router) => {
  console.log("New client connected as", socket.decoded_token.sub)
  sockets.add(socket)
  
  socket.on("REQUEST_ISSUED", (data) => {
      console.log("Server forwarding request of", data)
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

const router = spawnStateless(system, routerBehavior)

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