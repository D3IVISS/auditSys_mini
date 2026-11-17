const Port = require('./Port');

/** Puerto de salida: contrato que la infraestructura debe cumplir. */
class InformeRepository {
  async crearVersion(informe) {
    throw Port.notImplemented('InformeRepository', 'crearVersion');
  }

  async listarVersiones(idAuditoria) {
    throw Port.notImplemented('InformeRepository', 'listarVersiones');
  }
}

module.exports = InformeRepository;
