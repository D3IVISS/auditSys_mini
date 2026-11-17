class VerificarSaludUseCase {
  constructor({ saludPort, reloj = () => new Date(), inicio = Date.now() }) {
    this.saludPort = saludPort;
    this.reloj = reloj;
    this.inicio = inicio;
  }

  async execute() {
    const ahora = this.reloj();
    let database;
    try {
      database = { status: 'UP', ...(await this.saludPort.verificarBaseDatos()) };
    } catch (error) {
      database = { status: 'DOWN', error: error.message };
    }
    const ok = database.status === 'UP';
    return {
      status: ok ? 'ok' : 'degraded',
      servicio: 'AuditSys Mini API',
      api: 'UP',
      database,
      uptime_s: Math.round((Date.now() - this.inicio) / 1000),
      timestamp: ahora.toISOString(),
    };
  }
}

module.exports = VerificarSaludUseCase;
