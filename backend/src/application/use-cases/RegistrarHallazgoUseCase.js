const { Validator, asObject } = require('../../domain/validation');
const { SEVERIDADES, PRIORIDADES } = require('../../domain/constants');
const { NotFoundError } = require('../../domain/errors');
const { AuditoriaPolicy, EvaluacionPolicy } = require('../../domain/policies');

class RegistrarHallazgoUseCase {
  constructor({ auditoriaRepository, evaluacionRepository, hallazgoRepository }) {
    this.auditoriaRepository = auditoriaRepository;
    this.evaluacionRepository = evaluacionRepository;
    this.hallazgoRepository = hallazgoRepository;
  }

  async execute(input) {
    const body = asObject(input);
    const rec = asObject(body.recomendacion);
    const v = new Validator();
    const hallazgo = {
      id_evaluacion: v.positiveInt(body, 'id_evaluacion', 'La evaluación del control'),
      severidad: v.oneOf(body, 'severidad', 'La severidad', SEVERIDADES),
      condicion: v.text(body, 'condicion', 'La condición', { min: 10 }),
      criterio: v.text(body, 'criterio', 'El criterio', { min: 10 }),
      causa: v.text(body, 'causa', 'La causa', { min: 5 }),
      efecto_riesgo: v.text(body, 'efecto_riesgo', 'El efecto o riesgo', { min: 10 }),
    };

    const rv = new Validator();
    const recomendacion = {
      descripcion: rv.text(rec, 'descripcion', 'La recomendación', { min: 10 }),
      prioridad: rv.oneOf(rec, 'prioridad', 'La prioridad', PRIORIDADES),
      plazo_dias: rv.positiveInt(rec, 'plazo_dias', 'El plazo sugerido (días)', { max: 730 }),
    };
    for (const [campo, mensaje] of Object.entries(rv.errors)) v.add(`recomendacion.${campo}`, mensaje);
    v.assert('No fue posible registrar el hallazgo.');

    const evaluacion = await this.evaluacionRepository.buscarPorId(hallazgo.id_evaluacion);
    if (!evaluacion) throw new NotFoundError(`No existe la evaluación ${hallazgo.id_evaluacion}.`);
    const auditoria = await this.auditoriaRepository.buscarPorId(evaluacion.id_auditoria);
    AuditoriaPolicy.asegurarEditable(auditoria);
    EvaluacionPolicy.asegurarAdmiteSoportes(evaluacion, 'hallazgos');

    const resultado = await this.hallazgoRepository.crearConRecomendacion(
      { ...hallazgo, id_auditoria: evaluacion.id_auditoria },
      recomendacion,
    );
    return {
      hallazgo: { ...resultado.hallazgo, codigo_iso: evaluacion.codigo_iso, control_nombre: evaluacion.control_nombre },
      recomendacion: resultado.recomendacion,
    };
  }
}

module.exports = RegistrarHallazgoUseCase;
