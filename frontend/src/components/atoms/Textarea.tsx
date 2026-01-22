import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
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

        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
            'text-neutral-900 placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500',
            'resize-none',
            hasError
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
