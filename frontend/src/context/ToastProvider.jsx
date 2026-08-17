import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/cn.js';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONES = {
  success: 'border-success-300 bg-success-50 text-success-900',
  error: 'border-danger-300 bg-danger-50 text-danger-900',
  info: 'border-dark-300 bg-white text-dark-800',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(
    (id) => setToasts((current) => current.filter((t) => t.id !== id)),
    []
  );

  const push = useCallback(
    (message, tone = 'info') => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, tone }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-2"
        role="status"
        aria-live="polite">
        {toasts.map(({ id, message, tone }) => {
          const Icon = ICONS[tone];
          return (
            <div
              key={id}
              className={cn(
                'pointer-events-auto flex animate-fade-up items-start gap-3 border px-4 py-3 text-sm shadow-lift',
                TONES[tone]
              )}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 leading-snug">{message}</p>
              <button
                onClick={() => dismiss(id)}
                aria-label="Dismiss"
                className="shrink-0 opacity-60 transition-opacity hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
};
