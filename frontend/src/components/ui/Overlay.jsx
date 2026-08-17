import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn.js';

const useDialog = (open, onClose) => {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // Fires for the Escape key as well as a programmatic close.
    const handleClose = () => onClose?.();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return ref;
};

export const Drawer = ({ open, onClose, title, footer, children }) => {
  const ref = useDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      className="app-dialog m-0 ml-auto h-full max-h-full w-full max-w-md animate-drawer-in bg-cream p-0 text-dark-800"
      onClick={(event) => {
        if (event.target === ref.current) onClose?.();
      }}>
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-dark-200 px-6 py-5">
          <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em] text-primary-950">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm p-1 text-dark-500 transition-colors hover:bg-primary-100 hover:text-primary-900">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="border-t border-dark-200 px-6 py-5">{footer}</footer>
        )}
      </div>
    </dialog>
  );
};

export const Sheet = ({ open, onClose, title, children }) => {
  const ref = useDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      className="app-dialog m-0 mt-auto max-h-[85vh] w-full max-w-full animate-sheet-in rounded-t-xl bg-cream p-0 text-dark-800"
      onClick={(event) => {
        if (event.target === ref.current) onClose?.();
      }}>
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-center justify-between border-b border-dark-200 px-5 py-4">
          <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
            {title}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-dark-500">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </dialog>
  );
};

export const Modal = ({ open, onClose, title, description, footer, children }) => {
  const ref = useDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      className="app-dialog w-full max-w-lg animate-scale-in rounded-sm bg-cream p-0 text-dark-800"
      onClick={(event) => {
        if (event.target === ref.current) onClose?.();
      }}>
      <div className="px-7 py-6">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-sans text-lg font-medium text-primary-950">{title}</h2>
            {description && (
              <p className="text-sm leading-relaxed text-dark-600">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm p-1 text-dark-500 hover:bg-primary-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children && <div className="mt-5">{children}</div>}
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </dialog>
  );
};
