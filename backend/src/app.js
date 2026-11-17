const express = require('express');
const buildCors = require('./infrastructure/http/cors');
const buildRouter = require('./infrastructure/http/routes');
const securityHeaders = require('./infrastructure/http/middlewares/securityHeaders');
const requestLogger = require('./infrastructure/http/middlewares/requestLogger');
const { errorHandler, notFoundHandler } = require('./infrastructure/http/middlewares/errorHandler');

const createApp = ({ controllers, frontendUrls, logRequests = true }) => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(securityHeaders);
  app.use(buildCors(frontendUrls));
  app.use(express.json({ limit: '100kb' }));
  if (logRequests) app.use(requestLogger);

  app.get('/', (req, res) => {
    res.json({ servicio: 'AuditSys Mini API', documentacion: 'Consulte /api/health y el README del repositorio.' });
  });
  app.use('/api', buildRouter(controllers));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

module.exports = createApp;
