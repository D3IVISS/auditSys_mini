const ESTADOS_CONTROL = Object.freeze(['IMPLEMENTADO', 'PARCIAL', 'NO_IMPLEMENTADO', 'NO_APLICABLE']);
const ESTADOS_AUDITORIA = Object.freeze(['BORRADOR', 'EN_EJECUCION', 'EN_REVISION', 'CERRADA']);
const CATEGORIAS_CONTROL = Object.freeze(['ORGANIZACIONAL', 'PERSONAS', 'FISICO', 'TECNOLOGICO']);
const SEVERIDADES = Object.freeze(['ALTA', 'MEDIA', 'BAJA']);
const PRIORIDADES = Object.freeze(['ALTA', 'MEDIA', 'BAJA']);
const TIPOS_EVIDENCIA = Object.freeze(['DOCUMENTAL', 'ENTREVISTA', 'OBSERVACION', 'CAPTURA', 'REGISTRO']);
const PESO_PARCIAL = 0.5;

const SALVAGUARDA_NORMATIVA =
  'El indicador de cumplimiento es descriptivo y de uso académico: resume el estado de los controles evaluados ' +
  'frente a ISO/IEC 27002:2022 dentro del alcance definido, con evidencias simuladas. No constituye certificación ' +
  'ISO/IEC 27001, opinión de conformidad ni garantía sobre la seguridad de la organización.';

module.exports = {
  ESTADOS_CONTROL,
  ESTADOS_AUDITORIA,
  CATEGORIAS_CONTROL,
  SEVERIDADES,
  PRIORIDADES,
  TIPOS_EVIDENCIA,
  PESO_PARCIAL,
  SALVAGUARDA_NORMATIVA,
};
