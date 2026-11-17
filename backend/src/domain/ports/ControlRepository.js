const Port = require('./Port');

/** Puerto de salida: contrato que la infraestructura debe cumplir. */
class ControlRepository {
  async listarCatalogo(idAuditoria) {
    throw Port.notImplemented('ControlRepository', 'listarCatalogo');
  }

  async buscarPorId(idControl) {
    throw Port.notImplemented('ControlRepository', 'buscarPorId');
  }
}

module.exports = ControlRepository;
