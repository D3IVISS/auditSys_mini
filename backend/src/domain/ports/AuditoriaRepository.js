const Port = require('./Port');

/** Puerto de salida: contrato que la infraestructura debe cumplir. */
class AuditoriaRepository {
  async listarConResumen() {
    throw Port.notImplemented('AuditoriaRepository', 'listarConResumen');
  }

  async buscarPorId(idAuditoria) {
    throw Port.notImplemented('AuditoriaRepository', 'buscarPorId');
  }

  async crear(auditoria) {
    throw Port.notImplemented('AuditoriaRepository', 'crear');
  }
}

module.exports = AuditoriaRepository;
