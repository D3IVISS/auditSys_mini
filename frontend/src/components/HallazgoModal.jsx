import { useEffect, useMemo, useState } from 'react';
import { SearchCheck } from 'lucide-react';
import { Button, Field, Modal, StatusBadge, useToast } from './ui';
import { api } from '../lib/api';
import { cx } from '../lib/format';
import { ORDEN_SEVERIDAD, SEVERIDAD } from '../lib/meta';

const inicial = () => ({
  id_evaluacion: '',
  severidad: 'MEDIA',
  condicion: '',
  criterio: '',
  causa: '',
  efecto_riesgo: '',
  rec_descripcion: '',
  rec_prioridad: 'MEDIA',
  rec_plazo: '90',
});

export default function HallazgoModal({ open, onClose, controles, idEvaluacionInicial, onCreado }) {
  const toast = useToast();
  const [form, setForm] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const elegibles = useMemo(
    () => controles.filter((c) => c.evaluacion && c.evaluacion.estado !== 'NO_APLICABLE'),
    [controles],
  );

  const criterioDe = (idEval) => elegibles.find((c) => String(c.evaluacion.id_evaluacion) === String(idEval))?.criterio || '';

  useEffect(() => {
    if (!open) return;
    const base = inicial();
    const preferido = idEvaluacionInicial ?? elegibles.find((c) => c.evaluacion.estado === 'NO_IMPLEMENTADO')?.evaluacion.id_evaluacion ?? elegibles[0]?.evaluacion.id_evaluacion;
    base.id_evaluacion = preferido ? String(preferido) : '';
    base.criterio = preferido ? criterioDe(preferido) : '';
    setForm(base);
    setErrores({});
    setErrorGeneral(null);
  }, [open, idEvaluacionInicial]);

  const seleccionado = elegibles.find((c) => String(c.evaluacion.id_evaluacion) === form.id_evaluacion);

  const set = (campo) => (e) => {
    const valor = e.target.value;
    setForm((f) => {
      const next = { ...f, [campo]: valor };
      if (campo === 'id_evaluacion') next.criterio = criterioDe(valor);
      if (campo === 'severidad') next.rec_prioridad = valor;
      return next;
    });
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.id_evaluacion) er.id_evaluacion = 'Seleccione un control evaluado.';
    if (form.condicion.trim().length < 10) er.condicion = 'Describa la condición observada (mínimo 10 caracteres).';
    if (form.criterio.trim().length < 10) er.criterio = 'Indique el criterio de auditoría.';
    if (form.causa.trim().length < 5) er.causa = 'Indique la causa raíz.';
    if (form.efecto_riesgo.trim().length < 10) er.efecto_riesgo = 'Describa el efecto o riesgo.';
    if (form.rec_descripcion.trim().length < 10) er['recomendacion.descripcion'] = 'Describa la acción recomendada.';
    const plazo = Number.parseInt(form.rec_plazo, 10);
    if (!Number.isInteger(plazo) || plazo < 1 || plazo > 730) er['recomendacion.plazo_dias'] = 'Plazo entre 1 y 730 días.';
    setErrores(er);
    if (Object.keys(er).length) return;

    setEnviando(true);
    setErrorGeneral(null);
    try {
      const res = await api.crearHallazgo({
        id_evaluacion: Number(form.id_evaluacion),
        severidad: form.severidad,
        condicion: form.condicion,
        criterio: form.criterio,
        causa: form.causa,
        efecto_riesgo: form.efecto_riesgo,
        recomendacion: { descripcion: form.rec_descripcion, prioridad: form.rec_prioridad, plazo_dias: plazo },
      });
      toast(`Hallazgo ${res.hallazgo.codigo} y recomendación ${res.recomendacion.codigo} registrados.`);
      onCreado(res);
    } catch (err) {
      setErrores(err.details || {});
      setErrorGeneral(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const area = (campo, label, rows = 2, placeholder = '') => (
    <Field label={label} required error={errores[campo]}>
      {({ id, invalid }) => (
        <textarea id={id} rows={rows} placeholder={placeholder} className={cx('input resize-y', invalid && 'input-error')} value={form[campo]} onChange={set(campo)} />
      )}
    </Field>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-3xl"
      title="Registrar hallazgo"
      subtitle="RF05 · RF06 · El código H-nn y la recomendación R-nn se generan automáticamente"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="form-hallazgo" icon={SearchCheck} loading={enviando} disabled={elegibles.length === 0}>
            Registrar hallazgo
          </Button>
        </>
      }
    >
      {elegibles.length === 0 ? (
        <p className="text-sm text-zinc-400">Evalúe al menos un control aplicable antes de registrar hallazgos.</p>
      ) : (
        <form id="form-hallazgo" onSubmit={enviar} className="space-y-5" noValidate>
          {errorGeneral && <p className="rounded-md border border-rose-500/25 bg-rose-500/[0.06] px-3 py-2 text-xs text-rose-200">{errorGeneral}</p>}
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <Field label="Control vinculado" required error={errores.id_evaluacion}>
              {({ id, invalid }) => (
                <select id={id} className={cx('input', invalid && 'input-error')} value={form.id_evaluacion} onChange={set('id_evaluacion')}>
                  {elegibles.map((c) => (
                    <option key={c.evaluacion.id_evaluacion} value={c.evaluacion.id_evaluacion}>
                      {c.codigo_iso} · {c.nombre} — {c.evaluacion.estado}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Severidad" required error={errores.severidad}>
              {({ id }) => (
                <select id={id} className="input" value={form.severidad} onChange={set('severidad')}>
                  {ORDEN_SEVERIDAD.map((s) => (
                    <option key={s} value={s}>
                      {SEVERIDAD[s].label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          {seleccionado && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              Estado evaluado: <StatusBadge estado={seleccionado.evaluacion.estado} size="sm" />
              <span className="truncate">“{seleccionado.evaluacion.observacion}”</span>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {area('condicion', 'Condición (qué se encontró)', 3)}
            {area('criterio', 'Criterio (qué exige la norma)', 3)}
            {area('causa', 'Causa (por qué ocurre)', 2)}
            {area('efecto_riesgo', 'Efecto o riesgo', 2)}
          </div>
          <div className="rounded-lg border border-zinc-800 bg-base p-4">
            <p className="label-caps mb-3">Recomendación · acción CAPA</p>
            <div className="grid gap-4 sm:grid-cols-[1fr_140px_120px]">
              <Field label="Acción recomendada" required error={errores['recomendacion.descripcion']}>
                {({ id, invalid }) => (
                  <textarea id={id} rows={2} className={cx('input resize-y', invalid && 'input-error')} value={form.rec_descripcion} onChange={set('rec_descripcion')} />
                )}
              </Field>
              <Field label="Prioridad" required error={errores['recomendacion.prioridad']}>
                {({ id }) => (
                  <select id={id} className="input" value={form.rec_prioridad} onChange={set('rec_prioridad')}>
                    {ORDEN_SEVERIDAD.map((s) => (
                      <option key={s} value={s}>
                        {SEVERIDAD[s].label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Plazo (días)" required error={errores['recomendacion.plazo_dias']}>
                {({ id, invalid }) => (
                  <input id={id} type="number" min={1} max={730} className={cx('input num', invalid && 'input-error')} value={form.rec_plazo} onChange={set('rec_plazo')} />
                )}
              </Field>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
