const { dispatch, spawnPersistent } = require('nact')

const diagramBehavior = async (state = {}, msg, ctx) => {
  console.log(`Diagram of id ${state.id} processing message of type ${msg.type}`)

  if (msg.type === "QUERY") {    
    dispatch(msg.sender, { type: "DIAGRAM_PERSISTED", payload: state, sender: ctx.self })
  } else if (msg.type === "DIAGRAM") {
    if (!ctx.recovering) {

      let idsInUse = new Set()
      idsInUse.add(0)
      if (state.entities) {
        state.entities
          .map(entity => entity.id)
          .forEach(entityId => idsInUse.add(entityId))
      }

      let availableId = Math.max(...idsInUse) + 1

      if (msg.payload.entities) {
        msg.payload.entities.forEach(entity => {
          if (!idsInUse.has(entity.id)) {
            entity.id = availableId
            availableId = availableId + 1
          }
        })
      }

      let requestId = msg.payload.id

      if (isNaN(msg.payload.id)) {
        msg.payload.id = null
      }
      
      await ctx.persist({ type: "DIAGRAM", payload: msg.payload })
      
      if (msg.payload.id != requestId) {
        msg.payload.uuid = requestId
      }

      console.log(`Diagram of id ${msg.payload.id} persisted`)
      dispatch(msg.sender, { type: "DIAGRAM_PERSISTED", payload: msg.payload, sender: ctx.self })  
    }

    return msg.payload
  }
}

const routerBehavior = (sockets, msg, ctx) => {

  if (msg.type === "REQUEST") {
    console.log(`Gateway processing message of type ${msg.type}`)

    if (msg.payload.queryForDiagram) {
      let diagram = spawnPersistent(
        ctx.self, diagramBehavior, `diagram:${msg.payload.queryForDiagram.id}`)
      dispatch(diagram, { type: "QUERY", payload: msg.payload.queryForDiagram, sender: ctx.self })
    } else if (msg.payload.diagram) {
      let diagram = spawnPersistent(
        ctx.self, diagramBehavior, `diagram:${msg.payload.diagram.id}`)
      dispatch(diagram, { type: "DIAGRAM", payload: msg.payload.diagram, sender: ctx.self })
    } else if (msg.payload.pointerMoved) {
      for (let socket of sockets) {
        socket.emit("DIAGRAM_PERSISTED", msg.payload)
      }
    }
  } else if (msg.type === "DIAGRAM_PERSISTED") {
    for (let socket of sockets) {
      socket.emit("DIAGRAM_PERSISTED", msg.payload)
      console.log("Message emitted to client")
    }
  }
}

module.exports = {
  diagramBehavior,
  routerBehavior
}