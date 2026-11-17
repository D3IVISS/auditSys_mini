import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

const INTERVALO_MS = 20000;

export function useApiHealth() {
  const [health, setHealth] = useState({ estado: 'verificando', detalle: null, latencia: null, verificadoEn: null });
  const enCurso = useRef(false);

  const verificar = useCallback(async () => {
    if (enCurso.current) return;
    enCurso.current = true;
    try {
      const data = await api.health();
      const ok = data?.status === 'ok' && data?.database?.status === 'UP';
      setHealth({
        estado: ok ? 'conectada' : 'sin_conexion',
        detalle: ok ? `PostgreSQL ${data.database.version}` : 'API activa · base de datos no disponible',
        latencia: ok ? data.database.latencia_ms : null,
        verificadoEn: new Date(),
      });
    } catch (error) {
      setHealth({ estado: 'sin_conexion', detalle: error.message, latencia: null, verificadoEn: new Date() });
    } finally {
      enCurso.current = false;
    }
  }, []);

  useEffect(() => {
    verificar();
    const id = setInterval(verificar, INTERVALO_MS);
    const onFocus = () => verificar();
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
    };
  }, [verificar]);

  return { ...health, verificar };
}
