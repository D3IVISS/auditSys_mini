const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal, timeout = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'TimeoutError')), timeout);
  if (signal) signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    const timedOut = controller.signal.reason?.name === 'TimeoutError';
    throw new ApiError(
      timedOut ? 'La API no respondió a tiempo.' : 'No fue posible conectar con la API. Verifique que el backend esté activo.',
      { code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR' },
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!response.ok) {
    throw new ApiError(data?.error || `Error HTTP ${response.status}`, {
      status: response.status,
      code: data?.code || 'HTTP_ERROR',
      details: data?.details || null,
    });
  }
  return data;
}

export const api = {
  baseUrl: BASE_URL,
  health: (opts) => request('/health', { ...opts, timeout: 8000 }).catch((error) => {
    if (error instanceof ApiError && error.status === 503) return { status: 'degraded', database: { status: 'DOWN' } };
    throw error;
  }),
  usuarios: (opts) => request('/usuarios', opts),
  auditorias: (opts) => request('/auditorias', opts),
  crearAuditoria: (body) => request('/auditorias', { method: 'POST', body }),
  controles: (idAuditoria, opts) =>
    request(`/controles${idAuditoria ? `?id_auditoria=${encodeURIComponent(idAuditoria)}` : ''}`, opts),
  evaluar: (body) => request('/evaluaciones/evaluar', { method: 'POST', body }),
  crearEvidencia: (body) => request('/evidencias', { method: 'POST', body }),
  crearHallazgo: (body) => request('/hallazgos', { method: 'POST', body }),
  indicadores: (id, opts) => request(`/auditorias/${encodeURIComponent(id)}/indicadores`, opts),
  reporte: (id, opts) => request(`/auditorias/${encodeURIComponent(id)}/reporte`, opts),
  emitirInforme: (id) => request(`/auditorias/${encodeURIComponent(id)}/informes`, { method: 'POST' }),
};
