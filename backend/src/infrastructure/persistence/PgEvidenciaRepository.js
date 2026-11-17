const EvidenciaRepository = require('../../domain/ports/EvidenciaRepository');
const CodigoService = require('../../domain/services/CodigoService');
const { ORDEN_ISO } = require('./sql');

class PgEvidenciaRepository extends EvidenciaRepository {
  constructor({ db }) {
    super();
    this.db = db;
  }

  async crear(evidencia) {
    return this.db.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext('evidencia'), $1)", [evidencia.id_auditoria]);
      const { rows: seq } = await client.query(
        `SELECT COALESCE(MAX(substring(codigo FROM '[0-9]+$')::int), 0) + 1 AS siguiente
         FROM evidencia WHERE id_auditoria = $1`,
        [evidencia.id_auditoria],
      );
      const codigo = CodigoService.formatear('EV', seq[0].siguiente);
      const { rows } = await client.query(
        `INSERT INTO evidencia (codigo, id_auditoria, id_evaluacion, descripcion, fuente, tipo,
                                referencia_archivo, es_simulada, fecha_recoleccion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9::date, CURRENT_DATE))
         RETURNING id_evidencia, codigo, id_auditoria, id_evaluacion, descripcion, fuente, tipo,
                   referencia_archivo, es_simulada, to_char(fecha_recoleccion, 'YYYY-MM-DD') AS fecha_recoleccion, creado_en`,
        [
          codigo,
          evidencia.id_auditoria,
          evidencia.id_evaluacion,
          evidencia.descripcion,
          evidencia.fuente,
          evidencia.tipo,
          evidencia.referencia_archivo,
          evidencia.es_simulada,
          evidencia.fecha_recoleccion,
        ],
      );
      return rows[0];
    });
  }

  async listarPorAuditoria(idAuditoria) {
    const { rows } = await this.db.query(
      `SELECT e.id_evidencia, e.codigo, e.id_evaluacion, e.descripcion, e.fuente, e.tipo, e.referencia_archivo,
              e.es_simulada, to_char(e.fecha_recoleccion, 'YYYY-MM-DD') AS fecha_recoleccion, e.creado_en,
              c.codigo_iso, c.nombre AS control_nombre
       FROM evidencia e
       JOIN evaluacion_control ec ON ec.id_evaluacion = e.id_evaluacion
       JOIN control c ON c.id_control = ec.id_control
       WHERE e.id_auditoria = $1
       ORDER BY substring(e.codigo FROM '[0-9]+$')::int, ${ORDEN_ISO('c')}`,
      [idAuditoria],
    );
    return rows;
  }
}

module.exports = PgEvidenciaRepository;
