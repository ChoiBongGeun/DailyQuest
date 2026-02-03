'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const tone = {
    success: 'border-success/30 bg-success-light text-success-dark',
    error: 'border-error/30 bg-error-light text-error-dark',
    info: 'border-primary-300 bg-primary-50 text-primary-700',
    warning: 'border-warning/30 bg-warning-light text-warning-dark',
  } as const;

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  } as const;

  return (
    <div className="fixed top-4 right-4 z-[70] w-[calc(100%-2rem)] sm:w-96 space-y-2">
      {toasts.map((toast) => {
        const ToastIcon = Icon[toast.type];
        return (
          <div
            key={toast.id}
            className={`border rounded-xl shadow-lg px-3 py-2.5 backdrop-blur-sm dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 ${tone[toast.type]}`}
          >
            <div className="flex items-start gap-2">
              <ToastIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm font-medium leading-5 flex-1 break-words">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="close-toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
