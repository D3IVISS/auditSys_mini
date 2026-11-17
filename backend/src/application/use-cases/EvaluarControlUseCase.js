const { Validator, asObject } = require('../../domain/validation');
const { ESTADOS_CONTROL } = require('../../domain/constants');
const { NotFoundError } = require('../../domain/errors');
const { AuditoriaPolicy, EvaluacionPolicy } = require('../../domain/policies');

class EvaluarControlUseCase {
  constructor({ auditoriaRepository, controlRepository, evaluacionRepository }) {
    this.auditoriaRepository = auditoriaRepository;
    this.controlRepository = controlRepository;
    this.evaluacionRepository = evaluacionRepository;
  }

  async execute(input) {
    const body = asObject(input);
    const v = new Validator();
    const idAuditoria = v.positiveInt(body, 'id_auditoria', 'La auditoría');
    const idControl = v.positiveInt(body, 'id_control', 'El control');
    const estado = v.oneOf(body, 'estado', 'El estado', ESTADOS_CONTROL);
    const observacion = v.text(body, 'observacion', 'La observación del auditor', { min: 5 });
    let justificacionNa = v.text(body, 'justificacion_na', 'La justificación de No aplicable', {
      required: false,
      min: 10,
    });
    if (estado === 'NO_APLICABLE' && !justificacionNa) {
      v.add('justificacion_na', 'La opción NO_APLICABLE exige una justificación (mínimo 10 caracteres).');
    }
    v.assert('No fue posible guardar la evaluación.');
    if (estado !== 'NO_APLICABLE') justificacionNa = null;

    const auditoria = await this.auditoriaRepository.buscarPorId(idAuditoria);
    if (!auditoria) throw new NotFoundError(`No existe la auditoría ${idAuditoria}.`);
    AuditoriaPolicy.asegurarEditable(auditoria);

    const control = await this.controlRepository.buscarPorId(idControl);
    if (!control) throw new NotFoundError(`No existe el control ${idControl} en el catálogo.`);

    const existente = await this.evaluacionRepository.buscarPorAuditoriaControl(idAuditoria, idControl);
    if (existente) {
      const dependencias = await this.evaluacionRepository.contarDependencias(existente.id_evaluacion);
      EvaluacionPolicy.asegurarCambioANoAplicable(estado, dependencias);
    }

    const evaluacion = await this.evaluacionRepository.guardar({
      id_auditoria: idAuditoria,
      id_control: idControl,
      estado,
      observacion,
      justificacion_na: justificacionNa,
    });

    return { creada: !existente, evaluacion: { ...evaluacion, codigo_iso: control.codigo_iso, control_nombre: control.nombre } };
  }
}

module.exports = EvaluarControlUseCase;
