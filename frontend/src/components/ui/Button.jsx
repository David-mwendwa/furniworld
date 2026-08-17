import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn.js';

const VARIANTS = {
  primary:
    'bg-primary-800 text-cream hover:bg-primary-900 disabled:hover:bg-primary-800',
  secondary:
    'bg-secondary-700 text-cream hover:bg-secondary-800 disabled:hover:bg-secondary-700',
  outline:
    'border border-primary-800 text-primary-900 hover:bg-primary-800 hover:text-cream',
  ghost: 'text-primary-900 hover:bg-primary-100',
  subtle: 'bg-primary-100 text-primary-900 hover:bg-primary-200',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
};

const SIZES = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-sm',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  to,
  href,
  ...props
}) => {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-sm font-medium uppercase tracking-[0.12em] transition-colors duration-200 ease-premium disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  if (to)
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );

  if (href)
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
};

export default Button;
