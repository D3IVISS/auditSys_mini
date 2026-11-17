const AuditoriaRepository = require('../../domain/ports/AuditoriaRepository');

const SELECT_AUDITORIA = `
  SELECT a.id_auditoria, a.organizacion, a.objetivo, a.alcance, a.referentes,
         to_char(a.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
         to_char(a.fecha_fin, 'YYYY-MM-DD')    AS fecha_fin,
         a.estado, a.id_auditor, u.nombre AS auditor_nombre, u.correo AS auditor_correo,
         a.creado_en, a.actualizado_en
  FROM auditoria a
  JOIN usuario u ON u.id_usuario = a.id_auditor
`;

class PgAuditoriaRepository extends AuditoriaRepository {
  constructor({ db }) {
    super();
    this.db = db;
  }

  async listarConResumen() {
    const { rows } = await this.db.query(`
      SELECT base.*,
             COALESCE(ev.implementados, 0)    AS implementados,
             COALESCE(ev.parciales, 0)        AS parciales,
             COALESCE(ev.no_implementados, 0) AS no_implementados,
             COALESCE(ev.no_aplicables, 0)    AS no_aplicables,
             COALESCE(h.total, 0)             AS total_hallazgos
      FROM (${SELECT_AUDITORIA}) base
      LEFT JOIN (
        SELECT id_auditoria,
               COUNT(*) FILTER (WHERE estado = 'IMPLEMENTADO')    AS implementados,
               COUNT(*) FILTER (WHERE estado = 'PARCIAL')         AS parciales,
               COUNT(*) FILTER (WHERE estado = 'NO_IMPLEMENTADO') AS no_implementados,
               COUNT(*) FILTER (WHERE estado = 'NO_APLICABLE')    AS no_aplicables
        FROM evaluacion_control
        GROUP BY id_auditoria
      ) ev ON ev.id_auditoria = base.id_auditoria
      LEFT JOIN (
        SELECT id_auditoria, COUNT(*) AS total FROM hallazgo GROUP BY id_auditoria
      ) h ON h.id_auditoria = base.id_auditoria
      ORDER BY base.creado_en DESC, base.id_auditoria DESC
    `);
    return rows;
  }

  async buscarPorId(idAuditoria) {
    const { rows } = await this.db.query(`${SELECT_AUDITORIA} WHERE a.id_auditoria = $1`, [idAuditoria]);
    return rows[0] || null;
  }

  async crear(auditoria) {
    const { rows } = await this.db.query(
      `INSERT INTO auditoria (organizacion, objetivo, alcance, referentes, fecha_inicio, fecha_fin, estado, id_auditor)
       VALUES ($1, $2, $3, COALESCE($4, 'ISO 19011:2018; ISO/IEC 27001:2022; ISO/IEC 27002:2022'), $5, $6, $7, $8)
       RETURNING id_auditoria`,
      [
        auditoria.organizacion,
        auditoria.objetivo,
        auditoria.alcance,
        auditoria.referentes,
        auditoria.fecha_inicio,
        auditoria.fecha_fin,
        auditoria.estado,
        auditoria.id_auditor,
      ],
    );
    return this.buscarPorId(rows[0].id_auditoria);
  }
}

module.exports = PgAuditoriaRepository;
