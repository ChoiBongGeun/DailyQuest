import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '../atoms/Card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
}) => {
  const colorStyles = {
    primary: {
      bg: 'bg-primary-100',
      icon: 'text-primary-600',
      text: 'text-primary-700',
    },
    success: {
      bg: 'bg-success-light',
      icon: 'text-success-dark',
      text: 'text-success-dark',
    },
    warning: {
      bg: 'bg-warning-light',
      icon: 'text-warning-dark',
      text: 'text-warning-dark',
    },
    danger: {
      bg: 'bg-error-light',
      icon: 'text-error-dark',
      text: 'text-error-dark',
    },
  };

  const styles = colorStyles[color];

  return (
    <Card padding="md" className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mb-2">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-success' : 'text-error'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-neutral-500">vs 지난주</span>
            </div>
          )}
        </div>

        <div className={cn('p-3 rounded-xl', styles.bg)}>
          <Icon className={cn('w-6 h-6', styles.icon)} />
        </div>
      </div>
    </Card>
  );
};
