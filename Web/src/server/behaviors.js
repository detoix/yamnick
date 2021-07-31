const { dispatch, spawnPersistent } = require('nact')

const diagramBehavior = async (state = {}, msg, ctx) => {
  console.log(`Diagram of id ${state.id} processing message of type ${msg.type}`)

  if (msg.type === "QUERY") {
    let response = state
    if (Object.keys(state).length === 0) {
      response = {
        id: msg.payload.id,
        entities: [],
        relations: []
      }
    }

    dispatch(msg.sender, { type: "DIAGRAM_PERSISTED", payload: response, sender: ctx.self })
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

  if (msg.type === "DIAGRAM_PERSISTED" || msg.payload.pointerMoved) {
    for (let socket of sockets) {
      if (msg.payload.id == socket.diagramId || msg.payload.uuid == socket.diagramId) {
        socket.emit("DIAGRAM_PERSISTED", msg.payload)
      }
    }
  } else if (msg.type === "REQUEST") {
    if (msg.payload.queryForDiagram) {
      let diagram = spawnPersistent(
        ctx.self, diagramBehavior, `diagram:${msg.payload.queryForDiagram.id}`)
      dispatch(diagram, { type: "QUERY", payload: msg.payload.queryForDiagram, sender: ctx.self })
    } else if (msg.payload.diagram) {
      let diagram = spawnPersistent(
        ctx.self, diagramBehavior, `diagram:${msg.payload.diagram.id}`)
      dispatch(diagram, { type: "DIAGRAM", payload: msg.payload.diagram, sender: ctx.self })
    }
  }
}

module.exports = {
  diagramBehavior,
  routerBehavior
}