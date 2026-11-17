const Port = require('./Port');

/** Puerto de salida: contrato que la infraestructura debe cumplir. */
class EvidenciaRepository {
  async crear(evidencia) {
    throw Port.notImplemented('EvidenciaRepository', 'crear');
  }

  async listarPorAuditoria(idAuditoria) {
    throw Port.notImplemented('EvidenciaRepository', 'listarPorAuditoria');
  }
}

module.exports = EvidenciaRepository;
