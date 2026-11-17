const { ConflictError } = require('../../domain/errors');

class EmitirInformeUseCase {
  constructor({ generarReporte, informeRepository }) {
    this.generarReporte = generarReporte;
    this.informeRepository = informeRepository;
  }

  async execute(idAuditoria) {
    const reporte = await this.generarReporte.execute(idAuditoria);
    if (reporte.indicadores.evaluados === 0) {
      throw new ConflictError('No se puede emitir un informe sin controles evaluados.');
    }
    const { versiones, ...snapshot } = reporte;
    return this.informeRepository.crearVersion({
      id_auditoria: idAuditoria,
      indicador_base: reporte.indicadores.indicador_base,
      indice_ponderado: reporte.indicadores.indice_ponderado,
      snapshot,
    });
  }
}

module.exports = EmitirInformeUseCase;
