import { ChevronsLeft, ChevronsRight, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { cx, fecha } from '../lib/format';
import { ESTADO_AUDITORIA } from '../lib/meta';

function HealthIndicator({ health, collapsed }) {
  const conectada = health.estado === 'conectada';
  const verificando = health.estado === 'verificando';
  const etiqueta = verificando ? 'VERIFICANDO' : conectada ? 'API CONECTADA' : 'SIN CONEXIÓN';
  const tono = verificando ? 'bg-zinc-500' : conectada ? 'bg-emerald-400' : 'bg-rose-400';

  return (
    <button
      type="button"
      onClick={health.verificar}
      title={`${etiqueta}${health.detalle ? ` · ${health.detalle}` : ''} · clic para verificar`}
      className={cx(
        'group flex w-full items-center gap-2.5 rounded-md border border-zinc-800/90 bg-base px-2.5 py-2 text-left transition-colors hover:border-zinc-700',
        collapsed && 'justify-center px-0',
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {conectada && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />}
        <span className={cx('relative inline-flex h-2 w-2 rounded-full', tono)} />
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className={cx('block font-mono text-2xs font-semibold tracking-wider', conectada ? 'text-emerald-300' : verificando ? 'text-zinc-400' : 'text-rose-300')}>
            {etiqueta}
          </span>
          <span className="block truncate font-mono text-[10px] text-zinc-500">
            {conectada && health.latencia !== null ? `${health.detalle} · ${health.latencia} ms` : health.detalle || '—'}
          </span>
        </span>
      )}
      {!collapsed && <RefreshCw size={12} className="shrink-0 text-zinc-600 group-hover:text-zinc-400" />}
    </button>
  );
}

export default function Sidebar({
  nav,
  vista,
  onVista,
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
  auditorias,
  activaId,
  onActiva,
  health,
}) {
  const activa = auditorias.find((a) => a.id_auditoria === activaId);

  return (
    <>
      {mobileOpen && (
        <button type="button" aria-label="Cerrar menú" className="no-print fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={cx(
          'no-print fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-800/90 bg-[#0C0C0E] transition-[width,transform] duration-200',
          collapsed ? 'lg:w-[68px]' : 'lg:w-[264px]',
          'w-[280px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cx('flex h-14 items-center border-b border-zinc-800/90', collapsed ? 'lg:justify-center lg:px-0' : '', 'justify-between px-4')}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-base">
              <ShieldCheck size={15} className="text-emerald-400" strokeWidth={2} />
            </span>
            <span className={cx('leading-tight', collapsed && 'lg:hidden')}>
              <span className="block text-sm font-semibold tracking-tight text-zinc-100">AuditSys Mini</span>
              <span className="block font-mono text-[10px] text-zinc-500">ISO/IEC 27002:2022</span>
            </span>
          </div>
          <button type="button" onClick={onCloseMobile} className="rounded p-1 text-zinc-500 hover:text-zinc-200 lg:hidden">
            <X size={16} />
          </button>
        </div>

        <div className={cx('border-b border-zinc-800/90 px-3 py-3.5', collapsed && 'lg:hidden')}>
          <label htmlFor="auditoria-activa" className="label-caps mb-1.5 block px-1">
            Auditoría activa
          </label>
          <select
            id="auditoria-activa"
            value={activaId ?? ''}
            onChange={(e) => onActiva(Number(e.target.value))}
            className="input h-9 cursor-pointer py-0 pr-8 text-xs"
            disabled={auditorias.length === 0}
          >
            {auditorias.length === 0 && <option value="">Sin auditorías registradas</option>}
            {auditorias.map((a) => (
              <option key={a.id_auditoria} value={a.id_auditoria}>
                #{a.id_auditoria} · {a.organizacion}
              </option>
            ))}
          </select>
          {activa && (
            <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] text-zinc-500">
              <span>{ESTADO_AUDITORIA[activa.estado]}</span>
              <span className="tabular-nums">
                {fecha(activa.fecha_inicio)} → {fecha(activa.fecha_fin)}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
          <p className={cx('label-caps px-2 pb-2', collapsed && 'lg:hidden')}>Módulos</p>
          {nav.map((item, idx) => {
            const Icon = item.icon;
            const activo = vista === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  onVista(item.id);
                  onCloseMobile();
                }}
                className={cx(
                  'group relative flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-sm transition-colors',
                  collapsed && 'lg:justify-center lg:px-0',
                  activo ? 'bg-zinc-800/70 text-zinc-50' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100',
                )}
              >
                {activo && <span className="absolute left-0 top-2 h-5 w-[2px] rounded-r bg-emerald-400" />}
                <Icon size={16} strokeWidth={1.75} className={activo ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
                <span className={cx('flex-1 truncate text-left', collapsed && 'lg:hidden')}>{item.label}</span>
                <span className={cx('font-mono text-[10px] text-zinc-600', collapsed && 'lg:hidden')}>0{idx + 1}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-zinc-800/90 p-3">
          <HealthIndicator health={health} collapsed={collapsed} />
          <button
            type="button"
            onClick={onToggle}
            className={cx(
              'hidden h-8 w-full items-center gap-2 rounded-md px-2.5 text-xs text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-200 lg:flex',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
            {!collapsed && 'Contraer panel'}
          </button>
        </div>
      </aside>
    </>
  );
}
