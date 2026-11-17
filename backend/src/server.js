const env = require('./infrastructure/config/env');
const buildContainer = require('./infrastructure/container');
const createApp = require('./app');

const { db, controllers } = buildContainer(env);
const app = createApp({ controllers, frontendUrls: env.frontendUrls, logRequests: env.nodeEnv !== 'test' });

const server = app.listen(env.port, () => {
  console.log('==============================================================');
  console.log(` AuditSys Mini API · http://localhost:${env.port}/api/health`);
  console.log(` Entorno: ${env.nodeEnv} · CORS: ${env.frontendUrls.join(', ')}`);
  console.log('==============================================================');
});

const shutdown = (signal) => {
  console.log(`[api] ${signal} recibido. Cerrando conexiones...`);
  server.close(() => {
    db.close().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('[api] Promesa rechazada sin manejar:', reason);
});
