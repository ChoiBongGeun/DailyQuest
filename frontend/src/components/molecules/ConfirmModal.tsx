import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  isDestructive = true,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-sm border border-neutral-200 dark:border-neutral-800 animate-fadeIn">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              {isDestructive && (
                <div className="flex-shrink-0 w-10 h-10 bg-error-light dark:bg-error/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
              )}
              <div>
                <h3 id="confirm-modal-title" className="heading-4 text-neutral-900 dark:text-neutral-100 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant={isDestructive ? 'danger' : 'primary'}
                size="sm"
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmLabel ?? t('common.confirm')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
