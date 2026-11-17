const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');

const buildRouter = ({ sistemaController, auditoriaController, controlController, evaluacionController }) => {
  const router = Router();

  router.get('/health', asyncHandler(sistemaController.health));
  router.get('/usuarios', asyncHandler(sistemaController.usuarios));

  router.get('/auditorias', asyncHandler(auditoriaController.listar));
  router.post('/auditorias', asyncHandler(auditoriaController.crear));
  router.get('/auditorias/:id/indicadores', asyncHandler(auditoriaController.indicadores));
  router.get('/auditorias/:id/reporte', asyncHandler(auditoriaController.reporte));
  router.post('/auditorias/:id/informes', asyncHandler(auditoriaController.emitir));

  router.get('/controles', asyncHandler(controlController.listar));

  router.post('/evaluaciones/evaluar', asyncHandler(evaluacionController.evaluar));
  router.post('/evidencias', asyncHandler(evaluacionController.evidencia));
  router.post('/hallazgos', asyncHandler(evaluacionController.hallazgo));

  return router;
};

module.exports = buildRouter;
