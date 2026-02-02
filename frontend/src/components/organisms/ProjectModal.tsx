'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useCreateProject } from '@/hooks/use-projects';
import { useUIStore } from '@/stores/ui-store';
import { extractErrorMessage } from '@/lib/api/response';
import { useTranslation } from 'react-i18next';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState(DEFAULT_COLORS[0]);
  const createProject = useCreateProject();
  const addToast = useUIStore((state) => state.addToast);

  const handleClose = () => {
    if (createProject.isPending) return;
    setName('');
    setColor(DEFAULT_COLORS[0]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createProject.mutateAsync({
        name: name.trim(),
        color,
      });
      addToast(t('success.projectCreated'), 'success');
      handleClose();
      onCreated?.();
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={handleClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md max-h-[92vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">프로젝트 추가</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500 dark:text-neutral-300" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-76px)]">
            <Input
              label="프로젝트 이름"
              placeholder="예: 개인, 업무"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">색상</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      color === c
                        ? 'border-neutral-900 dark:border-neutral-100 scale-110'
                        : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`color-${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button type="button" variant="outline" fullWidth onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" variant="primary" fullWidth isLoading={createProject.isPending}>
                생성
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
