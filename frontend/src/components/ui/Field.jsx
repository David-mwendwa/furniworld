import { forwardRef, useId } from 'react';
import { cn } from '../../lib/cn.js';

const controlClasses = (invalid) =>
  cn(
    'w-full rounded-sm border bg-white/70 px-4 text-sm text-dark-800 transition-colors duration-200 placeholder:text-dark-400',
    'focus:border-primary-600 focus:ring-0',
    invalid ? 'border-danger-400' : 'border-dark-300'
  );

export const FormField = ({ label, hint, error, required, htmlFor, children }) => (
  <div className="space-y-1.5">
    {label && (
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium uppercase tracking-[0.12em] text-dark-600">
        {label}
        {required && <span className="ml-1 text-danger-500">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-xs text-danger-600">{error}</p>
    ) : (
      hint && <p className="text-xs text-dark-500">{hint}</p>
    )}
  </div>
);

export const Input = forwardRef(
  ({ label, hint, error, required, className, id, ...props }, ref) => {
    const generated = useId();
    const fieldId = id || generated;

    return (
      <FormField
        label={label}
        hint={hint}
        error={error}
        required={required}
        htmlFor={fieldId}>
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(controlClasses(error), 'h-11', className)}
          {...props}
        />
      </FormField>
    );
  }
);
Input.displayName = 'Input';

export const Textarea = forwardRef(
  ({ label, hint, error, required, className, id, rows = 4, ...props }, ref) => {
    const generated = useId();
    const fieldId = id || generated;

    return (
      <FormField
        label={label}
        hint={hint}
        error={error}
        required={required}
        htmlFor={fieldId}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(controlClasses(error), 'py-3', className)}
          {...props}
        />
      </FormField>
    );
  }
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef(
  (
    { label, hint, error, required, className, id, options = [], children, ...props },
    ref
  ) => {
    const generated = useId();
    const fieldId = id || generated;

    return (
      <FormField
        label={label}
        hint={hint}
        error={error}
        required={required}
        htmlFor={fieldId}>
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(controlClasses(error), 'h-11', className)}
          {...props}>
          {children ??
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
      </FormField>
    );
  }
);
Select.displayName = 'Select';

export const Checkbox = ({ label, className, ...props }) => (
  <label className={cn('flex items-start gap-3 text-sm text-dark-700', className)}>
    <input
      type="checkbox"
      className="mt-0.5 h-4 w-4 rounded-sm border-dark-300 text-primary-700 focus:ring-secondary-600"
      {...props}
    />
    <span>{label}</span>
  </label>
);
