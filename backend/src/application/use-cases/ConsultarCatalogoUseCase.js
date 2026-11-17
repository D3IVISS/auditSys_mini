const { NotFoundError } = require('../../domain/errors');

class ConsultarCatalogoUseCase {
  constructor({ controlRepository, auditoriaRepository }) {
    this.controlRepository = controlRepository;
    this.auditoriaRepository = auditoriaRepository;
  }

  async execute(idAuditoria = null) {
    if (idAuditoria !== null) {
      const auditoria = await this.auditoriaRepository.buscarPorId(idAuditoria);
      if (!auditoria) throw new NotFoundError(`No existe la auditoría ${idAuditoria}.`);
    }
    const filas = await this.controlRepository.listarCatalogo(idAuditoria);
    return filas.map((fila) => {
      const {
        id_evaluacion,
        estado,
        observacion,
        justificacion_na,
        evaluado_en,
        actualizado_en,
        total_evidencias,
        total_hallazgos,
        ...control
      } = fila;
      return {
        ...control,
        evaluacion: id_evaluacion
          ? {
              id_evaluacion,
              estado,
              observacion,
              justificacion_na,
              evaluado_en,
              actualizado_en,
              total_evidencias: Number(total_evidencias),
              total_hallazgos: Number(total_hallazgos),
            }
          : null,
      };
    });
  }
}

module.exports = ConsultarCatalogoUseCase;
