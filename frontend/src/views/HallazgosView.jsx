import { useState } from 'react';
import { CalendarClock, Plus, SearchCheck, Wrench } from 'lucide-react';
import { Button, Card, Code, EmptyState, SeverityBadge, StatusBadge } from '../components/ui';
import HallazgoModal from '../components/HallazgoModal';
import { cx } from '../lib/format';
import { ORDEN_SEVERIDAD, SEVERIDAD } from '../lib/meta';

const BLOQUES = [
  { campo: 'condicion', titulo: 'Condición', ayuda: 'Lo que se encontró' },
  { campo: 'criterio', titulo: 'Criterio', ayuda: 'Lo que exige la norma' },
  { campo: 'causa', titulo: 'Causa', ayuda: 'Por qué ocurre' },
  { campo: 'efecto_riesgo', titulo: 'Efecto', ayuda: 'Riesgo o impacto' },
];

const BORDE_SEVERIDAD = { ALTA: 'before:bg-rose-500/70', MEDIA: 'before:bg-amber-500/70', BAJA: 'before:bg-sky-500/70' };

export default function HallazgosView({ ws }) {
  const { reporte, controles, activa } = ws;
  const [modal, setModal] = useState(false);
  const [filtro, setFiltro] = useState('TODAS');
  const hallazgos = reporte?.hallazgos || [];
  const visibles = filtro === 'TODAS' ? hallazgos : hallazgos.filter((h) => h.severidad === filtro);
  const bloqueada = activa?.estado === 'CERRADA';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Hallazgos y acciones CAPA</h1>
          <p className="mt-1 text-sm text-zinc-500">RF05 · RF06 · Estructura condición – criterio – causa – efecto</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModal(true)} disabled={bloqueada}>
          Nuevo hallazgo
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {['TODAS', ...ORDEN_SEVERIDAD].map((s) => {
          const n = s === 'TODAS' ? hallazgos.length : hallazgos.filter((h) => h.severidad === s).length;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFiltro(s)}
              className={cx('card px-4 py-3 text-left transition-colors hover:border-zinc-700', filtro === s && 'border-zinc-600 bg-raised')}
            >
              <span className="label-caps">{s === 'TODAS' ? 'Total' : `Severidad ${SEVERIDAD[s].label.toLowerCase()}`}</span>
              <span className="num mt-1 block text-2xl font-semibold text-zinc-50">{n}</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <Card>
          <EmptyState
            icon={SearchCheck}
            title={hallazgos.length === 0 ? 'Sin hallazgos registrados' : 'Sin hallazgos para el filtro'}
            description="Registre hallazgos a partir de controles evaluados como NO_IMPLEMENTADO o PARCIAL con brechas relevantes."
          />
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibles.map((h) => (
            <Card
              key={h.id_hallazgo}
              className={cx('relative flex flex-col overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[2px]', BORDE_SEVERIDAD[h.severidad])}
            >
              <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-zinc-800/90 px-5 py-3.5">
                <Code className="text-base text-zinc-50">{h.codigo}</Code>
                <SeverityBadge severidad={h.severidad} />
                <span className="text-zinc-700">·</span>
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">
                  <Code className="mr-1.5 text-zinc-400">{h.codigo_iso}</Code>
                  {h.control_nombre}
                </span>
                <StatusBadge estado={h.estado_control} size="sm" />
              </header>
              <dl className="grid gap-px bg-zinc-800/90 sm:grid-cols-2">
                {BLOQUES.map((b) => (
                  <div key={b.campo} className="bg-panel px-5 py-4">
                    <dt className="flex items-baseline justify-between">
                      <span className="label-caps text-zinc-400">{b.titulo}</span>
                      <span className="text-[10px] text-zinc-600">{b.ayuda}</span>
                    </dt>
                    <dd className="mt-1.5 text-[13px] leading-relaxed text-zinc-300">{h[b.campo]}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex-1 bg-[#0D0D10]">
              {h.recomendaciones.map((r) => (
                <footer key={r.id_recomendacion} className="border-t border-zinc-800/90 px-5 py-4">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Wrench size={13} className="text-emerald-400" />
                    <span className="label-caps text-emerald-300/90">Acción CAPA</span>
                    <Code className="text-emerald-300">{r.codigo}</Code>
                    <span className="ml-auto flex items-center gap-2">
                      <SeverityBadge severidad={r.prioridad} prefix="Prioridad " />
                      <span className="num inline-flex items-center gap-1 text-2xs text-zinc-400">
                        <CalendarClock size={12} />
                        {r.plazo_dias} días
                      </span>
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-zinc-200">{r.descripcion}</p>
                </footer>
              ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <HallazgoModal
        open={modal}
        onClose={() => setModal(false)}
        controles={controles}
        idEvaluacionInicial={null}
        onCreado={async () => {
          setModal(false);
          await ws.refrescar();
        }}
      />
    </div>
  );
}
