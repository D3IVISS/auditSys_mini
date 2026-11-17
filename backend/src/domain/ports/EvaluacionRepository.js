const Port = require('./Port');

/** Puerto de salida: contrato que la infraestructura debe cumplir. */
class EvaluacionRepository {
  async guardar(evaluacion) {
    throw Port.notImplemented('EvaluacionRepository', 'guardar');
  }

  async buscarPorId(idEvaluacion) {
    throw Port.notImplemented('EvaluacionRepository', 'buscarPorId');
  }

  async buscarPorAuditoriaControl(idAuditoria, idControl) {
    throw Port.notImplemented('EvaluacionRepository', 'buscarPorAuditoriaControl');
  }

  async contarDependencias(idEvaluacion) {
    throw Port.notImplemented('EvaluacionRepository', 'contarDependencias');
  }

  async conteosPorCategoria(idAuditoria) {
    throw Port.notImplemented('EvaluacionRepository', 'conteosPorCategoria');
  }

  async listarDetalle(idAuditoria) {
    throw Port.notImplemented('EvaluacionRepository', 'listarDetalle');
  }
}

module.exports = EvaluacionRepository;
