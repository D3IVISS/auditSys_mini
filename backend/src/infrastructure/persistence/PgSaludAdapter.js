const SaludPort = require('../../domain/ports/SaludPort');

class PgSaludAdapter extends SaludPort {
  constructor({ db }) {
    super();
    this.db = db;
  }

  async verificarBaseDatos() {
    const inicio = process.hrtime.bigint();
    const { rows } = await this.db.query(
      "SELECT NOW() AS servidor_tiempo, current_database() AS base, split_part(version(), ' ', 2) AS version",
    );
    const latencia = Number(process.hrtime.bigint() - inicio) / 1e6;
    return {
      motor: 'PostgreSQL',
      version: rows[0].version,
      base: rows[0].base,
      servidor_tiempo: rows[0].servidor_tiempo,
      latencia_ms: Math.round(latencia * 10) / 10,
    };
  }
}

module.exports = PgSaludAdapter;
