class CodigoService {
  static formatear(prefijo, numero) {
    return `${prefijo}-${String(numero).padStart(2, '0')}`;
  }

  static numero(codigo) {
    const match = /(\d+)$/.exec(codigo || '');
    return match ? Number.parseInt(match[1], 10) : 0;
  }
}

module.exports = CodigoService;
