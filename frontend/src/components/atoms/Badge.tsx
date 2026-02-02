import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
}) => {
  const variants = {
    default: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
    primary: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
    success: 'bg-success-light dark:bg-success/20 text-success-dark dark:text-success',
    warning: 'bg-warning-light dark:bg-warning/20 text-warning-dark dark:text-warning',
    danger: 'bg-error-light dark:bg-error/20 text-error-dark dark:text-error',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
