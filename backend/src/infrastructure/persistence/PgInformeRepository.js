const InformeRepository = require('../../domain/ports/InformeRepository');

class PgInformeRepository extends InformeRepository {
  constructor({ db }) {
    super();
    this.db = db;
  }

  async crearVersion({ id_auditoria, indicador_base, indice_ponderado, snapshot }) {
    return this.db.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext('informe'), $1)", [id_auditoria]);
      const { rows } = await client.query(
        `INSERT INTO informe (id_auditoria, version, indicador_base, indice_ponderado, snapshot)
         SELECT $1, COALESCE(MAX(version), 0) + 1, $2, $3, $4::jsonb
         FROM informe WHERE id_auditoria = $1
         RETURNING id_informe, id_auditoria, version, indicador_base::float AS indicador_base,
                   indice_ponderado::float AS indice_ponderado, generado_en`,
        [id_auditoria, indicador_base, indice_ponderado, JSON.stringify(snapshot)],
      );
      return rows[0];
    });
  }

  async listarVersiones(idAuditoria) {
    const { rows } = await this.db.query(
      `SELECT id_informe, version, indicador_base::float AS indicador_base,
              indice_ponderado::float AS indice_ponderado, generado_en
       FROM informe WHERE id_auditoria = $1 ORDER BY version DESC`,
      [idAuditoria],
    );
    return rows;
  }
}

module.exports = PgInformeRepository;
