const { Validator, asObject } = require('../../domain/validation');
const { TIPOS_EVIDENCIA } = require('../../domain/constants');
const { NotFoundError } = require('../../domain/errors');
const { AuditoriaPolicy, EvaluacionPolicy } = require('../../domain/policies');

class RegistrarEvidenciaUseCase {
  constructor({ auditoriaRepository, evaluacionRepository, evidenciaRepository }) {
    this.auditoriaRepository = auditoriaRepository;
    this.evaluacionRepository = evaluacionRepository;
    this.evidenciaRepository = evidenciaRepository;
  }

  async execute(input) {
    const body = asObject(input);
    const v = new Validator();
    const evidencia = {
      id_evaluacion: v.positiveInt(body, 'id_evaluacion', 'La evaluación'),
      descripcion: v.text(body, 'descripcion', 'La descripción', { min: 5, max: 1000 }),
      fuente: v.text(body, 'fuente', 'La fuente', { min: 2, max: 160 }),
      tipo: v.oneOf(body, 'tipo', 'El tipo de evidencia', TIPOS_EVIDENCIA, { required: false, defaultValue: 'DOCUMENTAL' }),
      referencia_archivo: v.text(body, 'referencia_archivo', 'La referencia del archivo', { required: false, max: 500 }),
      es_simulada: v.boolean(body, 'es_simulada', 'La marca de simulación', { defaultValue: true }),
      fecha_recoleccion: v.date(body, 'fecha_recoleccion', 'La fecha de recolección', { required: false }),
    };
    v.assert('No fue posible registrar la evidencia.');

    const evaluacion = await this.evaluacionRepository.buscarPorId(evidencia.id_evaluacion);
    if (!evaluacion) throw new NotFoundError(`No existe la evaluación ${evidencia.id_evaluacion}.`);
    const auditoria = await this.auditoriaRepository.buscarPorId(evaluacion.id_auditoria);
    AuditoriaPolicy.asegurarEditable(auditoria);
    EvaluacionPolicy.asegurarAdmiteSoportes(evaluacion, 'evidencias');

    const creada = await this.evidenciaRepository.crear({ ...evidencia, id_auditoria: evaluacion.id_auditoria });
    return { ...creada, codigo_iso: evaluacion.codigo_iso };
  }
}

module.exports = RegistrarEvidenciaUseCase;
