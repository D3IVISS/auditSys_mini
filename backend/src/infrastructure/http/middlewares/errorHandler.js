const { DomainError } = require('../../../domain/errors');

const PG_ERRORES = {
  '23505': { status: 409, code: 'DUPLICATE', message: 'El registro ya existe (restricción de unicidad).' },
  '23503': { status: 422, code: 'FOREIGN_KEY', message: 'El registro referenciado no existe.' },
  '23514': { status: 422, code: 'CHECK_VIOLATION', message: 'Los datos no cumplen una regla de integridad de la base de datos.' },
  '23502': { status: 422, code: 'NOT_NULL', message: 'Falta un campo obligatorio.' },
  '22P02': { status: 400, code: 'INVALID_INPUT', message: 'Formato de dato inválido.' },
  '22007': { status: 400, code: 'INVALID_DATE', message: 'Formato de fecha inválido.' },
  '22008': { status: 400, code: 'INVALID_DATE', message: 'Fecha fuera de rango.' },
  '22001': { status: 422, code: 'VALUE_TOO_LONG', message: 'Un valor excede la longitud permitida.' },
};

const CONEXION = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', '57P01', '08006', '08001', '28P01']);

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof DomainError) {
    return res.status(err.status).json({ error: err.message, code: err.code, details: err.details });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido.', code: 'INVALID_JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la petición excede el tamaño permitido.', code: 'PAYLOAD_TOO_LARGE' });
  }
  if (err.message && err.message.startsWith('Origen no permitido por CORS')) {
    return res.status(403).json({ error: err.message, code: 'CORS_DENIED' });
  }

  const pg = PG_ERRORES[err.code];
  if (pg) {
    return res.status(pg.status).json({
      error: pg.message,
      code: pg.code,
      details: err.constraint ? { restriccion: err.constraint } : undefined,
    });
  }

  if (CONEXION.has(err.code) || /timeout|Connection terminated/i.test(err.message || '')) {
    console.error('[db] Falla de conexión:', err.message);
    return res.status(503).json({ error: 'Base de datos no disponible. Intente nuevamente.', code: 'DB_UNAVAILABLE' });
  }

  console.error('[api] Error no controlado:', err);
  return res.status(500).json({ error: 'Error interno del servidor.', code: 'INTERNAL_ERROR' });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`, code: 'ROUTE_NOT_FOUND' });
};

module.exports = { errorHandler, notFoundHandler };
