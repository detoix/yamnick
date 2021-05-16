import '@testing-library/jest-dom/extend-expect'
import 'babel-polyfill';
import { diagramBehavior, routerBehavior } from '../server/behaviors.js'
import '../server/persistence'
import { dispatch, spawnStateless, spawnPersistent } from 'nact'

jest.mock('nact')
jest.mock('../server/persistence')

test('router forwards query to diagram actor', () => {

  let response = null
  let receiver = null
  let actorDiagramMock = {}

  spawnPersistent.mockImplementation((parent, behavior, id) => {
    return actorDiagramMock
  })

  dispatch.mockImplementation((actor, msg) => {
    receiver = actor
    response = msg
  })

  let msg = {
    type: "REQUEST",
    payload: { 
      queryForDiagram: {
        id: 99
      } 
    }
  }
  
  routerBehavior(null, msg, {})

  expect(receiver).toBe(actorDiagramMock)
  expect(response).toMatchObject({
    type: "QUERY",
    payload: msg.payload.queryForDiagram
  })
})

test('router forwards diagram to diagram actor', () => {

  let response = null
  let receiver = null
  let actorDiagramMock = {}

  spawnPersistent.mockImplementation((parent, behavior, id) => {
    return actorDiagramMock
  })

  dispatch.mockImplementation((actor, msg) => {
    receiver = actor
    response = msg
  })

  let msg = {
    type: "REQUEST",
    payload: { 
      diagram: {
        id: 99
      } 
    }
  }
  
  routerBehavior(null, msg, {})

  expect(receiver).toBe(actorDiagramMock)
  expect(response).toMatchObject({
    type: "DIAGRAM",
    payload: msg.payload.diagram
  })
})

test('router forwards pointer moved and diagram persisted events to all sockets', () => {

  let pointerMovedMsg = {
    type: "REQUEST",
    payload: { 
      pointerMoved: {} 
    }
  }

  let diagramPersistedMsg = {
    type: "DIAGRAM_PERSISTED",
    payload: {}
  }
  
  let handlerA = jest.fn()
  let socketA = {
    emit: handlerA
  }
  
  let handlerB = jest.fn()
  let socketB = {
    emit: handlerB
  }
  
  let sockets = new Set()
  sockets.add(socketA)
  sockets.add(socketB)

  routerBehavior(sockets, pointerMovedMsg, {})
  routerBehavior(sockets, diagramPersistedMsg, {})

  expect(handlerA).toHaveBeenNthCalledWith(1, "DIAGRAM_PERSISTED", pointerMovedMsg.payload)
  expect(handlerA).toHaveBeenNthCalledWith(2, "DIAGRAM_PERSISTED", diagramPersistedMsg.payload)
  expect(handlerB).toHaveBeenNthCalledWith(1, "DIAGRAM_PERSISTED", pointerMovedMsg.payload)
  expect(handlerB).toHaveBeenNthCalledWith(2, "DIAGRAM_PERSISTED", diagramPersistedMsg.payload)
})

test('diagram responses to query with current state', async () => {

  let response = null
  let receiver = null

  dispatch.mockImplementation((actor, msg) => {
    receiver = actor
    response = msg
  })

  let sender = {}
  let state = {}
  let msg = {
    type: "QUERY",
    sender: sender
  }

  await diagramBehavior(state, msg, {})

  expect(sender).toBe(receiver)
  expect(response.payload).toBe(state)
})