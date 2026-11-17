const ControlRepository = require('../../domain/ports/ControlRepository');
const { ORDEN_ISO } = require('./sql');

class PgControlRepository extends ControlRepository {
  constructor({ db }) {
    super();
    this.db = db;
  }

  async listarCatalogo(idAuditoria) {
    const { rows } = await this.db.query(
      `SELECT c.id_control, c.codigo_iso, c.nombre, c.categoria, c.criterio, c.pregunta_orientadora,
              ec.id_evaluacion, ec.estado, ec.observacion, ec.justificacion_na, ec.evaluado_en, ec.actualizado_en,
              (SELECT COUNT(*) FROM evidencia e WHERE e.id_evaluacion = ec.id_evaluacion) AS total_evidencias,
              (SELECT COUNT(*) FROM hallazgo h WHERE h.id_evaluacion = ec.id_evaluacion)  AS total_hallazgos
       FROM control c
       LEFT JOIN evaluacion_control ec
              ON ec.id_control = c.id_control AND ec.id_auditoria = $1
       ORDER BY ${ORDEN_ISO('c')}`,
      [idAuditoria],
    );
    return rows;
  }

  async buscarPorId(idControl) {
    const { rows } = await this.db.query(
      'SELECT id_control, codigo_iso, nombre, categoria, criterio, pregunta_orientadora FROM control WHERE id_control = $1',
      [idControl],
    );
    return rows[0] || null;
  }
}

module.exports = PgControlRepository;
