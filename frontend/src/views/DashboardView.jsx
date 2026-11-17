import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, Building2, CalendarRange, FolderPlus, Layers, ListChecks, Plus, Scale, ShieldAlert, Target } from 'lucide-react';
import { Button, Card, CardHeader, EmptyState, Field, Modal, SeverityBadge, Spinner, useToast } from '../components/ui';
import { EstadoLegend, Meter, StackedEstadoBar } from '../components/charts';
import { api } from '../lib/api';
import { cx, fecha, pct } from '../lib/format';
import { CATEGORIAS, ESTADO_AUDITORIA, ORDEN_SEVERIDAD } from '../lib/meta';

function Kpi({ label, value, formula, hint, icon: Icon, accent, children }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="label-caps">{label}</span>
        {Icon && <Icon size={14} className="text-zinc-600" strokeWidth={1.75} />}
      </div>
      <div className={cx('num mt-3 text-[32px] font-semibold leading-none tracking-tight', accent ? 'text-emerald-400' : 'text-zinc-50')}>
        {value}
      </div>
      {formula && <div className="num mt-2 text-xs text-zinc-500">{formula}</div>}
      {children && <div className="mt-4">{children}</div>}
      {hint && <p className="mt-auto pt-3 text-2xs leading-relaxed text-zinc-500">{hint}</p>}
    </Card>
  );
}

const FORM_INICIAL = {
  organizacion: '',
  objetivo: '',
  alcance: '',
  referentes: 'ISO 19011:2018; ISO/IEC 27001:2022; ISO/IEC 27002:2022',
  fecha_inicio: '',
  fecha_fin: '',
  id_auditor: '',
};

function NuevaAuditoriaModal({ open, onClose, onCreada }) {
  const toast = useToast();
  const [form, setForm] = useState(FORM_INICIAL);
  const [auditores, setAuditores] = useState([]);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrores({});
    setErrorGeneral(null);
    api
      .usuarios()
      .then((lista) => {
        setAuditores(lista);
        setForm((f) => ({ ...f, id_auditor: f.id_auditor || String(lista[0]?.id_usuario ?? '') }));
      })
      .catch((e) => setErrorGeneral(e.message));
  }, [open]);

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const validarCliente = () => {
    const er = {};
    if (form.organizacion.trim().length < 3) er.organizacion = 'Indique la organización (mínimo 3 caracteres).';
    if (form.objetivo.trim().length < 10) er.objetivo = 'Describa el objetivo (mínimo 10 caracteres).';
    if (form.alcance.trim().length < 10) er.alcance = 'Describa el alcance (mínimo 10 caracteres).';
    if (!form.fecha_inicio) er.fecha_inicio = 'Seleccione la fecha de inicio.';
    if (!form.fecha_fin) er.fecha_fin = 'Seleccione la fecha de cierre.';
    if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio)
      er.fecha_fin = 'La fecha de cierre debe ser posterior o igual a la de inicio.';
    if (!form.id_auditor) er.id_auditor = 'Seleccione el auditor responsable.';
    setErrores(er);
    return Object.keys(er).length === 0;
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!validarCliente()) return;
    setEnviando(true);
    setErrorGeneral(null);
    try {
      const creada = await api.crearAuditoria({ ...form, id_auditor: Number(form.id_auditor) });
      toast(`Auditoría AUD-${String(creada.id_auditoria).padStart(3, '0')} registrada en estado BORRADOR.`);
      setForm(FORM_INICIAL);
      onCreada(creada);
    } catch (err) {
      setErrores(err.details || {});
      setErrorGeneral(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar nueva auditoría"
      subtitle="RF01 · Datos generales del encargo de auditoría"
      width="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="form-auditoria" loading={enviando} icon={FolderPlus}>
            Registrar auditoría
          </Button>
        </>
      }
    >
      <form id="form-auditoria" onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
        {errorGeneral && <p className="rounded-md border border-rose-500/25 bg-rose-500/[0.06] px-3 py-2 text-xs text-rose-200 sm:col-span-2">{errorGeneral}</p>}
        <Field label="Organización auditada" required error={errores.organizacion} className="sm:col-span-2">
          {({ id, invalid }) => (
            <input id={id} className={cx('input', invalid && 'input-error')} value={form.organizacion} onChange={set('organizacion')} maxLength={120} placeholder="Nombre de la organización" />
          )}
        </Field>
        <Field label="Objetivo" required error={errores.objetivo} className="sm:col-span-2">
          {({ id, invalid }) => (
            <textarea id={id} rows={2} className={cx('input resize-y', invalid && 'input-error')} value={form.objetivo} onChange={set('objetivo')} />
          )}
        </Field>
        <Field label="Alcance" required error={errores.alcance} className="sm:col-span-2">
          {({ id, invalid }) => (
            <textarea id={id} rows={2} className={cx('input resize-y', invalid && 'input-error')} value={form.alcance} onChange={set('alcance')} />
          )}
        </Field>
        <Field label="Fecha de inicio" required error={errores.fecha_inicio}>
          {({ id, invalid }) => (
            <input id={id} type="date" className={cx('input num', invalid && 'input-error')} value={form.fecha_inicio} onChange={set('fecha_inicio')} />
          )}
        </Field>
        <Field label="Fecha de cierre" required error={errores.fecha_fin}>
          {({ id, invalid }) => (
            <input id={id} type="date" min={form.fecha_inicio || undefined} className={cx('input num', invalid && 'input-error')} value={form.fecha_fin} onChange={set('fecha_fin')} />
          )}
        </Field>
        <Field label="Auditor responsable" required error={errores.id_auditor}>
          {({ id, invalid }) => (
            <select id={id} className={cx('input', invalid && 'input-error')} value={form.id_auditor} onChange={set('id_auditor')}>
              {auditores.length === 0 && <option value="">Cargando…</option>}
              {auditores.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre} · {u.rol}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Referentes normativos" error={errores.referentes}>
          {({ id, invalid }) => <input id={id} className={cx('input', invalid && 'input-error')} value={form.referentes} onChange={set('referentes')} />}
        </Field>
      </form>
    </Modal>
  );
}

export default function DashboardView({ ws, irA }) {
  const [modal, setModal] = useState(false);
  const { indicadores: ind, activa, auditorias } = ws;

  const onCreada = useCallback(
    async (creada) => {
      setModal(false);
      await ws.refrescar();
      ws.setActivaId(creada.id_auditoria);
    },
    [ws],
  );

  if (auditorias.length === 0) {
    return (
      <>
        <Card>
          <EmptyState
            icon={FolderPlus}
            title="No hay auditorías registradas"
            description="Registre el primer encargo de auditoría para comenzar a evaluar los controles del catálogo ISO/IEC 27002:2022."
            action={
              <Button variant="primary" icon={Plus} onClick={() => setModal(true)}>
                Nueva auditoría
              </Button>
            }
          />
        </Card>
        <NuevaAuditoriaModal open={modal} onClose={() => setModal(false)} onCreada={onCreada} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="label-caps">Auditoría activa</p>
          <h1 className="mt-1.5 truncate text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">{activa?.organizacion}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarRange size={13} />
              <span className="num">
                {fecha(activa?.fecha_inicio)} → {fecha(activa?.fecha_fin)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={13} />
              {activa?.auditor_nombre}
            </span>
            <span className="rounded border border-zinc-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              {ESTADO_AUDITORIA[activa?.estado]}
            </span>
          </div>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModal(true)}>
          Nueva auditoría
        </Button>
      </div>

      {!ind ? (
        <Spinner label="Calculando indicadores…" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="Indicador base"
              value={pct(ind.indicador_base)}
              formula={`${ind.formula_base} implementados / aplicables`}
              icon={Target}
              accent
              hint="RF07 · Los controles NO_APLICABLE se excluyen del denominador."
            >
              <Meter valor={ind.indicador_base} />
            </Kpi>
            <Kpi
              label="Índice ponderado"
              value={pct(ind.indice_ponderado)}
              formula={ind.formula_ponderada}
              icon={Scale}
              hint={`Reconoce el avance parcial con peso ${ind.peso_parcial}.`}
            >
              <Meter valor={ind.indice_ponderado} />
            </Kpi>
            <Kpi
              label="Controles evaluados"
              value={
                <>
                  {ind.evaluados}
                  <span className="text-lg text-zinc-600">/{ind.total_catalogo}</span>
                </>
              }
              formula={`${ind.aplicables} aplicables · ${ind.no_aplicables} N/A · ${ind.sin_evaluar} pendientes`}
              icon={ListChecks}
              hint={`Avance de la evaluación: ${pct(ind.avance_evaluacion)}`}
            >
              <Meter valor={ind.avance_evaluacion} />
            </Kpi>
            <Kpi label="Hallazgos" value={ind.total_hallazgos} icon={ShieldAlert} hint="RF05 · Condición, criterio, causa y efecto documentados.">
              <div className="flex flex-wrap gap-1.5">
                {ORDEN_SEVERIDAD.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5">
                    <SeverityBadge severidad={s} />
                    <span className="num text-xs text-zinc-300">{ind.hallazgos_por_severidad[s]}</span>
                  </span>
                ))}
              </div>
            </Kpi>
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <Card className="xl:col-span-3">
              <CardHeader
                icon={Layers}
                title="Distribución por dominio ISO/IEC 27002"
                subtitle="Estado de los controles por cláusula · indicador base / índice ponderado por dominio"
              />
              <div className="space-y-5 px-5 py-5">
                <EstadoLegend />
                <ul className="space-y-4">
                  {ind.por_dominio.map((d) => (
                    <li key={d.categoria} className="grid grid-cols-[minmax(0,150px)_1fr] items-center gap-4 sm:grid-cols-[170px_1fr_120px]">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-zinc-200">
                          <span className="num mr-2 text-zinc-500">{CATEGORIAS[d.categoria].clausula}.x</span>
                          {CATEGORIAS[d.categoria].label}
                        </p>
                        <p className="num text-2xs text-zinc-500">
                          {d.evaluados}/{d.total_catalogo} evaluados
                        </p>
                      </div>
                      <StackedEstadoBar conteos={d} etiqueta={`Dominio ${CATEGORIAS[d.categoria].label}`} />
                      <div className="col-span-2 flex justify-between gap-3 text-right sm:col-span-1 sm:block">
                        <p className="num text-sm text-zinc-100">{d.aplicables > 0 ? pct(d.indicador_base) : '—'}</p>
                        <p className="num text-2xs text-zinc-500">pond. {d.aplicables > 0 ? pct(d.indice_ponderado) : '—'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-zinc-800/90 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="label-caps">Consolidado</span>
                    <span className="num text-2xs text-zinc-500">{ind.evaluados} controles</span>
                  </div>
                  <StackedEstadoBar conteos={ind} height="h-3" etiqueta="Consolidado por estado" />
                  <EstadoLegend conteos={ind} className="mt-3" />
                </div>
              </div>
            </Card>

            <Card className="flex flex-col xl:col-span-2">
              <CardHeader
                icon={ListChecks}
                title="Auditorías registradas"
                subtitle="RF01 · Seleccione para cambiar la auditoría activa"
              />
              <ul className="scrollbar-thin max-h-[440px] flex-1 divide-y divide-zinc-800/90 overflow-y-auto">
                {auditorias.map((a) => {
                  const activaFila = a.id_auditoria === ws.activaId;
                  return (
                    <li key={a.id_auditoria}>
                      <button
                        type="button"
                        onClick={() => ws.setActivaId(a.id_auditoria)}
                        className={cx('flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-zinc-800/30', activaFila && 'bg-zinc-800/30')}
                      >
                        <span className={cx('h-8 w-[2px] shrink-0 rounded', activaFila ? 'bg-emerald-400' : 'bg-transparent')} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="num text-2xs text-zinc-500">AUD-{String(a.id_auditoria).padStart(3, '0')}</span>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{ESTADO_AUDITORIA[a.estado]}</span>
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-zinc-100">{a.organizacion}</span>
                          <span className="num block text-2xs text-zinc-500">
                            {fecha(a.fecha_inicio)} → {fecha(a.fecha_fin)} · {a.resumen.evaluados} eval. · {a.resumen.total_hallazgos} hall.
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="num block text-sm text-zinc-100">{pct(a.resumen.indicador_base)}</span>
                          <span className="num block text-2xs text-zinc-500">{pct(a.resumen.indice_ponderado)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex gap-2 border-t border-zinc-800/90 p-3">
                <Button size="sm" variant="secondary" className="flex-1" icon={ArrowUpRight} onClick={() => irA('evaluacion')}>
                  Evaluar controles
                </Button>
                <Button size="sm" variant="secondary" className="flex-1" icon={ArrowUpRight} onClick={() => irA('informe')}>
                  Ver informe
                </Button>
              </div>
            </Card>
          </div>

          <p className="text-2xs leading-relaxed text-zinc-600">{ind.salvaguarda}</p>
        </>
      )}

      <NuevaAuditoriaModal open={modal} onClose={() => setModal(false)} onCreada={onCreada} />
    </div>
  );
}
