import '@testing-library/jest-dom/extend-expect'
import 'babel-polyfill';
import { diagramBehavior, routerBehavior } from '../server/behaviors.js'
import '../server/persistence'
import { start, configurePersistence, dispatch, spawnStateless, spawnPersistent } from 'nact'

jest.mock('nact')
jest.mock('../server/persistence')

test('router forwards pointer moved event to all sockets', () => {

  let msg = {
    type: "REQUEST",
    payload: { 
      pointerMoved: {} 
    }
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

  routerBehavior(sockets, msg, {})

  expect(handlerA).toHaveBeenCalledTimes(1)
  expect(handlerB).toHaveBeenCalledTimes(1)
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