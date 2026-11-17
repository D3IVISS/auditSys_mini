const EvaluacionRepository = require('../../domain/ports/EvaluacionRepository');
const { ORDEN_ISO } = require('./sql');

const SELECT_EVALUACION = `
  SELECT ec.id_evaluacion, ec.id_auditoria, ec.id_control, ec.estado, ec.observacion, ec.justificacion_na,
         ec.evaluado_en, ec.actualizado_en,
         c.codigo_iso, c.nombre AS control_nombre, c.categoria, c.criterio, c.pregunta_orientadora
  FROM evaluacion_control ec
  JOIN control c ON c.id_control = ec.id_control
`;

class PgEvaluacionRepository extends EvaluacionRepository {
  constructor({ db }) {
    super();
    this.db = db;
  }

  async guardar({ id_auditoria, id_control, estado, observacion, justificacion_na }) {
    const { rows } = await this.db.query(
      `INSERT INTO evaluacion_control (id_auditoria, id_control, estado, observacion, justificacion_na)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id_auditoria, id_control)
       DO UPDATE SET estado = EXCLUDED.estado,
                     observacion = EXCLUDED.observacion,
                     justificacion_na = EXCLUDED.justificacion_na
       RETURNING id_evaluacion, id_auditoria, id_control, estado, observacion, justificacion_na, evaluado_en, actualizado_en`,
      [id_auditoria, id_control, estado, observacion, justificacion_na],
    );
    return rows[0];
  }

  async buscarPorId(idEvaluacion) {
    const { rows } = await this.db.query(`${SELECT_EVALUACION} WHERE ec.id_evaluacion = $1`, [idEvaluacion]);
    return rows[0] || null;
  }

  async buscarPorAuditoriaControl(idAuditoria, idControl) {
    const { rows } = await this.db.query(
      `${SELECT_EVALUACION} WHERE ec.id_auditoria = $1 AND ec.id_control = $2`,
      [idAuditoria, idControl],
    );
    return rows[0] || null;
  }

  async contarDependencias(idEvaluacion) {
    const { rows } = await this.db.query(
      `SELECT (SELECT COUNT(*) FROM evidencia WHERE id_evaluacion = $1)::int AS evidencias,
              (SELECT COUNT(*) FROM hallazgo  WHERE id_evaluacion = $1)::int AS hallazgos`,
      [idEvaluacion],
    );
    return rows[0];
  }

  async conteosPorCategoria(idAuditoria) {
    const { rows } = await this.db.query(
      `SELECT c.categoria, ec.estado, COUNT(*)::int AS total
       FROM control c
       LEFT JOIN evaluacion_control ec ON ec.id_control = c.id_control AND ec.id_auditoria = $1
       GROUP BY c.categoria, ec.estado`,
      [idAuditoria],
    );
    return rows;
  }

  async listarDetalle(idAuditoria) {
    const { rows } = await this.db.query(
      `${SELECT_EVALUACION} WHERE ec.id_auditoria = $1 ORDER BY ${ORDEN_ISO('c')}`,
      [idAuditoria],
    );
    return rows;
  }
}

module.exports = PgEvaluacionRepository;
