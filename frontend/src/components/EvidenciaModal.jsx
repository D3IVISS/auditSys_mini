import { useEffect, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Button, Code, Field, Modal, useToast } from './ui';
import { api } from '../lib/api';
import { cx, hoyISO } from '../lib/format';
import { TIPOS_EVIDENCIA } from '../lib/meta';

const inicial = () => ({
  descripcion: '',
  fuente: '',
  tipo: 'DOCUMENTAL',
  referencia_archivo: '',
  fecha_recoleccion: hoyISO(),
  es_simulada: true,
});

export default function EvidenciaModal({ open, onClose, control, idEvaluacion, onCreada }) {
  const toast = useToast();
  const [form, setForm] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(inicial());
      setErrores({});
      setErrorGeneral(null);
    }
  }, [open]);

  const set = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.descripcion.trim().length < 5) er.descripcion = 'Describa la evidencia (mínimo 5 caracteres).';
    if (form.fuente.trim().length < 2) er.fuente = 'Indique la fuente de la evidencia.';
    setErrores(er);
    if (Object.keys(er).length) return;

    setEnviando(true);
    setErrorGeneral(null);
    try {
      const creada = await api.crearEvidencia({
        ...form,
        id_evaluacion: idEvaluacion,
        referencia_archivo: form.referencia_archivo.trim() || null,
      });
      toast(`Evidencia ${creada.codigo} vinculada al control ${creada.codigo_iso}.`);
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
      title="Adjuntar evidencia"
      subtitle={
        control ? (
          <>
            RF04 · Control <Code className="text-xs">{control.codigo_iso}</Code> {control.nombre}
          </>
        ) : null
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="form-evidencia" icon={Paperclip} loading={enviando}>
            Registrar evidencia
          </Button>
        </>
      }
    >
      <form id="form-evidencia" onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
        {errorGeneral && <p className="rounded-md border border-rose-500/25 bg-rose-500/[0.06] px-3 py-2 text-xs text-rose-200 sm:col-span-2">{errorGeneral}</p>}
        <Field label="Descripción del soporte" required error={errores.descripcion} className="sm:col-span-2">
          {({ id, invalid }) => (
            <textarea id={id} rows={3} className={cx('input resize-y', invalid && 'input-error')} value={form.descripcion} onChange={set('descripcion')} placeholder="Ej. Política de seguridad v2.0 aprobada por la gerencia" />
          )}
        </Field>
        <Field label="Fuente" required error={errores.fuente}>
          {({ id, invalid }) => (
            <input id={id} className={cx('input', invalid && 'input-error')} value={form.fuente} onChange={set('fuente')} placeholder="Área o persona que la suministra" />
          )}
        </Field>
        <Field label="Tipo" error={errores.tipo}>
          {({ id }) => (
            <select id={id} className="input" value={form.tipo} onChange={set('tipo')}>
              {Object.entries(TIPOS_EVIDENCIA).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Referencia del archivo" hint="Ruta, URL o nombre del documento soporte." error={errores.referencia_archivo}>
          {({ id, invalid }) => (
            <input id={id} className={cx('input font-mono text-xs', invalid && 'input-error')} value={form.referencia_archivo} onChange={set('referencia_archivo')} placeholder="evidencias/politica_v2.pdf" />
          )}
        </Field>
        <Field label="Fecha de recolección" error={errores.fecha_recoleccion}>
          {({ id, invalid }) => (
            <input id={id} type="date" className={cx('input num', invalid && 'input-error')} value={form.fecha_recoleccion} onChange={set('fecha_recoleccion')} />
          )}
        </Field>
        <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-zinc-800 bg-base px-3 py-2.5 sm:col-span-2">
          <input type="checkbox" checked={form.es_simulada} onChange={set('es_simulada')} className="mt-0.5 h-4 w-4 accent-emerald-500" />
          <span className="text-xs leading-relaxed text-zinc-300">
            Evidencia simulada
            <span className="block text-2xs text-zinc-500">Se marcará como simulada en el anexo del informe (ejercicio académico).</span>
          </span>
        </label>
      </form>
    </Modal>
  );
}
