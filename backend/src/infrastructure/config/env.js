require('dotenv').config();

const parseBool = (valor, porDefecto) => {
  if (valor === undefined || valor === '') return porDefecto;
  return ['1', 'true', 'yes', 'si', 'sí'].includes(String(valor).trim().toLowerCase());
};

const parsePort = (valor, porDefecto) => {
  const n = Number.parseInt(valor, 10);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : porDefecto;
};

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT, 5000),
  databaseUrl: (process.env.DATABASE_URL || '').trim(),
  databaseSsl: parseBool(process.env.DATABASE_SSL, true),
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean),
});

module.exports = env;
