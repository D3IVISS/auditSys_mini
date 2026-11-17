import { useEffect, useState } from 'react';
import { ClipboardCheck, FileText, GitBranch, LayoutDashboard, Menu, RefreshCw, SearchCheck } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { Alert, Button, Spinner, ToastProvider } from './components/ui';
import { useApiHealth } from './hooks/useApiHealth';
import { useAuditWorkspace } from './hooks/useAuditWorkspace';
import { cx } from './lib/format';
import { ESTADO_AUDITORIA } from './lib/meta';
import DashboardView from './views/DashboardView';
import EvaluacionView from './views/EvaluacionView';
import HallazgosView from './views/HallazgosView';
import TrazabilidadView from './views/TrazabilidadView';
import InformeView from './views/InformeView';

const NAV = [
  { id: 'dashboard', label: 'Dashboard ejecutivo', icon: LayoutDashboard, titulo: 'Dashboard ejecutivo' },
  { id: 'evaluacion', label: 'Evaluación de controles', icon: ClipboardCheck, titulo: 'Evaluación de controles' },
  { id: 'hallazgos', label: 'Hallazgos y CAPA', icon: SearchCheck, titulo: 'Hallazgos y acciones CAPA' },
  { id: 'trazabilidad', label: 'Evidencias y trazabilidad', icon: GitBranch, titulo: 'Evidencias y trazabilidad' },
  { id: 'informe', label: 'Informe ISO 19011', icon: FileText, titulo: 'Informe de auditoría · ISO 19011:2018' },
];

const leerVista = () => {
  const hash = window.location.hash.replace('#/', '');
  return NAV.some((n) => n.id === hash) ? hash : 'dashboard';
};

function Shell() {
  const health = useApiHealth();
  const ws = useAuditWorkspace();
  const [vista, setVista] = useState(leerVista);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setVista(leerVista());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const irA = (id) => {
    window.location.hash = `/${id}`;
    setVista(id);
    window.scrollTo({ top: 0 });
  };

  const actual = NAV.find((n) => n.id === vista);
  const sinDatos = !ws.indicadores && !ws.cargandoDatos;

  const props = { ws, irA, health };

  return (
    <div className="min-h-screen bg-base">
      <Sidebar
        nav={NAV}
        vista={vista}
        onVista={irA}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        auditorias={ws.auditorias}
        activaId={ws.activaId}
        onActiva={ws.setActivaId}
        health={health}
      />

      <div className={cx('transition-[padding] duration-200 print:!pl-0', collapsed ? 'lg:pl-[68px]' : 'lg:pl-[264px]')}>
        <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-800/90 bg-base/95 px-4 backdrop-blur-sm sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <span className="hidden truncate text-zinc-500 sm:inline">{ws.activa?.organizacion || 'AuditSys Mini'}</span>
            <span className="hidden text-zinc-700 sm:inline">/</span>
            <span className="truncate font-medium text-zinc-100">{actual?.titulo}</span>
          </div>
          {ws.activa && (
            <span className="hidden items-center gap-2 rounded border border-zinc-800 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 md:inline-flex">
              <span className="text-zinc-600">ID</span>
              <span className="tabular-nums text-zinc-200">AUD-{String(ws.activa.id_auditoria).padStart(3, '0')}</span>
              <span className="text-zinc-700">·</span>
              {ESTADO_AUDITORIA[ws.activa.estado]}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            loading={ws.cargandoDatos || ws.cargandoLista}
            onClick={ws.refrescar}
            aria-label="Sincronizar con la API"
          >
            <span className="hidden sm:inline">Sincronizar</span>
          </Button>
        </header>

        <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:py-8 print:max-w-none print:p-0">
          {ws.error && (
            <Alert tone="error" className="no-print mb-5">
              <span className="font-medium">{ws.error.message}</span>{' '}
              <span className="text-rose-300/80">
                Endpoint: <span className="font-mono">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</span>
              </span>
            </Alert>
          )}

          {ws.cargandoLista && ws.auditorias.length === 0 ? (
            <div className="py-24">
              <Spinner label="Sincronizando con la API…" />
            </div>
          ) : vista === 'dashboard' ? (
            <DashboardView {...props} />
          ) : !ws.activaId ? (
            <Alert tone="info">Registre una auditoría desde el Dashboard ejecutivo para habilitar este módulo.</Alert>
          ) : sinDatos ? (
            <Spinner label="Cargando datos de la auditoría…" />
          ) : vista === 'evaluacion' ? (
            <EvaluacionView {...props} />
          ) : vista === 'hallazgos' ? (
            <HallazgosView {...props} />
          ) : vista === 'trazabilidad' ? (
            <TrazabilidadView {...props} />
          ) : (
            <InformeView {...props} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
