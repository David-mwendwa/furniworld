import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

export const QuantityStepper = ({ value, onChange, max = 20, min = 1, disabled }) => (
  <div className="inline-flex items-center border border-dark-300">
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={disabled || value <= min}
      aria-label="Decrease quantity"
      className="flex h-10 w-10 items-center justify-center text-dark-600 transition-colors hover:bg-primary-100 disabled:opacity-40 disabled:hover:bg-transparent">
      <Minus className="h-3.5 w-3.5" />
    </button>
    <span className="w-10 text-center text-sm font-medium tabular-nums">{value}</span>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={disabled || value >= max}
      aria-label="Increase quantity"
      className="flex h-10 w-10 items-center justify-center text-dark-600 transition-colors hover:bg-primary-100 disabled:opacity-40 disabled:hover:bg-transparent">
      <Plus className="h-3.5 w-3.5" />
    </button>
  </div>
);

export const Pagination = ({ page, pages, onChange, className }) => {
  if (pages <= 1) return null;

  const window = [];
  const from = Math.max(1, Math.min(page - 1, pages - 2));
  for (let n = from; n <= Math.min(pages, from + 2); n += 1) window.push(n);

  return (
    <nav
      className={cn('flex items-center justify-center gap-2', className)}
      aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center border border-dark-300 text-dark-600 transition-colors hover:bg-primary-100 disabled:opacity-40 disabled:hover:bg-transparent">
        <ChevronLeft className="h-4 w-4" />
      </button>

      {from > 1 && (
        <>
          <PageButton n={1} active={page === 1} onChange={onChange} />
          <span className="px-1 text-dark-400">…</span>
        </>
      )}

      {window.map((n) => (
        <PageButton key={n} n={n} active={n === page} onChange={onChange} />
      ))}

      {from + 2 < pages && (
        <>
          <span className="px-1 text-dark-400">…</span>
          <PageButton n={pages} active={page === pages} onChange={onChange} />
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center border border-dark-300 text-dark-600 transition-colors hover:bg-primary-100 disabled:opacity-40 disabled:hover:bg-transparent">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

const PageButton = ({ n, active, onChange }) => (
  <button
    onClick={() => onChange(n)}
    aria-current={active ? 'page' : undefined}
    className={cn(
      'h-10 w-10 border text-sm transition-colors',
      active
        ? 'border-primary-800 bg-primary-800 text-cream'
        : 'border-dark-300 text-dark-600 hover:bg-primary-100'
    )}>
    {n}
  </button>
);

export const Breadcrumbs = ({ items, className }) => (
  <nav className={cn('flex flex-wrap items-center gap-2 text-xs', className)}>
    {items.map((item, index) => (
      <span key={item.label} className="flex items-center gap-2">
        {index > 0 && <span className="text-dark-300">/</span>}
        {item.to ? (
          <Link
            to={item.to}
            className="text-dark-500 transition-colors hover:text-primary-800">
            {item.label}
          </Link>
        ) : (
          <span className="text-dark-700">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export const Stepper = ({ steps, current, className }) => (
  <ol className={cn('flex items-center gap-3 text-xs', className)}>
    {steps.map((step, index) => {
      const state =
        index < current ? 'done' : index === current ? 'current' : 'upcoming';

      return (
        <li key={step} className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border text-[0.7rem] font-medium',
              state === 'done' && 'border-primary-800 bg-primary-800 text-cream',
              state === 'current' && 'border-primary-800 text-primary-900',
              state === 'upcoming' && 'border-dark-300 text-dark-400'
            )}>
            {index + 1}
          </span>
          <span
            className={cn(
              'uppercase tracking-[0.14em]',
              state === 'upcoming' ? 'text-dark-400' : 'text-primary-900'
            )}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <span className="hidden h-px w-8 bg-dark-300 sm:block" />
          )}
        </li>
      );
    })}
  </ol>
);
