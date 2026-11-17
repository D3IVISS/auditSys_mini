const Port = require('./Port');

/** Puerto de salida: contrato que la infraestructura debe cumplir. */
class SaludPort {
  async verificarBaseDatos() {
    throw Port.notImplemented('SaludPort', 'verificarBaseDatos');
  }
}

module.exports = SaludPort;
