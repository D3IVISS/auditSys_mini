import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, ChevronDown, ChevronRight, FileCheck2, Paperclip, Save, Search, SearchCheck } from 'lucide-react';
import { Alert, Button, Card, Chip, Code, Field, SegmentedEstado, StatusBadge, useToast } from '../components/ui';
import { Meter, StackedEstadoBar } from '../components/charts';
import EvidenciaModal from '../components/EvidenciaModal';
import HallazgoModal from '../components/HallazgoModal';
import { api } from '../lib/api';
import { cx, fecha } from '../lib/format';
import { CATEGORIAS, CLAVE_CONTEO, ESTADOS, ORDEN_ESTADOS, TIPOS_EVIDENCIA } from '../lib/meta';

function ControlEditor({ control, detalle, bloqueada, idAuditoria, onGuardado, onEvidencia, onHallazgo }) {
  const toast = useToast();
  const ev = control.evaluacion;
  const [estado, setEstado] = useState(ev?.estado || '');
  const [observacion, setObservacion] = useState(ev?.observacion || '');
  const [justificacion, setJustificacion] = useState(ev?.justificacion_na || '');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setEstado(ev?.estado || '');
    setObservacion(ev?.observacion || '');
    setJustificacion(ev?.justificacion_na || '');
    setErrores({});
    setErrorGeneral(null);
  }, [ev?.id_evaluacion, ev?.estado, ev?.observacion, ev?.justificacion_na]);

  const sucio =
    estado !== (ev?.estado || '') || observacion !== (ev?.observacion || '') || (estado === 'NO_APLICABLE' && justificacion !== (ev?.justificacion_na || ''));

  const guardar = async (e) => {
    e.preventDefault();
    const er = {};
    if (!estado) er.estado = 'Seleccione el estado del control.';
    if (observacion.trim().length < 5) er.observacion = 'Registre la observación del auditor (mínimo 5 caracteres).';
    if (estado === 'NO_APLICABLE' && justificacion.trim().length < 10)
      er.justificacion_na = 'NO_APLICABLE exige justificación (mínimo 10 caracteres).';
    setErrores(er);
    if (Object.keys(er).length) return;

    setGuardando(true);
    setErrorGeneral(null);
    try {
      const res = await api.evaluar({
        id_auditoria: idAuditoria,
        id_control: control.id_control,
        estado,
        observacion,
        justificacion_na: estado === 'NO_APLICABLE' ? justificacion : null,
      });
      toast(`Control ${control.codigo_iso} ${res.creada ? 'evaluado' : 'actualizado'} como ${estado}.`);
      await onGuardado();
    } catch (err) {
      setErrores(err.details || {});
      setErrorGeneral(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const evidencias = detalle?.evidencias || [];
  const hallazgos = detalle?.hallazgos || [];
  const sinSoporte = ev && ['IMPLEMENTADO', 'PARCIAL'].includes(ev.estado) && evidencias.length === 0;
  const admiteSoportes = ev && ev.estado !== 'NO_APLICABLE' && !bloqueada;

  return (
    <div className="grid gap-5 border-t border-zinc-800/90 bg-[#0D0D10] px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <div className="space-y-4">
        <div>
          <p className="label-caps mb-1.5">Criterio de auditoría</p>
          <p className="text-sm leading-relaxed text-zinc-300">{control.criterio}</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-base px-3.5 py-3">
          <p className="label-caps mb-1">Pregunta orientadora</p>
          <p className="text-sm leading-relaxed text-zinc-200">{control.pregunta_orientadora}</p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="label-caps">Evidencias · RF04</p>
            <Button size="sm" variant="secondary" icon={Paperclip} disabled={!admiteSoportes} onClick={onEvidencia}>
              Adjuntar
            </Button>
          </div>
          {!ev && <p className="text-xs text-zinc-500">Guarde la evaluación para adjuntar evidencias.</p>}
          {ev?.estado === 'NO_APLICABLE' && <p className="text-xs text-zinc-500">Control no aplicable: no requiere evidencia (RN03).</p>}
          {sinSoporte && <Alert className="mb-2">Estado {ev.estado} sin evidencia de soporte. Adjunte al menos una evidencia.</Alert>}
          {evidencias.length > 0 && (
            <ul className="divide-y divide-zinc-800/90 rounded-md border border-zinc-800">
              {evidencias.map((e) => (
                <li key={e.id_evidencia} className="flex items-start gap-3 px-3 py-2.5">
                  <FileCheck2 size={14} className="mt-0.5 shrink-0 text-zinc-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-200">
                      <Code className="mr-2 text-emerald-300">{e.codigo}</Code>
                      {e.descripcion}
                    </p>
                    <p className="mt-0.5 text-2xs text-zinc-500">
                      {TIPOS_EVIDENCIA[e.tipo]} · {e.fuente} · <span className="num">{fecha(e.fecha_recoleccion)}</span>
                      {e.es_simulada && <span className="ml-1.5 font-mono uppercase text-amber-300/80">simulada</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="label-caps mr-1">Hallazgos</p>
          {hallazgos.length === 0 ? <span className="text-xs text-zinc-500">Ninguno</span> : hallazgos.map((h) => <Chip key={h}>{h}</Chip>)}
          <Button size="sm" variant="ghost" icon={SearchCheck} className="ml-auto" disabled={!admiteSoportes} onClick={onHallazgo}>
            Registrar hallazgo
          </Button>
        </div>
      </div>

      <form onSubmit={guardar} className="space-y-4 rounded-lg border border-zinc-800/90 bg-panel p-4" noValidate>
        <div className="flex items-center justify-between">
          <p className="label-caps">Evaluación · RF03</p>
          {ev && <span className="num text-2xs text-zinc-500">Actualizado {fecha(ev.actualizado_en)}</span>}
        </div>
        {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}
        <Field label="Estado del control" required error={errores.estado}>
          <SegmentedEstado value={estado} onChange={(v) => { setEstado(v); setErrores((x) => ({ ...x, estado: undefined })); }} opciones={ORDEN_ESTADOS} />
        </Field>
        <Field label="Observación del auditor" required error={errores.observacion}>
          {({ id, invalid }) => (
            <textarea
              id={id}
              rows={3}
              disabled={bloqueada}
              className={cx('input resize-y', invalid && 'input-error')}
              value={observacion}
              onChange={(e) => { setObservacion(e.target.value); setErrores((x) => ({ ...x, observacion: undefined })); }}
              placeholder="Hechos verificados frente al criterio"
            />
          )}
        </Field>
        {estado === 'NO_APLICABLE' && (
          <Field label="Justificación de exclusión (N/A)" required error={errores.justificacion_na} hint="Se excluye del denominador del indicador (RF07).">
            {({ id, invalid }) => (
              <textarea
                id={id}
                rows={2}
                disabled={bloqueada}
                className={cx('input resize-y', invalid && 'input-error')}
                value={justificacion}
                onChange={(e) => { setJustificacion(e.target.value); setErrores((x) => ({ ...x, justificacion_na: undefined })); }}
                placeholder="Motivo por el cual el control no aplica al alcance"
              />
            )}
          </Field>
        )}
        <div className="flex items-center justify-end gap-2 pt-1">
          {sucio && <span className="mr-auto text-2xs text-amber-300/80">Cambios sin guardar</span>}
          <Button type="submit" variant="primary" icon={Save} loading={guardando} disabled={bloqueada || !sucio}>
            {ev ? 'Actualizar evaluación' : 'Guardar evaluación'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EvaluacionView({ ws }) {
  const { controles, reporte, indicadores, activa } = ws;
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('TODOS');
  const [abiertos, setAbiertos] = useState(() => new Set(Object.keys(CATEGORIAS)));
  const [expandido, setExpandido] = useState(null);
  const [modalEvidencia, setModalEvidencia] = useState(null);
  const [modalHallazgo, setModalHallazgo] = useState(null);
  const bloqueada = activa?.estado === 'CERRADA';

  const detallePorEval = useMemo(
    () => new Map((reporte?.evaluaciones || []).map((e) => [e.id_evaluacion, e])),
    [reporte],
  );

  const q = busqueda.trim().toLowerCase();
  const filtrados = controles.filter((c) => {
    const estado = c.evaluacion?.estado || 'SIN_EVALUAR';
    if (filtro !== 'TODOS' && estado !== filtro) return false;
    if (!q) return true;
    return [c.codigo_iso, c.nombre, c.pregunta_orientadora].some((t) => t.toLowerCase().includes(q));
  });

  const conteoFiltro = (k) => (k === 'TODOS' ? controles.length : controles.filter((c) => (c.evaluacion?.estado || 'SIN_EVALUAR') === k).length);

  const toggle = (cat) =>
    setAbiertos((s) => {
      const n = new Set(s);
      if (n.has(cat)) n.delete(cat);
      else n.add(cat);
      return n;
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Evaluación de controles</h1>
          <p className="mt-1 text-sm text-zinc-500">Catálogo normativo ISO/IEC 27002:2022 · RF02 · RF03 · RF04</p>
        </div>
        {indicadores && (
          <div className="w-full max-w-xs">
            <div className="mb-1.5 flex justify-between text-2xs">
              <span className="label-caps">Avance</span>
              <span className="num text-zinc-300">
                {indicadores.evaluados}/{indicadores.total_catalogo} · {indicadores.avance_evaluacion.toFixed(1)}%
              </span>
            </div>
            <Meter valor={indicadores.avance_evaluacion} />
          </div>
        )}
      </div>

      {bloqueada && <Alert tone="info">La auditoría está CERRADA. Las evaluaciones son de solo lectura.</Alert>}

      <Card className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="relative md:w-72">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input className="input h-9 pl-8 text-xs" placeholder="Buscar por código, nombre o pregunta…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="scrollbar-thin flex gap-1.5 overflow-x-auto">
          {['TODOS', 'SIN_EVALUAR', ...ORDEN_ESTADOS].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFiltro(k)}
              className={cx(
                'flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors',
                filtro === k ? 'border-zinc-600 bg-zinc-800/80 text-zinc-100' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200',
              )}
            >
              {ESTADOS[k] && <span className={cx('h-1.5 w-1.5 rounded-full', ESTADOS[k].dot)} />}
              {k === 'TODOS' ? 'Todos' : k === 'SIN_EVALUAR' ? 'Sin evaluar' : ESTADOS[k].label}
              <span className="num text-zinc-500">{conteoFiltro(k)}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {Object.entries(CATEGORIAS).map(([cat, meta]) => {
          const delDominio = filtrados.filter((c) => c.categoria === cat);
          const dominio = indicadores?.por_dominio.find((d) => d.categoria === cat);
          if (controles.every((c) => c.categoria !== cat)) return null;
          const abierto = abiertos.has(cat);
          return (
            <Card key={cat} className="overflow-hidden">
              <button type="button" onClick={() => toggle(cat)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-zinc-800/20 sm:px-5">
                {abierto ? <ChevronDown size={15} className="text-zinc-500" /> : <ChevronRight size={15} className="text-zinc-500" />}
                <span className="num w-8 text-sm text-zinc-500">{meta.clausula}.x</span>
                <span className="flex-1 text-sm font-medium text-zinc-100">Controles {meta.label.toLowerCase()}</span>
                {dominio && (
                  <span className="hidden w-40 sm:block">
                    <StackedEstadoBar conteos={dominio} height="h-1.5" etiqueta={meta.label} />
                  </span>
                )}
                <span className="num w-16 text-right text-xs text-zinc-400">
                  {delDominio.length} ctrl
                </span>
              </button>
              {abierto && (
                <ul className="divide-y divide-zinc-800/90 border-t border-zinc-800/90">
                  {delDominio.length === 0 && <li className="px-5 py-4 text-xs text-zinc-500">Sin coincidencias con el filtro actual.</li>}
                  {delDominio.map((c) => {
                    const exp = expandido === c.id_control;
                    const detalle = c.evaluacion ? detallePorEval.get(c.evaluacion.id_evaluacion) : null;
                    return (
                      <li key={c.id_control}>
                        <button
                          type="button"
                          onClick={() => setExpandido(exp ? null : c.id_control)}
                          className={cx('grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/20 sm:grid-cols-[64px_1fr_150px_90px_20px] sm:px-5', exp && 'bg-zinc-800/20')}
                        >
                          <Code className="text-sm">{c.codigo_iso}</Code>
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-zinc-100">{c.nombre}</span>
                            <span className="block truncate text-xs text-zinc-500">{c.pregunta_orientadora}</span>
                          </span>
                          <span className="sm:justify-self-start">
                            <StatusBadge estado={c.evaluacion?.estado} size="sm" />
                          </span>
                          <span className="num hidden items-center gap-1 text-2xs text-zinc-500 sm:flex">
                            <BookOpenCheck size={12} />
                            {c.evaluacion ? `${c.evaluacion.total_evidencias} ev · ${c.evaluacion.total_hallazgos} h` : '—'}
                          </span>
                          <ChevronDown size={14} className={cx('hidden text-zinc-600 transition-transform sm:block', exp && 'rotate-180')} />
                        </button>
                        {exp && (
                          <ControlEditor
                            control={c}
                            detalle={detalle}
                            bloqueada={bloqueada}
                            idAuditoria={ws.activaId}
                            onGuardado={ws.refrescar}
                            onEvidencia={() => setModalEvidencia(c)}
                            onHallazgo={() => setModalHallazgo(c.evaluacion.id_evaluacion)}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <p className="flex flex-wrap gap-x-4 gap-y-1 text-2xs text-zinc-600">
        {ORDEN_ESTADOS.map((e) => (
          <span key={e}>
            <span className="font-mono">{e}</span> · {indicadores ? indicadores[CLAVE_CONTEO[e]] : 0}
          </span>
        ))}
      </p>

      <EvidenciaModal
        open={Boolean(modalEvidencia)}
        onClose={() => setModalEvidencia(null)}
        control={modalEvidencia}
        idEvaluacion={modalEvidencia?.evaluacion?.id_evaluacion}
        onCreada={async () => {
          setModalEvidencia(null);
          await ws.refrescar();
        }}
      />
      <HallazgoModal
        open={modalHallazgo !== null}
        onClose={() => setModalHallazgo(null)}
        controles={controles}
        idEvaluacionInicial={modalHallazgo}
        onCreado={async () => {
          setModalHallazgo(null);
          await ws.refrescar();
        }}
      />
    </div>
  );
}
