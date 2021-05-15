const { PostgresPersistenceEngine } = require('nact-persistence-postgres')

module.exports = class PostgresDocumentDBEngine extends PostgresPersistenceEngine {
  async persist (persistedEvent) {
    const id = persistedEvent.data.payload.id
    const query = `
      INSERT INTO ${this.tablePrefix}event_journal (
        ${id ? 'ordering,' : ''}
        persistence_key,
        sequence_nr,
        created_at,
        data,
        tags
      ) VALUES (${id ? id + ', ' : ''}$/key/, $/sequenceNumber/, $/createdAt/, $/data:json/, $/tags/)
      ON CONFLICT (ordering)
      DO UPDATE SET data = $/data:json/, persistence_key = $/key/
      RETURNING ordering;
    `;
    return (await this.db).one(
      query, {
        key: persistedEvent.key,
        sequenceNumber: persistedEvent.sequenceNumber,
        createdAt: persistedEvent.createdAt,
        data: persistedEvent.data,
        tags: persistedEvent.tags
      },
      async persisted => {
        if (persistedEvent.data.payload.id) {
          //do nothing
        } else {
          persistedEvent.data.payload.id = persisted.ordering
          persistedEvent.key = `diagram:${persisted.ordering}`
          await this.persist(persistedEvent)
        }
      }
    )
  }
}