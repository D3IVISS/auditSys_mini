const Port = require('./Port');

/** Puerto de salida: contrato que la infraestructura debe cumplir. */
class UsuarioRepository {
  async listarAuditores() {
    throw Port.notImplemented('UsuarioRepository', 'listarAuditores');
  }

  async existe(idUsuario) {
    throw Port.notImplemented('UsuarioRepository', 'existe');
  }
}

module.exports = UsuarioRepository;
