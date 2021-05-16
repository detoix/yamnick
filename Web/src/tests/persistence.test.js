import '@testing-library/jest-dom/extend-expect'
import 'babel-polyfill';

const IdAssinedByPersistenceEngine = 88
const PostgresDocumentDBEngine = require('../server/persistence')
class PostgresDocumentDBEngineStub extends PostgresDocumentDBEngine {
  constructor () {
    super({}, { createIfNotExists: false });
    
    this.counter = 0
    this.db = (async () => {
      return {
        one: (query, values, callback) => callback({ ordering: IdAssinedByPersistenceEngine }),
      };
    })();
  }

  async persist (persistedEvent) {
    this.counter = this.counter + 1
    return super.persist(persistedEvent)
  }
}

test('new diagram id will be assigned if none provided', async () => {

  let dbEngine = new PostgresDocumentDBEngineStub(null)
  
  let newState = {
    data: {
      payload: {}
    }
  }

  await dbEngine.persist(newState)

  expect(dbEngine.counter).toBe(2)
  expect(newState).toMatchObject({
    key: `diagram:${IdAssinedByPersistenceEngine}`,
    data: {
      payload: {
        id: IdAssinedByPersistenceEngine
      }
    }
  })
})

test('existing diagram will be persisted with its id', async () => {

  let dbEngine = new PostgresDocumentDBEngineStub(null)
  
  let currentId = 91
  let newState = {
    data: {
      payload: {
        id: currentId
      }
    }
  }

  await dbEngine.persist(newState)

  expect(dbEngine.counter).toBe(1)
  expect(newState).toMatchObject({
    data: {
      payload: {
        id: currentId
      }
    }
  })
})