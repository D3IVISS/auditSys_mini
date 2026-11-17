const { Validator, asObject } = require('../../domain/validation');
const { ESTADOS_AUDITORIA } = require('../../domain/constants');

class RegistrarAuditoriaUseCase {
  constructor({ auditoriaRepository, usuarioRepository }) {
    this.auditoriaRepository = auditoriaRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async execute(input) {
    const body = asObject(input);
    const v = new Validator();
    const auditoria = {
      organizacion: v.text(body, 'organizacion', 'La organización', { max: 120, min: 3 }),
      objetivo: v.text(body, 'objetivo', 'El objetivo', { min: 10 }),
      alcance: v.text(body, 'alcance', 'El alcance', { min: 10 }),
      referentes: v.text(body, 'referentes', 'Los referentes', { required: false, max: 500 }),
      fecha_inicio: v.date(body, 'fecha_inicio', 'La fecha de inicio'),
      fecha_fin: v.date(body, 'fecha_fin', 'La fecha de cierre'),
      estado: v.oneOf(body, 'estado', 'El estado', ESTADOS_AUDITORIA, { required: false, defaultValue: 'BORRADOR' }),
      id_auditor: v.positiveInt(body, 'id_auditor', 'El auditor responsable'),
    };

    if (auditoria.fecha_inicio && auditoria.fecha_fin && auditoria.fecha_fin < auditoria.fecha_inicio) {
      v.add('fecha_fin', 'La fecha de cierre debe ser posterior o igual a la fecha de inicio.');
    }
    if (auditoria.estado === 'CERRADA') {
      v.add('estado', 'Una auditoría nueva no puede registrarse como CERRADA.');
    }
    v.assert('No fue posible registrar la auditoría.');

    if (!(await this.usuarioRepository.existe(auditoria.id_auditor))) {
      v.add('id_auditor', 'El auditor seleccionado no existe.');
      v.assert('No fue posible registrar la auditoría.');
    }

    return this.auditoriaRepository.crear(auditoria);
  }
}

module.exports = RegistrarAuditoriaUseCase;
