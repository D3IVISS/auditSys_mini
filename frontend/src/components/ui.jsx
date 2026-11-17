import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { ESTADOS, SEVERIDAD } from '../lib/meta';
import { cx } from '../lib/format';

export function Card({ className, children, ...props }) {
  return (
    <section className={cx('card', className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, actions, className }) {
  return (
    <header className={cx('flex items-start justify-between gap-4 border-b border-zinc-800/90 px-5 py-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-base text-zinc-400">
            <Icon size={15} strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-zinc-100">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

const VARIANTES = {
  primary:
    'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 border border-emerald-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
  secondary: 'bg-raised text-zinc-200 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700',
  ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent',
  danger: 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30',
};

export function Button({ variant = 'secondary', size = 'md', icon: Icon, loading, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3.5 text-sm',
        VARIANTES[variant],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} strokeWidth={2} /> : null}
      {children}
    </button>
  );
}

export function StatusBadge({ estado, size = 'md', print = false }) {
  if (!estado) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wide text-zinc-500 ring-1 ring-inset ring-zinc-800">
        <span className="h-1.5 w-1.5 rounded-full border border-zinc-600" />
        Sin evaluar
      </span>
    );
  }
  const meta = ESTADOS[estado];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded font-mono uppercase tracking-wide ring-1 ring-inset',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-1.5 py-0.5 text-2xs',
        print ? meta.print : meta.badge,
      )}
    >
      <span className={cx('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {estado}
    </span>
  );
}

export function SeverityBadge({ severidad, prefix = '', print = false }) {
  const meta = SEVERIDAD[severidad];
  if (!meta) return null;
  return (
    <span
      className={cx(
        'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wide ring-1 ring-inset',
        print ? meta.print : meta.badge,
      )}
    >
      {prefix}
      {severidad}
    </span>
  );
}

export function Code({ children, className }) {
  return <span className={cx('num text-[12px] font-medium text-zinc-100', className)}>{children}</span>;
}

export function Chip({ children, className }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded border border-zinc-800 bg-base px-1.5 py-0.5 font-mono text-2xs tabular-nums text-zinc-300',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <Loader2 size={14} className="animate-spin text-emerald-400" />
      {label}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-base text-zinc-500">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      )}
      <p className="text-sm font-medium text-zinc-200">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Alert({ tone = 'warning', children, className }) {
  const tones = {
    warning: 'border-amber-500/25 bg-amber-500/[0.06] text-amber-200',
    error: 'border-rose-500/25 bg-rose-500/[0.06] text-rose-200',
    info: 'border-zinc-700 bg-zinc-800/30 text-zinc-300',
  };
  return (
    <div className={cx('flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-xs leading-relaxed', tones[tone], className)}>
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Field({ label, required, error, hint, children, className }) {
  const id = useId();
  return (
    <div className={cx('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="flex items-center gap-1 text-xs font-medium text-zinc-300">
          {label}
          {required && <span className="text-emerald-400">*</span>}
        </label>
      )}
      {typeof children === 'function' ? children({ id, invalid: Boolean(error) }) : children}
      {error ? (
        <p className="text-2xs text-rose-300" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-2xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children, footer, width = 'max-w-xl' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('input, textarea, select')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={panelRef}
        className={cx(
          'relative flex max-h-[92vh] w-full flex-col rounded-t-xl border border-zinc-800 bg-panel shadow-sheet sm:rounded-xl',
          width,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-800/90 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
            <X size={16} />
          </button>
        </header>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-zinc-800/90 px-5 py-3.5">{footer}</footer>}
      </div>
    </div>
  );
}

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((mensaje, tono = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, mensaje, tono }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="no-print pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              'pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-panel px-3.5 py-3 text-xs shadow-sheet',
              t.tono === 'error' ? 'border-rose-500/30 text-rose-200' : 'border-zinc-700 text-zinc-200',
            )}
          >
            {t.tono === 'error' ? (
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
            )}
            <span className="leading-relaxed">{t.mensaje}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export function SegmentedEstado({ value, onChange, opciones }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="radiogroup">
      {opciones.map((estado) => {
        const meta = ESTADOS[estado];
        const activo = value === estado;
        return (
          <button
            key={estado}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(estado)}
            className={cx(
              'flex min-h-[44px] items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors',
              activo
                ? 'border-zinc-600 bg-zinc-800/70 text-zinc-100'
                : 'border-zinc-800 bg-base text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
            )}
          >
            <span className={cx('h-2 w-2 shrink-0 rounded-full', meta.dot, !activo && 'opacity-60')} />
            <span className="truncate">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
