const express = require('express');
const http = require("http");
const socketIo = require("socket.io");
const socketioJwt = require('socketio-jwt');
const { start, configurePersistence, dispatch, spawnStateless, spawnPersistent } = require('nact');
const { PostgresPersistenceEngine } = require('nact-persistence-postgres');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const sockets = new Set()

const connectionString = "postgres://xd:xd@localhost:5432/tmp?ssl=false"
const system = start(configurePersistence(new PostgresPersistenceEngine(connectionString)));



const diagramActor = (state = mockState, msg, ctx) => {   
  if (msg.type === "QUERY") {
    console.log('queried for', msg)
    dispatch(msg.sender, { type: "DIAGRAM", payload: state, sender: ctx.self });
  }
  // ctx.persist(msg)
  return msg
}

let mockState = {"id": 5000, "replyTo": "web_mailbox", "relations": [{"id": 0, "end": {"point": {"x": 364.0, "y": 237.0}, "entityHandle": {"entityId": 1, "snapNodeId": 4}}, "start": {"point": {"x": 642.0, "y": 546.0}, "entityHandle": {"entityId": 0, "snapNodeId": 0}}, "replyTo": null}], "classDefinitions": [{"x": 443.0, "y": 236.0, "id": 1, "name": null, "imageId": 0, "members": null, "replyTo": null}]}

const gateway = spawnStateless(
  system,
  (msg, ctx) => {
    if (msg.type === "REQUEST") {
      if (msg.payload.queryForDiagram) {
        let diagram = spawnPersistent(
          gateway, diagramActor, `diagram:${msg.payload.queryForDiagram.id}`)
        dispatch(diagram, { type: "QUERY", payload: msg.payload.queryForDiagram, sender: ctx.self })
      }
    } else if (msg.type === "DIAGRAM") {
      console.log('persisted', msg)

      for (let s of sockets) {
        s.emit("diagram_persisted", msg.payload)
        console.log("Message emitted to client")
      }
    }
  })

const openConnectionBetween = (socket, gateway) => {
  console.log("New client connected as", socket.decoded_token.sub);
  sockets.add(socket)
  
  socket.on("request_issued", (data) => {
      console.log("Server forwarding request of", data)
      dispatch(gateway, { type: "REQUEST", payload: JSON.parse(data) });
  });

  socket.on("disconnect", () => 
  {
      sockets.delete(socket)
      console.log("Client disconnected")
  });
  
  socket.emit("server_ready")
  console.log("Listening for queries...")
}

// if (process.env.DEV) { //TODO: use when user can create account
if (true) {
    io.on('connection', socket => {
        socket.decoded_token = {
            sub: "dupa1"
        }
        openConnectionBetween(socket, gateway)
    })
} else {
    io.on('connection', socketioJwt.authorize({
        secret: process.env.AUTH0_CLIENT_SECRET,
        timeout: 5000 // 5 seconds to send the authentication message
    }))
    io.on("authenticated", socket => openConnectionBetween(socket, channel))
}

const port = process.env.PORT || 8080;
app.use(express.static('dist'));
server.listen(port, () => console.log(`Listening on port ${port}`));