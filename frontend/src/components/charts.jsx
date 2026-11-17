import { useState } from 'react';
import { CLAVE_CONTEO, ESTADOS, ORDEN_ESTADOS } from '../lib/meta';
import { cx } from '../lib/format';

/**
 * Barra apilada por estado: segmentos separados 2 px, extremos redondeados 4 px,
 * tooltip por segmento y textura en NO_APLICABLE como codificación secundaria.
 */
export function StackedEstadoBar({ conteos, height = 'h-2.5', etiqueta }) {
  const [hover, setHover] = useState(null);
  const segmentos = ORDEN_ESTADOS.map((estado) => ({ estado, valor: Number(conteos[CLAVE_CONTEO[estado]] || 0) })).filter(
    (s) => s.valor > 0,
  );
  const total = segmentos.reduce((a, s) => a + s.valor, 0);

  if (total === 0) {
    return <div className={cx('w-full rounded-[4px] border border-dashed border-zinc-800', height)} aria-label="Sin evaluaciones" />;
  }

  let acumulado = 0;
  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <div className={cx('flex w-full gap-[2px] overflow-hidden rounded-[4px]', height)} role="img" aria-label={etiqueta}>
        {segmentos.map((s) => {
          const inicio = acumulado;
          acumulado += s.valor;
          const centro = ((inicio + s.valor / 2) / total) * 100;
          return (
            <div
              key={s.estado}
              className={cx('h-full cursor-default transition-opacity', ESTADOS[s.estado].bar, hover && hover.estado !== s.estado && 'opacity-40')}
              style={{ flexGrow: s.valor, flexBasis: 0 }}
              onMouseEnter={() => setHover({ ...s, centro })}
            />
          );
        })}
      </div>
      {hover && (
        <div
          className="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-2xs shadow-sheet"
          style={{ left: `${Math.min(Math.max(hover.centro, 12), 88)}%` }}
        >
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className={cx('h-2 w-2 rounded-sm', ESTADOS[hover.estado].bar)} />
            {ESTADOS[hover.estado].label}
          </span>
          <span className="num mt-0.5 block text-zinc-100">
            {hover.valor} de {total} · {((100 * hover.valor) / total).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

export function EstadoLegend({ conteos, className }) {
  return (
    <ul className={cx('flex flex-wrap gap-x-5 gap-y-2', className)}>
      {ORDEN_ESTADOS.map((estado) => (
        <li key={estado} className="flex items-center gap-2 text-xs text-zinc-400">
          <span className={cx('h-2.5 w-2.5 rounded-[3px]', ESTADOS[estado].bar)} />
          {ESTADOS[estado].label}
          {conteos && <span className="num text-zinc-200">{Number(conteos[CLAVE_CONTEO[estado]] || 0)}</span>}
        </li>
      ))}
    </ul>
  );
}

export function Meter({ valor, className }) {
  return (
    <div className={cx('h-1 w-full overflow-hidden rounded-full bg-zinc-800/80', className)}>
      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(Math.max(valor, 0), 100)}%` }} />
    </div>
  );
}
