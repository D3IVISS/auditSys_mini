import { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, FileStack, GitBranch } from 'lucide-react';
import { Card, CardHeader, Chip, Code, EmptyState, StatusBadge } from '../components/ui';
import { cx, fecha } from '../lib/format';
import { TIPOS_EVIDENCIA } from '../lib/meta';

const Cadena = ({ items, vacio = '—', tono }) =>
  items.length === 0 ? (
    <span className="text-xs text-zinc-600">{vacio}</span>
  ) : (
    <span className="flex flex-wrap gap-1">
      {items.map((i) => (
        <Chip key={i} className={tono}>
          {i}
        </Chip>
      ))}
    </span>
  );

export default function TrazabilidadView({ ws }) {
  const { reporte } = ws;
  const [soloAlertas, setSoloAlertas] = useState(false);
  const filas = (reporte?.trazabilidad || []).filter((f) => !soloAlertas || f.alertas.length > 0);
  const totalAlertas = (reporte?.trazabilidad || []).reduce((a, f) => a + f.alertas.length, 0);
  const evidencias = reporte?.evidencias || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Evidencias y trazabilidad</h1>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
          RNF05 · Control <ArrowRight size={12} /> Evaluación <ArrowRight size={12} /> Evidencia <ArrowRight size={12} /> Hallazgo
          <ArrowRight size={12} /> Recomendación
        </p>
      </div>

      <Card>
        <CardHeader
          icon={GitBranch}
          title="Matriz de trazabilidad"
          subtitle="Cadena de extremo a extremo por control evaluado"
          actions={
            <button
              type="button"
              onClick={() => setSoloAlertas((s) => !s)}
              className={cx(
                'flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors',
                soloAlertas ? 'border-amber-500/40 bg-amber-500/10 text-amber-200' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200',
              )}
            >
              <AlertTriangle size={12} />
              Alertas <span className="num">{totalAlertas}</span>
            </button>
          }
        />
        {filas.length === 0 ? (
          <EmptyState
            icon={soloAlertas ? CheckCircle2 : GitBranch}
            title={soloAlertas ? 'Sin brechas de trazabilidad' : 'Aún no hay controles evaluados'}
            description={soloAlertas ? 'Todos los controles positivos tienen evidencia y todos los hallazgos tienen recomendación.' : undefined}
          />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/90">
                  {['Control', 'Estado', 'Evidencias', 'Hallazgos', 'Recomendaciones', 'Integridad'].map((h) => (
                    <th key={h} className="label-caps px-5 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/90">
                {filas.map((f) => (
                  <tr key={f.id_evaluacion} className="align-top hover:bg-zinc-800/20">
                    <td className="px-5 py-3">
                      <Code className="mr-2">{f.codigo_iso}</Code>
                      <span className="text-zinc-300">{f.control_nombre}</span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge estado={f.estado} size="sm" />
                    </td>
                    <td className="px-5 py-3">
                      <Cadena items={f.evidencias} vacio={f.estado === 'NO_APLICABLE' ? 'N/A (RN03)' : 'Sin evidencia'} tono="text-emerald-300" />
                    </td>
                    <td className="px-5 py-3">
                      <Cadena items={f.hallazgos} />
                    </td>
                    <td className="px-5 py-3">
                      <Cadena items={f.recomendaciones} />
                    </td>
                    <td className="px-5 py-3">
                      {f.alertas.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Completa
                        </span>
                      ) : (
                        <ul className="space-y-0.5">
                          {f.alertas.map((a) => (
                            <li key={a} className="flex items-start gap-1 text-xs text-amber-200">
                              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader icon={FileStack} title="Registro de evidencias" subtitle={`RF04 · ${evidencias.length} soportes documentales vinculados`} />
        {evidencias.length === 0 ? (
          <EmptyState icon={FileStack} title="Sin evidencias registradas" description="Adjunte evidencias desde el módulo de Evaluación de controles." />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/90">
                  {['ID', 'Control', 'Descripción', 'Tipo', 'Fuente', 'Fecha', 'Origen'].map((h) => (
                    <th key={h} className="label-caps px-5 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/90">
                {evidencias.map((e) => (
                  <tr key={e.id_evidencia} className="align-top hover:bg-zinc-800/20">
                    <td className="px-5 py-3">
                      <Code className="text-emerald-300">{e.codigo}</Code>
                    </td>
                    <td className="px-5 py-3">
                      <Code>{e.codigo_iso}</Code>
                    </td>
                    <td className="max-w-sm px-5 py-3 text-zinc-300">
                      {e.descripcion}
                      {e.referencia_archivo && <span className="mt-0.5 block truncate font-mono text-2xs text-zinc-500">{e.referencia_archivo}</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{TIPOS_EVIDENCIA[e.tipo]}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{e.fuente}</td>
                    <td className="num px-5 py-3 text-xs text-zinc-400">{fecha(e.fecha_recoleccion)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cx(
                          'font-mono text-[10px] uppercase tracking-wider',
                          e.es_simulada ? 'text-amber-300/80' : 'text-emerald-300/80',
                        )}
                      >
                        {e.es_simulada ? 'Simulada' : 'Real'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
