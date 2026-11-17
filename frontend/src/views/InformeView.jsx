import { useState } from 'react';
import { FileBadge2, Printer, ShieldAlert } from 'lucide-react';
import { Button, SeverityBadge, StatusBadge, useToast } from '../components/ui';
import { api } from '../lib/api';
import { fecha, fechaHora, pct } from '../lib/format';
import { CATEGORIAS, ESTADO_AUDITORIA, ORDEN_ESTADOS, CLAVE_CONTEO, TIPOS_EVIDENCIA } from '../lib/meta';

function Seccion({ n, titulo, children, breakBefore }) {
  return (
    <section className={`mt-9 ${breakBefore ? 'print-break-before' : ''}`}>
      <h2 className="print-keep-next mb-3 flex items-baseline gap-3 border-b border-zinc-200 pb-2 text-[15px] font-semibold text-zinc-900">
        <span className="font-mono text-xs tabular-nums text-zinc-400">{String(n).padStart(2, '0')}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

const Th = ({ children, className = '' }) => (
  <th className={`border-b border-zinc-300 px-2.5 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-500 ${className}`}>{children}</th>
);
const Td = ({ children, className = '' }) => <td className={`border-b border-zinc-100 px-2.5 py-2 align-top ${className}`}>{children}</td>;

const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

export default function InformeView({ ws }) {
  const toast = useToast();
  const { reporte } = ws;
  const [emitiendo, setEmitiendo] = useState(false);
  if (!reporte) return null;

  const { auditoria: a, indicadores: ind, evaluaciones, hallazgos, recomendaciones, evidencias } = reporte;
  const altas = hallazgos.filter((h) => h.severidad === 'ALTA');
  const versionMostrada = reporte.version_vigente ?? 'Borrador';

  const resumen =
    ind.aplicables === 0
      ? 'Aún no hay controles aplicables evaluados en esta auditoría.'
      : `De los ${ind.aplicables} controles aplicables evaluados, ${ind.implementados} (${pct(ind.indicador_base)}) ${ind.implementados === 1 ? 'está implementado' : 'están implementados'}, ` +
        `${ind.parciales} parcialmente y ${ind.no_implementados} no ${ind.no_implementados === 1 ? 'implementado' : 'implementados'}; ` +
        `${plural(ind.no_aplicables, 'control se declaró no aplicable', 'controles se declararon no aplicables')}. ` +
        `Se documentaron ${plural(hallazgos.length, 'hallazgo', 'hallazgos')}` +
        (altas.length > 0
          ? `, ${altas.length} de severidad alta, relacionados con ${altas.map((h) => `${h.codigo_iso} ${h.control_nombre.toLowerCase()}`).join(' y ')}.`
          : '.') +
        ' El indicador es descriptivo y no constituye certificación.';

  const emitir = async () => {
    setEmitiendo(true);
    try {
      const inf = await api.emitirInforme(a.id_auditoria);
      toast(`Informe versión ${inf.version} emitido y almacenado.`);
      await ws.refrescar();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setEmitiendo(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Informe de auditoría</h1>
          <p className="mt-1 text-sm text-zinc-500">
            RF08 · ISO 19011:2018 · Versión vigente <span className="num text-zinc-300">{versionMostrada}</span> ·{' '}
            {reporte.versiones.length} {reporte.versiones.length === 1 ? 'versión emitida' : 'versiones emitidas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon={FileBadge2} onClick={emitir} loading={emitiendo}>
            Emitir versión {(reporte.version_vigente ?? 0) + 1}
          </Button>
          <Button variant="primary" icon={Printer} onClick={() => window.print()}>
            Imprimir / PDF
          </Button>
        </div>
      </div>

      <article className="print-sheet mx-auto max-w-[860px] rounded-md bg-white px-6 py-10 text-[13px] leading-relaxed text-zinc-800 shadow-sheet sm:px-14 sm:py-14">
        <header className="flex flex-col gap-6 border-b-2 border-zinc-900 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Informe de auditoría · ISO 19011:2018</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{a.organizacion}</h1>
            <p className="mt-1 text-sm text-zinc-600">Evaluación de controles ISO/IEC 27002:2022</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] tabular-nums text-zinc-600">
            <dt className="text-zinc-400">Código</dt>
            <dd className="text-zinc-900">AUD-{String(a.id_auditoria).padStart(3, '0')}</dd>
            <dt className="text-zinc-400">Versión</dt>
            <dd className="text-zinc-900">{versionMostrada}</dd>
            <dt className="text-zinc-400">Generado</dt>
            <dd className="text-zinc-900">{fechaHora(reporte.generado_en)}</dd>
          </dl>
        </header>

        <Seccion n={1} titulo="Datos de la auditoría">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[160px_1fr]">
            {[
              ['Organización', a.organizacion],
              ['Objetivo', a.objetivo],
              ['Alcance', a.alcance],
              ['Periodo', `${fecha(a.fecha_inicio)} – ${fecha(a.fecha_fin)}`],
              ['Auditor responsable', a.auditor_nombre],
              ['Estado', ESTADO_AUDITORIA[a.estado]],
              ['Referentes', a.referentes],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 sm:pt-0.5">{k}</dt>
                <dd className="text-zinc-800">{v}</dd>
              </div>
            ))}
          </dl>
        </Seccion>

        <Seccion n={2} titulo="Alcance y criterios">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <Th className="w-14">Código</Th>
                <Th>Control</Th>
                <Th>Criterio de auditoría</Th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map((e) => (
                <tr key={e.id_evaluacion}>
                  <Td className="font-mono tabular-nums text-zinc-900">{e.codigo_iso}</Td>
                  <Td className="text-zinc-900">
                    {e.control_nombre}
                    <span className="block text-[10px] text-zinc-500">{CATEGORIAS[e.categoria]?.label}</span>
                  </Td>
                  <Td className="text-zinc-600">{e.criterio}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Seccion>

        <Seccion n={3} titulo="Resultados e indicadores">
          <div className="grid gap-px overflow-hidden rounded border border-zinc-200 bg-zinc-200 sm:grid-cols-4">
            {[
              ['Indicador base', pct(ind.indicador_base), `${ind.formula_base}`],
              ['Índice ponderado', pct(ind.indice_ponderado), ind.formula_ponderada],
              ['Aplicables', ind.aplicables, `${ind.evaluados} evaluados · ${ind.no_aplicables} N/A`],
              ['Hallazgos', hallazgos.length, `${altas.length} de severidad alta`],
            ].map(([k, v, f]) => (
              <div key={k} className="bg-white px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{k}</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-950">{v}</p>
                <p className="font-mono text-[10px] tabular-nums text-zinc-500">{f}</p>
              </div>
            ))}
          </div>
          <table className="mt-4 w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <Th>Estado</Th>
                <Th className="text-right">Controles</Th>
                <Th className="text-right">% s/ evaluados</Th>
              </tr>
            </thead>
            <tbody>
              {ORDEN_ESTADOS.map((e) => {
                const n = ind[CLAVE_CONTEO[e]];
                return (
                  <tr key={e}>
                    <Td>
                      <StatusBadge estado={e} size="sm" print />
                    </Td>
                    <Td className="text-right font-mono tabular-nums">{n}</Td>
                    <Td className="text-right font-mono tabular-nums">{ind.evaluados ? pct((100 * n) / ind.evaluados) : '—'}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-4 rounded border-l-2 border-zinc-900 bg-zinc-50 px-4 py-3 text-zinc-700">{resumen}</p>
          <p className="mt-2 font-mono text-[10px] text-zinc-500">
            Indicador base = implementados / aplicables · Índice ponderado = (implementados + parciales × {ind.peso_parcial}) / aplicables · NO_APLICABLE excluido del denominador.
          </p>
        </Seccion>

        <Seccion n={4} titulo="Evaluación por control" breakBefore>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <Th className="w-14">Código</Th>
                <Th className="w-36">Estado</Th>
                <Th>Observación / justificación</Th>
                <Th className="w-24">Evidencia</Th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map((e) => (
                <tr key={e.id_evaluacion} className="print-avoid-break">
                  <Td className="font-mono tabular-nums text-zinc-900">{e.codigo_iso}</Td>
                  <Td>
                    <StatusBadge estado={e.estado} size="sm" print />
                  </Td>
                  <Td>
                    {e.observacion}
                    {e.justificacion_na && <span className="mt-1 block text-zinc-500">Justificación N/A: {e.justificacion_na}</span>}
                  </Td>
                  <Td className="font-mono text-[11px] tabular-nums text-zinc-700">{e.evidencias.map((x) => x.codigo).join(', ') || '—'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Seccion>

        <Seccion n={5} titulo="Hallazgos">
          {hallazgos.length === 0 ? (
            <p className="text-zinc-500">No se registraron hallazgos.</p>
          ) : (
            <div className="space-y-4">
              {hallazgos.map((h) => (
                <div key={h.id_hallazgo} className="print-avoid-break rounded border border-zinc-200">
                  <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2">
                    <span className="font-mono text-sm font-semibold text-zinc-950">{h.codigo}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="font-mono text-[12px] text-zinc-600">{h.codigo_iso}</span>
                    <span className="flex-1 text-zinc-800">{h.control_nombre}</span>
                    <SeverityBadge severidad={h.severidad} print />
                  </div>
                  <dl className="grid gap-x-6 gap-y-2 px-4 py-3 sm:grid-cols-[90px_1fr]">
                    {[
                      ['Condición', h.condicion],
                      ['Criterio', h.criterio],
                      ['Causa', h.causa],
                      ['Efecto', h.efecto_riesgo],
                    ].map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 sm:pt-0.5">{k}</dt>
                        <dd className="text-zinc-700">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </Seccion>

        <Seccion n={6} titulo="Recomendaciones">
          {recomendaciones.length === 0 ? (
            <p className="text-zinc-500">Sin recomendaciones registradas.</p>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <Th className="w-14">ID</Th>
                  <Th className="w-14">Hallazgo</Th>
                  <Th>Acción recomendada</Th>
                  <Th className="w-20">Prioridad</Th>
                  <Th className="w-16 text-right">Plazo</Th>
                </tr>
              </thead>
              <tbody>
                {recomendaciones.map((r) => (
                  <tr key={r.id_recomendacion}>
                    <Td className="font-mono tabular-nums text-zinc-900">{r.codigo}</Td>
                    <Td className="font-mono tabular-nums">{r.hallazgo_codigo}</Td>
                    <Td>{r.descripcion}</Td>
                    <Td>
                      <SeverityBadge severidad={r.prioridad} print />
                    </Td>
                    <Td className="text-right font-mono tabular-nums">{r.plazo_dias} d</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Seccion>

        <Seccion n={7} titulo="Anexo de evidencias">
          {evidencias.length === 0 ? (
            <p className="text-zinc-500">Sin evidencias registradas.</p>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <Th className="w-14">ID</Th>
                  <Th className="w-14">Control</Th>
                  <Th>Descripción</Th>
                  <Th>Fuente · tipo</Th>
                  <Th className="w-24">Fecha</Th>
                  <Th className="w-16">Marca</Th>
                </tr>
              </thead>
              <tbody>
                {evidencias.map((e) => (
                  <tr key={e.id_evidencia}>
                    <Td className="font-mono tabular-nums text-zinc-900">{e.codigo}</Td>
                    <Td className="font-mono tabular-nums">{e.codigo_iso}</Td>
                    <Td>{e.descripcion}</Td>
                    <Td className="text-zinc-600">
                      {e.fuente} · {TIPOS_EVIDENCIA[e.tipo]}
                    </Td>
                    <Td className="font-mono text-[11px] tabular-nums">{fecha(e.fecha_recoleccion)}</Td>
                    <Td className="font-mono text-[10px] uppercase">{e.es_simulada ? 'Simulada' : 'Real'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Seccion>

        <Seccion n={8} titulo="Limitaciones y salvaguarda normativa">
          <div className="flex gap-3 rounded border border-zinc-300 bg-zinc-50 px-4 py-3.5">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-zinc-700" />
            <div className="space-y-1.5 text-zinc-700">
              <p className="font-semibold text-zinc-900">El indicador es descriptivo y de uso académico; no constituye certificación.</p>
              <p>{reporte.salvaguarda}</p>
              <p>
                La auditoría se basa en muestreo y en la información disponible durante el periodo evaluado (ISO 19011:2018, enfoque basado en
                evidencia); las conclusiones se limitan al alcance declarado y a los controles seleccionados.
              </p>
            </div>
          </div>
        </Seccion>

        <footer className="mt-12 grid gap-8 border-t border-zinc-200 pt-8 sm:grid-cols-2">
          {[
            ['Auditor responsable', a.auditor_nombre],
            ['Recibido por', a.organizacion],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="h-10 border-b border-zinc-400" />
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">{k}</p>
              <p className="text-zinc-800">{v}</p>
            </div>
          ))}
        </footer>
        <p className="mt-8 text-center font-mono text-[10px] text-zinc-400">
          AuditSys Mini · Documento generado desde la base de datos · ISO/IEC 27002:2022
        </p>
      </article>
    </div>
  );
}
