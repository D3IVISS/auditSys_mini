const { NotFoundError } = require('../../domain/errors');
const { SALVAGUARDA_NORMATIVA } = require('../../domain/constants');

const agrupar = (lista, clave) =>
  lista.reduce((mapa, item) => {
    const k = item[clave];
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(item);
    return mapa;
  }, new Map());

class GenerarReporteUseCase {
  constructor({
    auditoriaRepository,
    controlRepository,
    evaluacionRepository,
    evidenciaRepository,
    hallazgoRepository,
    informeRepository,
    calcularIndicadores,
    reloj = () => new Date(),
  }) {
    this.auditoriaRepository = auditoriaRepository;
    this.controlRepository = controlRepository;
    this.evaluacionRepository = evaluacionRepository;
    this.evidenciaRepository = evidenciaRepository;
    this.hallazgoRepository = hallazgoRepository;
    this.informeRepository = informeRepository;
    this.calcularIndicadores = calcularIndicadores;
    this.reloj = reloj;
  }

  async execute(idAuditoria) {
    const auditoria = await this.auditoriaRepository.buscarPorId(idAuditoria);
    if (!auditoria) throw new NotFoundError(`No existe la auditoría ${idAuditoria}.`);

    const [indicadores, evaluaciones, evidencias, hallazgos, versiones] = await Promise.all([
      this.calcularIndicadores.execute(idAuditoria),
      this.evaluacionRepository.listarDetalle(idAuditoria),
      this.evidenciaRepository.listarPorAuditoria(idAuditoria),
      this.hallazgoRepository.listarPorAuditoria(idAuditoria),
      this.informeRepository.listarVersiones(idAuditoria),
    ]);

    const evidenciasPorEval = agrupar(evidencias, 'id_evaluacion');
    const hallazgosPorEval = agrupar(hallazgos, 'id_evaluacion');

    const evaluacionesDetalle = evaluaciones.map((ev) => ({
      ...ev,
      evidencias: evidenciasPorEval.get(ev.id_evaluacion) || [],
      hallazgos: (hallazgosPorEval.get(ev.id_evaluacion) || []).map((h) => h.codigo),
    }));

    const recomendaciones = hallazgos.flatMap((h) =>
      h.recomendaciones.map((r) => ({ ...r, hallazgo_codigo: h.codigo, codigo_iso: h.codigo_iso, severidad: h.severidad })),
    );

    const trazabilidad = evaluacionesDetalle.map((ev) => {
      const hs = hallazgosPorEval.get(ev.id_evaluacion) || [];
      return {
        id_evaluacion: ev.id_evaluacion,
        codigo_iso: ev.codigo_iso,
        control_nombre: ev.control_nombre,
        categoria: ev.categoria,
        estado: ev.estado,
        evidencias: ev.evidencias.map((e) => e.codigo),
        hallazgos: hs.map((h) => h.codigo),
        recomendaciones: hs.flatMap((h) => h.recomendaciones.map((r) => r.codigo)),
        alertas: [
          ...(['IMPLEMENTADO', 'PARCIAL'].includes(ev.estado) && ev.evidencias.length === 0
            ? ['Control con estado positivo sin evidencia de soporte.']
            : []),
          ...hs.filter((h) => h.recomendaciones.length === 0).map((h) => `Hallazgo ${h.codigo} sin recomendación.`),
        ],
      };
    });

    return {
      generado_en: this.reloj().toISOString(),
      version_vigente: versiones.length > 0 ? versiones[0].version : null,
      auditoria,
      indicadores,
      evaluaciones: evaluacionesDetalle,
      evidencias,
      hallazgos,
      recomendaciones,
      trazabilidad,
      versiones,
      salvaguarda: SALVAGUARDA_NORMATIVA,
    };
  }
}

module.exports = GenerarReporteUseCase;
