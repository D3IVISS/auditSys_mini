export const ESTADOS = {
  IMPLEMENTADO: {
    label: 'Implementado',
    badge: 'text-emerald-300 bg-emerald-500/[0.08] ring-emerald-500/25',
    dot: 'bg-emerald-400',
    bar: 'bg-[#10B981]',
    print: 'text-emerald-800 bg-emerald-50 ring-emerald-200',
  },
  PARCIAL: {
    label: 'Parcial',
    badge: 'text-amber-300 bg-amber-500/[0.08] ring-amber-500/25',
    dot: 'bg-amber-400',
    bar: 'bg-[#F59E0B]',
    print: 'text-amber-800 bg-amber-50 ring-amber-200',
  },
  NO_IMPLEMENTADO: {
    label: 'No implementado',
    badge: 'text-rose-300 bg-rose-500/[0.08] ring-rose-500/25',
    dot: 'bg-rose-400',
    bar: 'bg-[#F43F5E]',
    print: 'text-rose-800 bg-rose-50 ring-rose-200',
  },
  NO_APLICABLE: {
    label: 'No aplicable',
    badge: 'text-zinc-400 bg-zinc-500/[0.08] ring-zinc-500/25',
    dot: 'bg-zinc-500',
    bar: 'bg-zinc-600 hatch',
    print: 'text-zinc-700 bg-zinc-100 ring-zinc-300',
  },
};

export const ORDEN_ESTADOS = ['IMPLEMENTADO', 'PARCIAL', 'NO_IMPLEMENTADO', 'NO_APLICABLE'];

export const CLAVE_CONTEO = {
  IMPLEMENTADO: 'implementados',
  PARCIAL: 'parciales',
  NO_IMPLEMENTADO: 'no_implementados',
  NO_APLICABLE: 'no_aplicables',
};

export const SEVERIDAD = {
  ALTA: { label: 'Alta', badge: 'text-rose-300 bg-rose-500/[0.08] ring-rose-500/25', print: 'text-rose-800 bg-rose-50 ring-rose-200' },
  MEDIA: { label: 'Media', badge: 'text-amber-300 bg-amber-500/[0.08] ring-amber-500/25', print: 'text-amber-800 bg-amber-50 ring-amber-200' },
  BAJA: { label: 'Baja', badge: 'text-sky-300 bg-sky-500/[0.08] ring-sky-500/25', print: 'text-sky-800 bg-sky-50 ring-sky-200' },
};
export const ORDEN_SEVERIDAD = ['ALTA', 'MEDIA', 'BAJA'];

export const CATEGORIAS = {
  ORGANIZACIONAL: { label: 'Organizacionales', clausula: '5' },
  PERSONAS: { label: 'De personas', clausula: '6' },
  FISICO: { label: 'Físicos', clausula: '7' },
  TECNOLOGICO: { label: 'Tecnológicos', clausula: '8' },
};

export const ESTADO_AUDITORIA = {
  BORRADOR: 'Borrador',
  EN_EJECUCION: 'En ejecución',
  EN_REVISION: 'En revisión',
  CERRADA: 'Cerrada',
};

export const TIPOS_EVIDENCIA = {
  DOCUMENTAL: 'Documental',
  ENTREVISTA: 'Entrevista',
  OBSERVACION: 'Observación',
  CAPTURA: 'Captura de pantalla',
  REGISTRO: 'Registro / bitácora',
};
