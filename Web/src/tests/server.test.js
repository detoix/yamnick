import '@testing-library/jest-dom/extend-expect'
import 'babel-polyfill';
import { diagramBehavior, routerBehavior } from '../server/behaviors.js'
import '../server/persistence'
import { dispatch, spawnPersistent } from 'nact'

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

test('router forwards pointer moved and diagram persisted events to all subscribed sockets', () => {

  let currentDiagramId = 5001
  let pointerMovedMsg = {
    type: "REQUEST",
    payload: { 
      id: currentDiagramId,
      pointerMoved: {} 
    }
  }

  let diagramPersistedMsg = {
    type: "DIAGRAM_PERSISTED",
    payload: {
      id: currentDiagramId
    }
  }
  
  let handlerA = jest.fn()
  let socketA = {
    diagramId: currentDiagramId,
    emit: handlerA
  }
  
  let handlerB = jest.fn()
  let socketB = {
    diagramId: currentDiagramId,
    emit: handlerB
  }

  let handlerC = jest.fn()
  let socketC = {
    diagramId: 5002,
    emit: handlerC
  }
  
  let sockets = new Set()
  sockets.add(socketA)
  sockets.add(socketB)
  sockets.add(socketC)

  routerBehavior(sockets, pointerMovedMsg, {})
  routerBehavior(sockets, diagramPersistedMsg, {})

  expect(handlerA).toHaveBeenNthCalledWith(1, "DIAGRAM_PERSISTED", pointerMovedMsg.payload)
  expect(handlerA).toHaveBeenNthCalledWith(2, "DIAGRAM_PERSISTED", diagramPersistedMsg.payload)
  expect(handlerB).toHaveBeenNthCalledWith(1, "DIAGRAM_PERSISTED", pointerMovedMsg.payload)
  expect(handlerB).toHaveBeenNthCalledWith(2, "DIAGRAM_PERSISTED", diagramPersistedMsg.payload)
  expect(handlerC).toHaveBeenCalledTimes(0)
})

test('message will be returned when diagram not found', async () => {

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
    sender: sender,
    payload: {
      id: 2
    }
  }

  await diagramBehavior(state, msg, {})

  expect(sender).toBe(receiver)
  expect(response.payload).toMatchObject({
    id: msg.payload.id,
    entities: [],
    relations: []
  })
})

test('diagram responses to query with current state', async () => {

  let response = null
  let receiver = null

  dispatch.mockImplementation((actor, msg) => {
    receiver = actor
    response = msg
  })

  let sender = {}
  let state = {
    entities: [],
    relations: []
  }
  let msg = {
    type: "QUERY",
    sender: sender
  }

  await diagramBehavior(state, msg, {})

  expect(sender).toBe(receiver)
  expect(response.payload).toBe(state)
})

test('diagram saved for the first time gets new id and responses with request uuid', async () => {

  let response = null
  let receiver = null

  dispatch.mockImplementation((actor, msg) => {
    receiver = actor
    response = msg
  })

  let originalRequestId = 'not-a-number'
  let diagramIdAssinedByPersistenceEngine = 109

  let sender = {}
  let state = {}
  let ctx = {
    recovering: false,
    persist: newState => {
      newState.payload.id = diagramIdAssinedByPersistenceEngine
    }
  }
  let msg = {
    type: "DIAGRAM",
    sender: sender,
    payload: {
      id: originalRequestId,
    }
  }

  await diagramBehavior(state, msg, ctx)

  expect(sender).toBe(receiver)
  expect(response.payload).toBe(msg.payload)
  expect(response.payload).toMatchObject({
    id: diagramIdAssinedByPersistenceEngine,
    uuid: originalRequestId
  })
})

test('diagram actor assigns incrementing ids to entities during creating diagram', async () => {

  let persisted = null

  let sender = {}
  let state = {}
  let ctx = {
    recovering: false,
    persist: msg => {
      persisted = msg
    }
  }
  let msg = {
    type: "DIAGRAM",
    sender: sender,
    payload: {
      id: 'not-a-number',
      entities: [
        {}, {}, {}
      ]
    }
  }

  await diagramBehavior(state, msg, ctx)

  expect(persisted.payload).toMatchObject({
    entities: [
      { id: 1 },
      { id: 2 },
      { id: 3 }
    ]
  })
})

test('diagram actor assigns incrementing ids to new entities when some already exist in diagram', async () => {

  let persisted = null

  let sender = {}
  let state = {
    entities: [
      { id: 1 },
      { id: 3 }
    ]
  }
  let ctx = {
    recovering: false,
    persist: msg => {
      persisted = msg
    }
  }
  let msg = {
    type: "DIAGRAM",
    sender: sender,
    payload: {
      id: 9,
      entities: [
        {}, {}, {}
      ]
    }
  }

  await diagramBehavior(state, msg, ctx)

  expect(persisted.payload).toMatchObject({
    entities: [
      { id: 4 },
      { id: 5 },
      { id: 6 }
    ]
  })
})