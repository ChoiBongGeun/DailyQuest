import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      options,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-neutral-700">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 appearance-none',
              'text-neutral-900 bg-white cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500',
              hasError
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
        </div>

        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            hasError ? 'text-error' : 'text-neutral-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
