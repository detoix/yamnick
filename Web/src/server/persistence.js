const { PostgresPersistenceEngine } = require('nact-persistence-postgres')

module.exports = class PostgresDocumentDBEngine extends PostgresPersistenceEngine {
  async persist (persistedEvent) {
    const query = `
      INSERT INTO ${this.tablePrefix}event_journal (
        ordering,
        persistence_key,
        sequence_nr,
        created_at,
        data,
        tags
      ) VALUES (${persistedEvent.data.payload.id}, $/key/, $/sequenceNumber/, $/createdAt/, $/data:json/, $/tags/)
      ON CONFLICT (ordering)
      DO UPDATE SET data = $/data:json/
      RETURNING ordering;
    `;
    return (await this.db).one(
      query, {
        key: persistedEvent.key,
        sequenceNumber: persistedEvent.sequenceNumber,
        createdAt: persistedEvent.createdAt,
        data: persistedEvent.data,
        tags: persistedEvent.tags
      }
    )
  }
}