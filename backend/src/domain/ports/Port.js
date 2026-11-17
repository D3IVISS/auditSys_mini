class Port {
  static notImplemented(nombrePuerto, metodo) {
    return new Error(`El adaptador de ${nombrePuerto} debe implementar ${metodo}().`);
  }
}

module.exports = Port;
