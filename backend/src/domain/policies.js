const { ConflictError } = require('./errors');

/** Reglas de negocio transversales del ciclo de vida de la auditoría. */
const AuditoriaPolicy = {
  asegurarEditable(auditoria) {
    if (auditoria.estado === 'CERRADA') {
      throw new ConflictError('La auditoría está CERRADA: no admite cambios en evaluaciones, evidencias ni hallazgos.');
    }
  },
};

const EvaluacionPolicy = {
  /** RN03: un control NO_APLICABLE no lleva evidencias ni hallazgos. */
  asegurarAdmiteSoportes(evaluacion, tipoSoporte) {
    if (evaluacion.estado === 'NO_APLICABLE') {
      throw new ConflictError(
        `El control ${evaluacion.codigo_iso} está evaluado como NO_APLICABLE y no admite ${tipoSoporte}.`,
      );
    }
  },

  asegurarCambioANoAplicable(nuevoEstado, dependencias) {
    if (nuevoEstado === 'NO_APLICABLE' && (dependencias.evidencias > 0 || dependencias.hallazgos > 0)) {
      throw new ConflictError(
        `No es posible marcar el control como NO_APLICABLE: tiene ${dependencias.evidencias} evidencia(s) y ${dependencias.hallazgos} hallazgo(s) asociados.`,
      );
    }
  },
};

module.exports = { AuditoriaPolicy, EvaluacionPolicy };
