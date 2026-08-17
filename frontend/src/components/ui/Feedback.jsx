import { Loader2, Star } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { formatPrice } from '../../lib/format.js';

export const Container = ({ className, children }) => (
  <div className={cn('mx-auto w-full max-w-[1400px] px-6 lg:px-10', className)}>
    {children}
  </div>
);

export const SectionHeading = ({ eyebrow, title, description, align = 'left', action }) => (
  <div
    className={cn(
      'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
      align === 'center' && 'md:flex-col md:items-center md:text-center'
    )}>
    <div className="max-w-2xl space-y-2">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && <h2 className="text-display-sm md:text-4xl">{title}</h2>}
      {description && (
        <p className="text-base leading-relaxed text-dark-600">{description}</p>
      )}
    </div>
    {action}
  </div>
);

export const Badge = ({ tone = 'neutral', className, children }) => {
  const tones = {
    neutral: 'bg-dark-200/70 text-dark-700',
    primary: 'bg-primary-800 text-cream',
    sale: 'bg-danger-600 text-white',
    sage: 'bg-secondary-700 text-cream',
    outline: 'border border-dark-300 text-dark-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em]',
        tones[tone],
        className
      )}>
      {children}
    </span>
  );
};

const STATUS_TONES = {
  pending: 'bg-warning-100 text-warning-800',
  processing: 'bg-primary-100 text-primary-800',
  shipped: 'bg-secondary-100 text-secondary-800',
  delivered: 'bg-success-100 text-success-800',
  cancelled: 'bg-danger-100 text-danger-700',
  paid: 'bg-success-100 text-success-800',
  failed: 'bg-danger-100 text-danger-700',
  refunded: 'bg-dark-200 text-dark-700',
  published: 'bg-success-100 text-success-800',
  hidden: 'bg-dark-200 text-dark-600',
  active: 'bg-success-100 text-success-800',
  draft: 'bg-warning-100 text-warning-800',
  archived: 'bg-dark-200 text-dark-600',
};

export const StatusPill = ({ status, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize',
      STATUS_TONES[status] ?? 'bg-dark-200 text-dark-700',
      className
    )}>
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {status}
  </span>
);

export const Price = ({ value, compareAt, size = 'md', className }) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={cn('font-medium text-primary-950', sizes[size])}>
        {formatPrice(value)}
      </span>
      {compareAt > value && (
        <span className="text-xs text-dark-400 line-through">
          {formatPrice(compareAt)}
        </span>
      )}
    </span>
  );
};

export const Rating = ({ value = 0, count, size = 14, className, showEmpty = true }) => {
  if (!count && !showEmpty) return null;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            width={size}
            height={size}
            className={
              star <= Math.round(value)
                ? 'fill-primary-500 text-primary-500'
                : 'text-dark-300'
            }
          />
        ))}
      </span>
      <span className="text-xs text-dark-500">
        {count ? `${value.toFixed(1)} (${count})` : 'No reviews yet'}
      </span>
    </span>
  );
};

export const Spinner = ({ className }) => (
  <Loader2 className={cn('h-5 w-5 animate-spin text-primary-700', className)} />
);

export const Skeleton = ({ className }) => (
  <div className={cn('skeleton rounded-sm', className)} />
);

export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 border border-dashed border-dark-300 px-6 py-16 text-center',
      className
    )}>
    {Icon && (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <Icon className="h-5 w-5" />
      </span>
    )}
    <h3 className="text-lg">{title}</h3>
    {description && (
      <p className="max-w-sm text-sm leading-relaxed text-dark-500">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="border border-danger-200 bg-danger-50 px-6 py-10 text-center">
    <p className="text-sm text-danger-700">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-primary-800 underline">
        Try again
      </button>
    )}
  </div>
);
