const IndicadorService = require('../../domain/services/IndicadorService');

class ListarAuditoriasUseCase {
  constructor({ auditoriaRepository }) {
    this.auditoriaRepository = auditoriaRepository;
  }

  async execute() {
    const filas = await this.auditoriaRepository.listarConResumen();
    return filas.map(({ implementados, parciales, no_implementados, no_aplicables, total_hallazgos, ...auditoria }) => {
      const ind = IndicadorService.calcular({ implementados, parciales, no_implementados, no_aplicables });
      return {
        ...auditoria,
        resumen: {
          evaluados: ind.evaluados,
          aplicables: ind.aplicables,
          indicador_base: ind.indicador_base,
          indice_ponderado: ind.indice_ponderado,
          total_hallazgos: Number(total_hallazgos),
        },
      };
    });
  }
}

module.exports = ListarAuditoriasUseCase;
