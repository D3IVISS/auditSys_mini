const { CATEGORIAS_CONTROL, PESO_PARCIAL, SEVERIDADES, SALVAGUARDA_NORMATIVA } = require('../constants');

const redondear1 = (valor) => Math.round((valor + Number.EPSILON) * 10) / 10;

const formatoPeso = (peso) => String(peso);

/**
 * Servicio de dominio puro (sin dependencias de infraestructura) para RF07.
 * Los controles NO_APLICABLE se excluyen del denominador.
 *   Indicador base   = implementados / aplicables
 *   Índice ponderado = (implementados + parciales × 0.5) / aplicables
 */
class IndicadorService {
  static calcular({ implementados = 0, parciales = 0, no_implementados = 0, no_aplicables = 0 }) {
    const imp = Number(implementados);
    const par = Number(parciales);
    const noImp = Number(no_implementados);
    const na = Number(no_aplicables);
    const aplicables = imp + par + noImp;
    const evaluados = aplicables + na;
    const base = aplicables > 0 ? redondear1((100 * imp) / aplicables) : 0;
    const ponderado = aplicables > 0 ? redondear1((100 * (imp + par * PESO_PARCIAL)) / aplicables) : 0;

    return {
      evaluados,
      aplicables,
      implementados: imp,
      parciales: par,
      no_implementados: noImp,
      no_aplicables: na,
      indicador_base: base,
      indice_ponderado: ponderado,
      formula_base: `${imp} / ${aplicables}`,
      formula_ponderada: `(${imp} + ${par} × ${formatoPeso(PESO_PARCIAL)}) / ${aplicables}`,
    };
  }

  /**
   * @param {Array<{categoria:string, estado:string, total:number}>} filas conteos por categoría y estado
   * @param {Array<{severidad:string, total:number}>} severidades conteo de hallazgos
   * @param {number} totalCatalogo número de controles del catálogo
   */
  static consolidar({ idAuditoria, filas, severidades, totalCatalogo }) {
    const acumulado = { implementados: 0, parciales: 0, no_implementados: 0, no_aplicables: 0 };
    const porCategoria = new Map(
      CATEGORIAS_CONTROL.map((cat) => [
        cat,
        { implementados: 0, parciales: 0, no_implementados: 0, no_aplicables: 0, catalogo: 0 },
      ]),
    );

    const clave = {
      IMPLEMENTADO: 'implementados',
      PARCIAL: 'parciales',
      NO_IMPLEMENTADO: 'no_implementados',
      NO_APLICABLE: 'no_aplicables',
    };

    for (const fila of filas) {
      const bucket = porCategoria.get(fila.categoria);
      if (!bucket) continue;
      const total = Number(fila.total);
      if (fila.estado === null || fila.estado === undefined) {
        bucket.catalogo += total;
        continue;
      }
      bucket.catalogo += total;
      const k = clave[fila.estado];
      if (k) {
        bucket[k] += total;
        acumulado[k] += total;
      }
    }

    const general = IndicadorService.calcular(acumulado);
    const hallazgos = Object.fromEntries(SEVERIDADES.map((s) => [s, 0]));
    for (const s of severidades) hallazgos[s.severidad] = Number(s.total);

    return {
      id_auditoria: idAuditoria,
      ...general,
      total_catalogo: Number(totalCatalogo),
      sin_evaluar: Math.max(Number(totalCatalogo) - general.evaluados, 0),
      avance_evaluacion:
        Number(totalCatalogo) > 0 ? redondear1((100 * general.evaluados) / Number(totalCatalogo)) : 0,
      peso_parcial: PESO_PARCIAL,
      por_dominio: CATEGORIAS_CONTROL.map((categoria) => {
        const b = porCategoria.get(categoria);
        const calc = IndicadorService.calcular(b);
        return { categoria, total_catalogo: b.catalogo, sin_evaluar: Math.max(b.catalogo - calc.evaluados, 0), ...calc };
      }),
      hallazgos_por_severidad: hallazgos,
      total_hallazgos: Object.values(hallazgos).reduce((a, b) => a + b, 0),
      salvaguarda: SALVAGUARDA_NORMATIVA,
    };
  }
}

module.exports = IndicadorService;
