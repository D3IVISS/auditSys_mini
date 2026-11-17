const { Pool } = require('pg');
const { buildConnectionConfig } = require('./connectionConfig');

/**
 * Adaptador de conexión. Expone `query` y `transaction` para que los
 * repositorios no dependan directamente del Pool (inversión de dependencias).
 */
class PostgresDatabase {
  constructor({ databaseUrl, ssl }) {
    this.pool = new Pool({
      ...buildConnectionConfig(databaseUrl, ssl),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      application_name: 'auditsys-mini-api',
    });
    this.pool.on('error', (error) => {
      console.error('[db] Error inesperado en cliente inactivo:', error.message);
    });
  }

  query(text, params = []) {
    return this.pool.query(text, params);
  }

  async transaction(work) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  close() {
    return this.pool.end();
  }
}

module.exports = PostgresDatabase;
