import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

const STORAGE_KEY = 'auditsys.auditoriaActiva';

const leerActiva = () => {
  try {
    const valor = Number.parseInt(window.localStorage.getItem(STORAGE_KEY) || '', 10);
    return Number.isInteger(valor) && valor > 0 ? valor : null;
  } catch {
    return null;
  }
};

const guardarActiva = (id) => {
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, String(id));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* almacenamiento no disponible: la selección vive solo en memoria */
  }
};

/**
 * Estado del espacio de trabajo sincronizado 100 % con la API REST.
 * Tras cada mutación se invoca `refrescar()` para releer la fuente de verdad.
 */
export function useAuditWorkspace() {
  const [auditorias, setAuditorias] = useState([]);
  const [activaId, setActivaIdState] = useState(leerActiva);
  const [datos, setDatos] = useState({ indicadores: null, controles: [], reporte: null });
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [error, setError] = useState(null);
  const solicitud = useRef(0);

  const setActivaId = useCallback((id) => {
    setActivaIdState(id);
    guardarActiva(id);
  }, []);

  const cargarLista = useCallback(async () => {
    setCargandoLista(true);
    try {
      const lista = await api.auditorias();
      setAuditorias(lista);
      setError(null);
      setActivaIdState((actual) => {
        const valida = lista.some((a) => a.id_auditoria === actual) ? actual : lista[0]?.id_auditoria ?? null;
        guardarActiva(valida);
        return valida;
      });
      return lista;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setCargandoLista(false);
    }
  }, []);

  const cargarDatos = useCallback(async (id) => {
    const ticket = ++solicitud.current;
    if (!id) {
      setDatos({ indicadores: null, controles: [], reporte: null });
      return;
    }
    setCargandoDatos(true);
    try {
      const [indicadores, controles, reporte] = await Promise.all([
        api.indicadores(id),
        api.controles(id),
        api.reporte(id),
      ]);
      if (ticket !== solicitud.current) return;
      setDatos({ indicadores, controles, reporte });
      setError(null);
    } catch (e) {
      if (ticket === solicitud.current) setError(e);
    } finally {
      if (ticket === solicitud.current) setCargandoDatos(false);
    }
  }, []);

  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  useEffect(() => {
    cargarDatos(activaId);
  }, [activaId, cargarDatos]);

  const refrescar = useCallback(async () => {
    await Promise.all([cargarLista(), cargarDatos(activaId)]);
  }, [cargarLista, cargarDatos, activaId]);

  const activa = auditorias.find((a) => a.id_auditoria === activaId) || null;

  return {
    auditorias,
    activa,
    activaId,
    setActivaId,
    ...datos,
    cargandoLista,
    cargandoDatos,
    error,
    refrescar,
  };
}
