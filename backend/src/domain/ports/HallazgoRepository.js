const Port = require('./Port');

/** Puerto de salida: contrato que la infraestructura debe cumplir. */
class HallazgoRepository {
  async crearConRecomendacion(hallazgo, recomendacion) {
    throw Port.notImplemented('HallazgoRepository', 'crearConRecomendacion');
  }

  async listarPorAuditoria(idAuditoria) {
    throw Port.notImplemented('HallazgoRepository', 'listarPorAuditoria');
  }

  async conteoPorSeveridad(idAuditoria) {
    throw Port.notImplemented('HallazgoRepository', 'conteoPorSeveridad');
  }
}

module.exports = HallazgoRepository;
