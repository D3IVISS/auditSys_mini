const cors = require('cors');

const toMatcher = (patron) => {
  if (!patron.includes('*')) return (origin) => origin === patron;
  const regex = new RegExp(
    `^${patron.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[a-z0-9-]+')}$`,
    'i',
  );
  return (origin) => regex.test(origin);
};

/** CORS dinámico a partir de FRONTEND_URL (lista separada por comas, admite *.dominio). */
const buildCors = (origenesPermitidos) => {
  const matchers = origenesPermitidos.map(toMatcher);
  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalizado = origin.replace(/\/+$/, '');
      if (matchers.some((match) => match(normalizado))) return callback(null, true);
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 600,
  });
};

module.exports = buildCors;
