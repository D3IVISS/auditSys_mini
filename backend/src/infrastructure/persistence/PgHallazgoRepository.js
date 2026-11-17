const HallazgoRepository = require('../../domain/ports/HallazgoRepository');
const CodigoService = require('../../domain/services/CodigoService');

class PgHallazgoRepository extends HallazgoRepository {
  constructor({ db }) {
    super();
    this.db = db;
  }

  async crearConRecomendacion(hallazgo, recomendacion) {
    return this.db.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext('hallazgo'), $1)", [hallazgo.id_auditoria]);
      const { rows: seq } = await client.query(
        `SELECT COALESCE(MAX(substring(codigo FROM '[0-9]+$')::int), 0) + 1 AS siguiente
         FROM hallazgo WHERE id_auditoria = $1`,
        [hallazgo.id_auditoria],
      );
      const numero = seq[0].siguiente;

      const { rows: hRows } = await client.query(
        `INSERT INTO hallazgo (codigo, id_auditoria, id_evaluacion, condicion, criterio, causa, efecto_riesgo, severidad)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          CodigoService.formatear('H', numero),
          hallazgo.id_auditoria,
          hallazgo.id_evaluacion,
          hallazgo.condicion,
          hallazgo.criterio,
          hallazgo.causa,
          hallazgo.efecto_riesgo,
          hallazgo.severidad,
        ],
      );

      const { rows: rRows } = await client.query(
        `INSERT INTO recomendacion (codigo, id_hallazgo, descripcion, prioridad, plazo_dias)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          CodigoService.formatear('R', numero),
          hRows[0].id_hallazgo,
          recomendacion.descripcion,
          recomendacion.prioridad,
          recomendacion.plazo_dias,
        ],
      );

      return { hallazgo: hRows[0], recomendacion: rRows[0] };
    });
  }

  async listarPorAuditoria(idAuditoria) {
    const { rows } = await this.db.query(
      `SELECT h.id_hallazgo, h.codigo, h.id_evaluacion, h.condicion, h.criterio, h.causa, h.efecto_riesgo,
              h.severidad, h.creado_en,
              c.id_control, c.codigo_iso, c.nombre AS control_nombre, c.categoria, ec.estado AS estado_control,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id_recomendacion', r.id_recomendacion,
                    'codigo', r.codigo,
                    'descripcion', r.descripcion,
                    'prioridad', r.prioridad,
                    'plazo_dias', r.plazo_dias
                  ) ORDER BY r.id_recomendacion
                ) FILTER (WHERE r.id_recomendacion IS NOT NULL),
                '[]'::json
              ) AS recomendaciones
       FROM hallazgo h
       JOIN evaluacion_control ec ON ec.id_evaluacion = h.id_evaluacion
       JOIN control c ON c.id_control = ec.id_control
       LEFT JOIN recomendacion r ON r.id_hallazgo = h.id_hallazgo
       WHERE h.id_auditoria = $1
       GROUP BY h.id_hallazgo, c.id_control, ec.estado
       ORDER BY substring(h.codigo FROM '[0-9]+$')::int`,
      [idAuditoria],
    );
    return rows;
  }

  async conteoPorSeveridad(idAuditoria) {
    const { rows } = await this.db.query(
      'SELECT severidad, COUNT(*)::int AS total FROM hallazgo WHERE id_auditoria = $1 GROUP BY severidad',
      [idAuditoria],
    );
    return rows;
  }
}

module.exports = PgHallazgoRepository;
